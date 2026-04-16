import { HttpClient } from "@angular/common/http";
import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { Options as ImageLayerOptions } from "ol/layer/BaseImage";
import { Options as TileLayerOptions } from "ol/layer/BaseTile";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { TileWMS } from "ol/source";
import ImageSource from "ol/source/Image";
import ImageWMS, { Options as ImageSourceOptions } from "ol/source/ImageWMS";
import TileSource from "ol/source/Tile";
import { Options as TileSourceOptions } from "ol/source/TileWMS";
import { noop } from "rxjs";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { AbstractClickableLayerComponent } from "../abstract-clickable-layer/abstract-clickable-layer.component";
import { WmsLayerOptions } from "../model/wms-layer.model";
import { CoreWmsWmtsCapabilitiesService } from "../service/core-wms-wmts-capabilities.service";
import { viewResolutionIsInLayerResolutionRange } from "../utils/viewResolutionIsInLayerResolutionRange";
import { DEVICE_PIXEL_RATIO } from "ol/has";

/**
 * Door `<ggc-wms-layer></ggc-wms-layer>` op te nemen in de HTML kunnen WMS-kaarten
 * worden toegevoegd, bijvoorbeeld afkomstig van PDOK. Binnen deze tags kunnen
 * onder andere de WMS url, de gewenste kaartlagen en de minimale- en maximale
 * resolutie worden ingesteld en events worden opgevangen. Ook kan ingesteld worden
 * dat de WMS-kaart als tiled-WMS wordt weergegeven.
 *
 * @example
 * <ggc-wms-layer [options]="wmsLayerOptions"></ggc-wms-layer>
 */
@Component({
  selector: "ggc-wms-layer",
  template: ""
})
export class GgcWmsLayerComponent
  extends AbstractClickableLayerComponent<
    ImageLayer<ImageSource> | TileLayer<TileSource>
  >
  implements OnInit, OnDestroy
{
  /** Opties voor de WMS-laag. */
  @Input() options?: WmsLayerOptions;

  /** Interne referentie naar de WMS-bron. */
  private wmsSource: ImageWMS | TileWMS;

  private readonly capabilitiesService = inject(CoreWmsWmtsCapabilitiesService);
  private readonly httpClient = inject(HttpClient);

  /** Initialiseert de WMS-laag en haalt optioneel capabilities op. */
  ngOnInit(): void {
    super.ngOnInit();

    if (this.options != undefined && this.options?.layers == undefined) {
      this.options.layers = this.options?.layerName;
    }

    const urlForCapabilities =
      this.options?.url || this.options?.sourceOptions?.url;
    if (this.options?.getCapabilities !== false && urlForCapabilities) {
      this.capabilitiesService
        .getCapabilitiesForUrl(
          urlForCapabilities,
          "WMS",
          this.options?.sourceOptions?.crossOrigin === "withCredentials"
        )
        .subscribe((result) => {
          this.events.emit(
            new MapComponentEvent(
              MapComponentEventTypes.WMSCAPABILITIES,
              this.mapIndex,
              "WMS capabilities resultaten:",
              this.layerName,
              result as Record<string, any>
            )
          );
        }, noop);
    }

    const params: { [x: string]: any } = this.makeParamsKeysUppercase({
      ...this.options?.sourceOptions?.params,
      ...(this.options?.layers && { layers: this.options?.layers })
    });

    this.addDpiToParams(params, DEVICE_PIXEL_RATIO);

    const sourceOptions: TileSourceOptions | ImageSourceOptions = {
      crossOrigin: "anonymous",
      serverType: "geoserver",
      ...this.options?.sourceOptions,
      params,
      ...(this.options?.url && { url: this.options?.url }),
      projection: this.rdNewConfig.projectionCode
    };

    const layerOptions:
      | ImageLayerOptions<ImageSource>
      | TileLayerOptions<TileSource> = {
      ...this.options?.layerOptions,
      ...this.layerOptions
    };

    if (this.options?.tiled) {
      if (this.options?.gutter) {
        // set gutter to prevent that icons and labels are clipped at the edges of the tiles.
        (sourceOptions as TileSourceOptions).gutter = this.options.gutter;
      }
      this.wmsSource = new TileWMS(sourceOptions as TileSourceOptions);
      layerOptions.source = this.wmsSource;
      this.setLayer(
        new TileLayer(layerOptions as TileLayerOptions<TileSource>)
      );
    } else {
      this.wmsSource = new ImageWMS(sourceOptions as ImageSourceOptions);
      layerOptions.source = this.wmsSource;
      this.setLayer(
        new ImageLayer(layerOptions as ImageLayerOptions<ImageSource>)
      );
    }
  }

  /**
   * Voert een `GetFeatureInfo` request uit op basis van een klik op de kaart.
   * @param evt Het MapBrowserEvent met kliklocatie.
   */
  getFeatureInfo(evt: MapBrowserEvent): void {
    const coordinate = evt.coordinate;
    const viewResolution = this.map.getView().getResolution();
    if (
      viewResolution &&
      viewResolutionIsInLayerResolutionRange(
        viewResolution,
        this.olLayer.getMinResolution(),
        this.olLayer.getMaxResolution()
      )
    ) {
      const querylayers =
        this.options?.getFeatureInfoQueryLayers ||
        this.options?.layers ||
        this.options?.sourceOptions?.params?.layers;
      const featureInfoUrl = this.wmsSource.getFeatureInfoUrl(
        coordinate,
        viewResolution,
        this.rdNewConfig.projectionCode,
        {
          INFO_FORMAT: "application/json",
          // query_layers lijkt voor sommige wms-en nodig
          QUERY_LAYERS: querylayers,
          FEATURE_COUNT: this.maxFeaturesOnSingleclick
        }
      );
      if (featureInfoUrl !== undefined) {
        this.httpClient.get(featureInfoUrl).subscribe(
          (data) => {
            const formatGeoJSON = new GeoJSON();
            const features: Feature<Geometry>[] =
              formatGeoJSON.readFeatures(data);
            this.emitFeatureInfoEvent(features, coordinate);
          },
          (error) => {
            this.emitFeatureInfoEvent(
              [],
              coordinate,
              "Kon geen features ophalen van featureInfoUrl vanwege " +
                error.statusText
            );
          }
        );
      } else {
        this.emitFeatureInfoEvent(
          [],
          coordinate,
          "Geen featureInfoUrl gevonden"
        );
      }
    } else {
      this.emitFeatureInfoEvent(
        [],
        coordinate,
        "Binnen deze resolutie zijn er geen features gevonden."
      );
    }
  }

  /** Verwijdert de laag en voert opruimacties uit. */
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Past meerdere stijlen toe op de WMS-laag.
   * @param styles Een array van stijlstrings.
   */
  public setStyles(styles: string[]): void {
    this.wmsSource.updateParams({ STYLES: styles });
    this.updateLocalSourceOptionsFromWmsSource();
  }

  /**
   * Past een specifieke stijl toe op een specifieke sublaag.
   * @param style De stijlnaam.
   * @param layerName De naam van de sublaag waarop de stijl moet worden toegepast.
   */
  public setStyle(style: string, layerName: string): void {
    const currentParams = this.wmsSource.getParams();
    const currentLayers = Object.entries(currentParams)
      .filter(([key, item]) => key.toLowerCase() === "layers")
      .map((items) => items[1])[0];
    const currentStyles = Object.entries(currentParams)
      .filter(([key, item]) => key.toLowerCase() === "styles")
      .map((items) => items[1])[0];

    if (typeof currentLayers === "string") {
      if (currentLayers === layerName) {
        this.wmsSource.updateParams({ STYLES: style });
        this.updateLocalSourceOptionsFromWmsSource();
      }
      return;
    } else if (Array.isArray(currentLayers)) {
      const index = currentLayers.indexOf(layerName);

      if (index == -1) {
        return;
      }

      let newStyles;
      if (Array.isArray(currentStyles)) {
        // The styles array is already created
        newStyles = currentStyles.with(index, style);
      } else {
        // Create the style array with the necessary size
        newStyles = new Array(currentLayers.length).fill("");
        newStyles[index] = style;
      }
      this.wmsSource.updateParams({ STYLES: newStyles });
      this.updateLocalSourceOptionsFromWmsSource();
    }
  }

  /** Werkt de lokale sourceOptions.params bij op basis van de WMS-bron. */
  private updateLocalSourceOptionsFromWmsSource(): void {
    this.options = this.options ?? {};
    this.options.sourceOptions = this.options.sourceOptions ?? {};
    this.options.sourceOptions.params = this.wmsSource.getParams();
  }

  /**
   * Emit een feature info event met de opgehaalde features.
   * @param features De gevonden features.
   * @param coordinate De kliklocatie.
   * @param message Optioneel bericht.
   */
  private emitFeatureInfoEvent(
    features: Feature<Geometry>[],
    coordinate: Coordinate,
    message = "WMS getFeatureInfo resultaten: "
  ): void {
    if (this.layerName) {
      this.coreSelectionService.handleFeatureInfoForLayer(
        this.mapIndex,
        coordinate,
        features,
        this.layerName
      );
    }
    this.events.emit(
      new MapComponentEvent(
        MapComponentEventTypes.WMSFEATUREINFO,
        this.mapIndex,
        message,
        this.layerName,
        features
      )
    );
  }

  /**
   * Voegt DPI-gerelateerde parameters toe aan de WMS-request.
   * @param params De bestaande WMS-parameters.
   * @param DEVICE_PIXEL_RATIO De pixelratio van het apparaat.
   */
  private addDpiToParams(
    params: { [p: string]: any },
    DEVICE_PIXEL_RATIO: number
  ) {
    // Pixelratio conform openlayers
    // https://github.com/openlayers/openlayers/blob/v8.2.0/src/ol/source/wms.js#L90
    if (DEVICE_PIXEL_RATIO !== 1) {
      const dpi = Math.floor(90 * DEVICE_PIXEL_RATIO + 0.5);
      params.DPI = dpi;
      params.MAP_RESOLUTION = dpi;
    }
  }

  /**
   * Zet alle keys van de WMS-parameters om naar hoofdletters.
   * @param params De originele parameters.
   * @returns De aangepaste parameters met hoofdletter-keys.
   */
  private makeParamsKeysUppercase(params: { [p: string]: any }): {
    [x: string]: any;
  } {
    const paramsUppercase: { [p: string]: any } = {};
    Object.entries(params).forEach(([key, param]) => {
      paramsUppercase[key.toUpperCase()] = param;
    });
    return paramsUppercase;
  }
}
