import { Component, inject, model, OnDestroy, OnInit } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import MapBrowserEvent from "ol/MapBrowserEvent";
import TileSource from "ol/source/Tile";
import WMTS, {
  optionsFromCapabilities,
  Options as WmtsSourceOptions
} from "ol/source/WMTS";
import { Subscription } from "rxjs";
import { AbstractClickableLayer } from "../abstract-clickable-layer/abstract-clickable-layer.directive";
import { Capabilities } from "../model/capabilities.model";
import { WmtsLayerOptions } from "../model/wmts-layer.model";
import { viewResolutionIsInLayerResolutionRange } from "../utils/viewResolutionIsInLayerResolutionRange";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import { GgcCapabilitiesService } from "../service/ggc-capabilities.service";

/**
 * Door `<ggc-wmts-layer></ggc-wmts-layer>` op te nemen in de HTML kunnen WMTS-kaarten
 * worden toegevoegd, bijvoorbeeld afkomstig van PDOK. Binnen deze tags kunnen onder
 * andere de WMTS url, de gewenste kaartlaag en de minimale- en maximale resolutie
 * worden ingesteld.
 *
 * @example
 * <ggc-wmts-layer [options]="wmtsOptions"></ggc-wmts-layer>
 */
@Component({
  selector: "ggc-wmts-layer",
  template: ""
})
export class GgcWmtsLayerComponent
  extends AbstractClickableLayer<TileLayer<TileSource>>
  implements OnInit, OnDestroy
{
  /**
   * Opties voor het configureren van de WMTS-laag.
   */
  options = model<WmtsLayerOptions | undefined>();

  /**
   * Interne instantie van de WMTS source.
   */
  private wmtsSource: WMTS;

  /**
   * Subscription voor het ophalen van capabilities.
   */
  private capabilitiesSubscription: Subscription;

  /**
   * Opgehaalde capabilities van de WMTS-laag.
   */
  private capabilities: Capabilities | undefined;

  /**
   * De opties waarmee de huidige WMTS source is opgebouwd. Deze zijn nodig om
   * bij een style-wissel een nieuwe source te maken; de style ligt bij WMTS
   * namelijk vast in de source.
   */
  private wmtsSourceOptions: WmtsSourceOptions | undefined;

  /**
   * Injectie van de GgcCapabilitiesService.
   */
  private readonly ggcCapabilitiesService = inject(GgcCapabilitiesService);

  /**
   * Angular lifecycle hook die wordt aangeroepen bij initialisatie van de component.
   * Haalt WMTS-capabilities op en configureert de laag op basis van de opgehaalde gegevens.
   */
  ngOnInit() {
    super.ngOnInit();

    if (this.options() != undefined && this.options()?.layer == undefined) {
      this.options()!.layer = this.options()?.layerName;
    }

    if (this.options()?.getFeatureInfoOnSingleclick === true) {
      this.singleclick = this.mapEventsService
        .getSingleclickObservableForMap(this.mapIndex())
        .subscribe((evt) => {
          this.getFeatureInfo(evt);
        });
    }
    if (this.options()?.maxFeaturesOnSingleclick !== undefined) {
      this.maxFeaturesOnSingleclick = this.options()!.maxFeaturesOnSingleclick!;
    }
    this.capabilitiesSubscription = this.ggcCapabilitiesService
      .getCapabilities(
        (this.options()?.url as string) ||
          (this.options()?.sourceOptions?.url as string),
        "WMTS"
      )
      .subscribe((result) => {
        if (result) {
          this.capabilities = new Capabilities(result);
          const options = this.createWmtsSourceOptions(
            result,
            this.options()?.activeStyle
          );
          if (options) {
            // Set transition to 0 when opacity < 1 to prevent flicker
            const opacity = this.options()?.layerOptions?.opacity;
            if (opacity !== undefined && opacity < 1) {
              options.transition = 0;
              this.layerOptions.opacity = opacity;
            }
            this.wmtsSourceOptions = options;
            this.wmtsSource = new WMTS(options);

            this.setLayer(
              new TileLayer({
                ...this.options()?.layerOptions,
                ...this.layerOptions,
                source: this.wmtsSource
              })
            );
          } else {
            this.capabilities = undefined;
            this.wmtsSourceOptions = undefined;
            console.error("Could not generate options from capabilities");
          }

          this.events.emit(
            new MapComponentEvent(
              MapComponentEventTypes.WMTSCAPABILITES,
              this.mapIndex(),
              "WMTS capabilities resultaten: ",
              this.layerName,
              result
            )
          );
        } else {
          this.capabilities = undefined;
          this.wmtsSourceOptions = undefined;
          console.error("Invalid capabilities");
        }
      });
  }

  /**
   * Set the active style for the layer.
   * Bij WMTS zit de style in de voorgerenderde tiles, waardoor de WMTS source
   * opnieuw wordt opgebouwd. De bestaande laag blijft daarbij behouden, zodat de
   * volgorde van de lagen op de kaart niet verandert.
   * @param styleName the name of the style that should be applied.
   */
  override setActiveStyle(styleName: string): void {
    this.options.set({ ...this.options(), activeStyle: styleName });
    if (!this.wmtsSourceOptions || !this.olLayer) {
      return;
    }
    this.wmtsSourceOptions = { ...this.wmtsSourceOptions, style: styleName };
    this.wmtsSource = new WMTS(this.wmtsSourceOptions);
    this.olLayer.setSource(this.wmtsSource);
  }

  /*
   * Bouwt de opties voor de WMTS source op basis van de capabilities.
   *
   * `optionsFromCapabilities` zoekt de style op via de `Title` uit de
   * capabilities, terwijl `styleName` de `Identifier` van de style is (zoals ook
   * in `styles` van de layerOptions staat). Daarom wordt de style na het
   * opbouwen van de opties direct op die identifier gezet.
   */
  private createWmtsSourceOptions(
    capabilities: Record<string, any>,
    styleName: string | undefined
  ): WmtsSourceOptions | null {
    const options = optionsFromCapabilities(capabilities, {
      format: "image/png",
      style: "default",
      crossOrigin: "anonymous",
      ...this.options()?.sourceOptions,
      ...(this.options()?.layer && { layer: this.options()?.layer }),
      projection: this.rdNewConfig.projectionCode
    });
    if (options && styleName) {
      options.style = styleName;
    }
    return options;
  }

  /**
   * Verwerkt een klik op de kaart en haalt feature info op via WMTS indien beschikbaar.
   *
   * @param evt - Het MapBrowserEvent dat de klik representeert.
   */
  getFeatureInfo(evt: MapBrowserEvent) {
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
      if (this.capabilities && this.capabilities.hasFeatureInfoUrl()) {
        const featureInfoObservable =
          this.ggcCapabilitiesService.getWmtsFeatureInfo(
            (this.options()?.url as string) ||
              (this.options()?.sourceOptions?.url as string),
            this.wmtsSource,
            coordinate,
            viewResolution
          );
        featureInfoObservable.subscribe(
          (data) => {
            const formatGeoJSON = new GeoJSON();
            const features: Feature<Geometry>[] =
              formatGeoJSON.readFeatures(data);
            this.emitFeatureInfoEvent(features, coordinate);
          },
          () => {
            this.emitFeatureInfoEvent([], coordinate);
          }
        );
      } else {
        this.emitFeatureInfoEvent([], coordinate);
      }
    } else {
      this.emitFeatureInfoEvent([], coordinate);
    }
  }

  /**
   * Emit een event met de opgehaalde features en coördinaten.
   *
   * @param features - De gevonden features.
   * @param coordinate - De locatie van de klik.
   */
  emitFeatureInfoEvent(
    features: Feature<Geometry>[],
    coordinate: Coordinate
  ): void {
    this.coreSelectionService.handleFeatureInfoForLayer(
      this.mapIndex(),
      features,
      this.getLayerId()
    );
    this.events.emit(
      new MapComponentEvent(
        MapComponentEventTypes.WMTSFEATUREINFO,
        this.mapIndex(),
        "WMTS getFeatureInfo resultaten: ",
        this.layerName,
        features
      )
    );
  }

  /**
   * Angular lifecycle hook die wordt aangeroepen bij het vernietigen van de component.
   * Zorgt voor het opruimen van subscriptions.
   */
  ngOnDestroy(): void {
    if (this.capabilitiesSubscription !== undefined) {
      this.capabilitiesSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  protected handleSingleClick(event: MapBrowserEvent) {
    this.getFeatureInfo(event);
  }
}
