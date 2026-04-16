import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import TileLayer from "ol/layer/Tile";
import MapBrowserEvent from "ol/MapBrowserEvent";
import TileSource from "ol/source/Tile";
import WMTS from "ol/source/WMTS";
import { Subscription } from "rxjs";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { AbstractClickableLayerComponent } from "../abstract-clickable-layer/abstract-clickable-layer.component";
import { Capabilities } from "../model/capabilities.model";
import { WmtsLayerOptions } from "../model/wmts-layer.model";
import { CoreWmsWmtsCapabilitiesService } from "../service/core-wms-wmts-capabilities.service";
import { viewResolutionIsInLayerResolutionRange } from "../utils/viewResolutionIsInLayerResolutionRange";

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
  extends AbstractClickableLayerComponent<TileLayer<TileSource>>
  implements OnInit, OnDestroy
{
  /**
   * Opties voor het configureren van de WMTS-laag.
   */
  @Input() options?: WmtsLayerOptions;

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
   * Injectie van de CoreWmsWmtsCapabilitiesService.
   */
  private capabilitiesService = inject(CoreWmsWmtsCapabilitiesService);

  /**
   * Angular lifecycle hook die wordt aangeroepen bij initialisatie van de component.
   * Haalt WMTS-capabilities op en configureert de laag op basis van de opgehaalde gegevens.
   */
  ngOnInit() {
    super.ngOnInit();

    if (this.options != undefined && this.options?.layer == undefined) {
      this.options.layer = this.options?.layerName;
    }

    this.capabilitiesSubscription = this.capabilitiesService
      .getCapabilitiesForUrl(
        (this.options?.url as string) ||
          (this.options?.sourceOptions?.url as string),
        "WMTS"
      )
      .subscribe((result) => {
        if (result) {
          this.capabilities = new Capabilities(result);
          const options = this.capabilitiesService.optionsFromCapabilities(
            result,
            {
              format: "image/png",
              style: "default",
              crossOrigin: "anonymous",
              ...this.options?.sourceOptions,
              ...(this.options?.layer && { layer: this.options?.layer }),
              projection: this.rdNewConfig.projectionCode
            }
          );
          if (options) {
            // Set transition to 0 when opacity < 1 to prevent flicker
            const opacity = this.options?.layerOptions?.opacity;
            if (opacity !== undefined && opacity < 1) {
              options.transition = 0;
              this.layerOptions.opacity = opacity;
            }
            this.wmtsSource = new WMTS(options);

            this.setLayer(
              new TileLayer({
                ...this.options?.layerOptions,
                ...this.layerOptions,
                source: this.wmtsSource
              })
            );
          } else {
            this.capabilities = undefined;
            console.error("Could not generate options from capabilities");
          }

          this.events.emit(
            new MapComponentEvent(
              MapComponentEventTypes.WMTSCAPABILITES,
              this.mapIndex,
              "WMTS capabilities resultaten: ",
              this.layerName,
              result
            )
          );
        } else {
          this.capabilities = undefined;
          console.error("Invalid capabilities");
        }
      });
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
      if (
        this.capabilities &&
        this.capabilitiesService.hasFeatureInfoUrl(this.capabilities)
      ) {
        const featureInfoObservable =
          this.capabilitiesService.createGetFeatureInfoUrlObservable(
            (this.options?.url as string) ||
              (this.options?.sourceOptions?.url as string),
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
        MapComponentEventTypes.WMTSFEATUREINFO,
        this.mapIndex,
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
}
