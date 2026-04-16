import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from "@angular/core";
import { applyStyle } from "ol-mapbox-style";
import { getTopLeft } from "ol/extent";
import Feature, { FeatureLike } from "ol/Feature";
import { MVT } from "ol/format";
import { Geometry } from "ol/geom";
import VectorTileLayer from "ol/layer/VectorTile";
import MapBrowserEvent from "ol/MapBrowserEvent";
import VectorTileSource, {
  Options as VectorOptions
} from "ol/source/VectorTile";
import TileGrid from "ol/tilegrid/TileGrid";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { AbstractClickableLayerComponent } from "../abstract-clickable-layer/abstract-clickable-layer.component";
import { VectorTileLayerOptions } from "../model/vector-tile-layer.model";
import BaseLayer from "ol/layer/Base";
import { zoomlevelToResolution } from "../../utils/epsg28992";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "ggc-vector-tile-layer",
  template: ""
})
/**
 * Door <ggc-vector-tile-layer></ggc-vector-tile-layer> op te nemen in de HTML
 * kunnen kaartlagen worden getoond die opgebouwd worden door middel van vector
 * tiles. Let op ggc-vector-tile-layer kan nog niet geprint worden met de print-services.
 *
 * @example
 * import { VectorTileLayerOptions } from "@kadaster/ggc-map";
 *
 * const vectorTileLayerOptions: VectorTileLayerOptions = {
 *     url: "https://api.pdok.nl/lv/bgt/ogc/v1/tiles/NetherlandsRDNewQuad/{z}/{y}/{x}?f=mvt",
 *     minResolution: 0,
 *     maxResolution: 4,
 *     zIndex: 3,
 *     getFeatureInfoOnSingleclick: true,
 *     maxFeaturesOnSingleclick: 15,
 *     hitTolerance: 6,
 *     style: "https://api.pdok.nl/lv/bgt/ogc/v1/styles/bgt_achtergrondvisualisatie",
 *     attributions: "Attributie voor deze Vector Tile kaartlaag",
 *     mapIndex: "vectortile",
 *     layerName: "Vector Tile kaartlaag"
 * };
 *
 * <ggc-vector-tile-layer [options]="vectorTileLayerOptions" (events)="logGetFeatureInfoEvents($event)">
 *   </ggc-vector-tile-layer>
 */
export class GgcVectorTileLayerComponent
  extends AbstractClickableLayerComponent<VectorTileLayer>
  implements OnChanges, OnDestroy, OnInit
{
  /**
   * Opties voor configuratie van de vector tile laag.
   * Zie VectorTileLayerOptions voor beschikbare instellingen.
   */
  @Input()
  options?: VectorTileLayerOptions;

  /**
   * Angular HttpClient voor het ophalen van externe JSON-bestanden zoals stijl- of tile-informatie.
   */
  private readonly httpClient = inject(HttpClient);

  /**
   * De bron van de vector tile laag, geconfigureerd met tileGrid en andere instellingen.
   * Zie VectorTileSource.
   */
  private vectorTileSource: VectorTileSource;

  /**
   * Interne lijst van gevonden features bij een klik op de kaart.
   * Wordt gebruikt voor het genereren van feature info events.
   */
  private foundFeatures: Array<Feature<Geometry>> = [];

  /**
   * Angular lifecycle hook die wordt aangeroepen bij initialisatie van de component.
   * Initialiseert de vector tile source en laag.
   */
  ngOnInit() {
    super.ngOnInit();
    this.createVectorTileSource().then((source) => {
      this.vectorTileSource = source;
      const vectorTileLayer = this.createVectorTileLayer();
      // Set style before adding layer preventing flickering
      this.setStyle(vectorTileLayer, false);
      this.setLayer(vectorTileLayer);
    });
  }

  /**
   * Maakt een nieuwe VectorTileLayer instantie met configuratieopties.
   * Wordt gebruikt als renderlaag in de kaart.
   */
  private createVectorTileLayer() {
    return new VectorTileLayer({
      renderMode: "hybrid",
      declutter: true,
      useInterimTilesOnError: false,
      ...this.options?.layerOptions,
      ...this.layerOptions,
      source: this.vectorTileSource
    });
  }

  /**
   * Genereert een TileGrid op basis van resoluties en extent.
   * Ondersteunt overzoom indien geactiveerd.
   */
  private async createTileGrid() {
    return new TileGrid({
      resolutions:
        (this.options?.enableOverzoom ?? false)
          ? await this.createOverzoomResolutions()
          : this.crsConfig.getRdNewCrsConfig().resolutions,
      extent: this.crsConfig.getRdNewCrsConfig().extent,
      tileSize: this.options?.tileSize || [256, 256],
      origin: getTopLeft(this.crsConfig.getRdNewCrsConfig().extent)
    });
  }

  /**
   * Update de vector tile source van de laag indien overzoom is ingeschakeld.
   * Wordt aangeroepen bij stijlwijzigingen.
   */
  private async updateOverzoomSettings(layer: VectorTileLayer) {
    this.vectorTileSource = await this.createVectorTileSource();
    layer.setSource(this.vectorTileSource);
    layer.getSource()!.changed();
  }

  /**
   * Maakt een nieuwe VectorTileSource op basis van configuratieopties.
   * Ondersteunt attributies, URL en tileGrid.
   */
  private async createVectorTileSource(): Promise<VectorTileSource> {
    const options: VectorOptions = {
      // Zie TMS-9812, https://github.com/openlayers/openlayers/issues/15929
      // @ts-ignore
      format: new MVT({ featureClass: Feature as any }),
      ...this.options?.sourceOptions,
      ...(this.attributions && { attributions: this.attributions }),
      ...(this.options?.url && { url: this.options?.url }),
      projection: this.crsConfig.getRdNewCrsConfig().projectionCode,
      tileGrid: await this.createTileGrid()
    };
    return new VectorTileSource(options);
  }

  /**
   * Genereert een lijst van resoluties voor overzoom op basis van maxZoom.
   * Filtert resoluties lager dan de minimale resolutie.
   */
  private async createOverzoomResolutions() {
    const maxZoom = await this.getMaxZoom();
    const resolutions = this.crsConfig.getRdNewCrsConfig().resolutions;
    if (maxZoom) {
      const minResolution = zoomlevelToResolution(maxZoom);
      return resolutions.filter((resolution) => {
        return resolution >= minResolution;
      });
    } else {
      return resolutions;
    }
  }

  /**
   * Bepaalt de maximale zoomwaarde uit configuratie, tile URL of stijl URL.
   * Wordt gebruikt voor overzoom functionaliteit.
   */
  private async getMaxZoom(): Promise<number | undefined> {
    if (this.options?.sourceOptions?.maxZoom) {
      return this.options?.sourceOptions?.maxZoom;
    }

    if (this.options?.url) {
      const result = await this.getMaxZoomFromUrl(this.options?.url);
      if (result) {
        return result;
      }
    }

    if (this.options?.style && typeof this.options?.style === "string") {
      const result = await this.getMaxZoomFromStyleUrl(this.options?.style);
      if (result) {
        return result;
      }
    }

    console.error(
      "Could not get a max zoom from the available sources for the overzoom"
    );
    return undefined;
  }

  /**
   * Haalt de maximale zoomwaarde op uit een tile URL via een tilejson request.
   *
   * @param tileUrl - De URL van de tile endpoint (bijv. met /{z}/{x}/{y}).
   * @returns De maximale zoomwaarde indien beschikbaar, anders undefined.
   */
  private async getMaxZoomFromUrl(
    tileUrl: string
  ): Promise<number | undefined> {
    try {
      const url = tileUrl.split("/{z}/{y}/{x}")[0] + "?f=tilejson";
      const json = await this.getJsonFromUrl(url);
      return json.maxzoom ?? undefined;
    } catch (e) {
      console.error(`Could not get the json from the tile url ${tileUrl}`);
      return undefined;
    }
  }

  /**
   * Haalt de minimale maxzoom op uit alle bronnen in een Mapbox stijlbestand.
   *
   * @param styleUrl - De URL naar het Mapbox stijlbestand.
   * @returns De laagste maxzoom waarde van alle bronnen indien beschikbaar, anders undefined.
   */
  private async getMaxZoomFromStyleUrl(
    styleUrl: string
  ): Promise<number | undefined> {
    let json;
    try {
      json = await this.getJsonFromUrl(styleUrl);
    } catch (e) {
      console.error(`Could not get the json from the style url ${styleUrl}`);
      return undefined;
    }
    const sources = json.sources;

    if (sources) {
      const maxZooms: number[] = [];
      for (const key in sources) {
        const source = sources[key];
        if (source.maxzoom) {
          maxZooms.push(source.maxzoom);
        } else if (source.tiles) {
          for (const tileUrl of source.tiles) {
            const result = await this.getMaxZoomFromUrl(tileUrl);
            if (result) {
              maxZooms.push(result);
            }
          }
        }
      }
      if (maxZooms.length > 0) {
        return Math.min(...maxZooms);
      }
    }
    return undefined;
  }

  /**
   * Voert een HTTP GET request uit naar een URL en retourneert de JSON response.
   * Wordt gebruikt voor tilejson en stijlbestanden.
   */
  private async getJsonFromUrl(url: string): Promise<any> {
    try {
      const response$ = this.httpClient.get(url);
      return await firstValueFrom(response$);
    } catch (e) {
      console.error(`Could not fetch JSON from ${url}`);
      throw new Error(`Could not fetch JSON from ${url}`);
    }
  }

  /**
   * Filterfunctie om te bepalen of een laag overeenkomt met de huidige OpenLayers laag.
   * Wordt gebruikt bij feature selectie.
   */
  private decideLayerCandidate(layerCandidate: BaseLayer) {
    return this.olLayer === layerCandidate;
  }

  /**
   * Verwerkt een klik op de kaart en haalt feature informatie op.
   * Emit een MapComponentEvent met gevonden features.
   */
  getFeatureInfo(event: MapBrowserEvent) {
    const pixel = event.pixel;

    this.map.forEachFeatureAtPixel(
      pixel,
      (feature) => this.limitFeatures(feature),
      {
        layerFilter: this.decideLayerCandidate.bind(this),
        hitTolerance: this.options?.hitTolerance
      }
    );
    const foundFeaturesCopy = this.foundFeatures.slice();
    if (this.layerName) {
      this.coreSelectionService.handleFeatureInfoForLayer(
        this.mapIndex,
        event.coordinate,
        foundFeaturesCopy,
        this.layerName
      );
    }
    const mapComponentEvent = new MapComponentEvent(
      MapComponentEventTypes.VECTORFEATUREINFO,
      this.mapIndex,
      "VectorTileLayer getFeatureInfo resultaten: ",
      this.layerName,
      foundFeaturesCopy
    );
    this.events.emit(mapComponentEvent);
    this.foundFeatures = [];
  }

  /**
   * Beperkt het aantal geselecteerde features bij een klik tot een maximum.
   * Voegt geldige features toe aan de interne lijst.
   */
  private limitFeatures(feature: FeatureLike) {
    if (this.foundFeatures.length < this.maxFeaturesOnSingleclick) {
      // feature as Feature, because VectorTileSource contains Features. RenderFeatures are used for VectorTileLayer
      this.foundFeatures.push(feature as Feature<Geometry>);
    }
  }

  /**
   * Laadt een Mapbox stijlbestand en past de stijl toe op de vector tile laag.
   * Ondersteunt meerdere bronnen in het stijlbestand.
   */
  private async loadStyle(url: string) {
    try {
      const json = await this.getJsonFromUrl(url);
      Object.keys(json.sources).forEach((key) => {
        applyStyle(this.olLayer, json, key);
      });
    } catch (e) {
      console.error(`Failed to load style from ${url}`);
    }
  }

  /**
   * Past de stijl toe op de vector tile layer. Ondersteunt zowel string URL als OL stijlobject.
   *
   * @param layer - De VectorTileLayer waarop de stijl wordt toegepast.
   * @param updateOverzoomSettings - Of overzoom instellingen moeten worden bijgewerkt.
   */
  private setStyle(
    layer: VectorTileLayer,
    updateOverzoomSettings = true
  ): void {
    if (typeof this.options?.style === "string") {
      this.loadStyle(this.options?.style as string);
    } else {
      layer.setStyle(this.options?.style || this.options?.layerOptions?.style);
    }

    if (updateOverzoomSettings && this.options?.enableOverzoom) {
      this.updateOverzoomSettings(layer);
    }
  }

  /**
   * Angular lifecycle hook die wordt aangeroepen bij het vernietigen van de component.
   * Roept de parent destructor aan.
   */
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Angular lifecycle hook die wordt aangeroepen bij wijzigingen in input properties.
   * Past stijl aan indien opties of stijl zijn gewijzigd.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.style && this.olLayer) {
      this.setStyle(this.olLayer);
    }

    if (changes.options && !changes.options.firstChange) {
      if (
        this.options?.layerOptions?.style !==
        changes.options.previousValue.layerOptions?.style
      ) {
        this.setStyle(this.olLayer);
      }
      if (this.options?.style !== changes.options.previousValue.style) {
        this.setStyle(this.olLayer);
      }
    }
  }
}
