import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from "@angular/core";
import Feature, { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import { Options } from "ol/layer/BaseVector";
import VectorLayer from "ol/layer/Vector";
import MapBrowserEvent from "ol/MapBrowserEvent";
import Cluster from "ol/source/Cluster";
import VectorSource from "ol/source/Vector";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { AbstractClickableLayerComponent } from "../abstract-clickable-layer/abstract-clickable-layer.component";
import { GeojsonLayerOptions } from "../model/geojson-layer.model";
import { CoreOgcApiFeaturesService } from "../service/core-ogc-api-features.service";

/**
 * Door `<ggc-geojson-layer></ggc-geojson-layer>` op te nemen in de HTML kunnen
 * kaartlagen worden getoond die GeoJSON data bevatten. Dit kan bijvoorbeeld een
 * losse file zijn die GeoJSON-objecten bevat of een WFS-kaartlaag die JSON als
 * outputformat heeft. Bij deze kaartlaag is de variabele url optioneel.
 *
 * @example
 * import { GeojsonLayerOptions } from "@kadaster/ggc-map";
 * import Style from "ol/style/Style";
 *
 * const stylePointObjectShapeTriangle = new Style();
 *
 * const geojsonLayerOptions: GeojsonLayerOptions = {
 *     url: "/assets/GeoJSONTest.json",
 *     minResolution: 100,
 *     maxResolution: 861,
 *     zIndex: 3,
 *     getFeatureInfoOnSingleclick: true,
 *     maxFeaturesOnSingleclick: 15,
 *     hitTolerance: 6,
 *     styleLike: stylePointObjectShapeTriangle,
 *     attributions: "Attributie voor deze GeoJSON kaartlaag",
 *     mapIndex: "geojson",
 *     layerName: "GeoJSON kaartlaag"
 * };
 *
 * <ggc-geojson-layer [options]="geojsonLayerOptions" (events)="logGetFeatureInfoEvents($event)">
 *   </ggc-geojson-layer>
 *
 */
@Component({
  selector: "ggc-geojson-layer",
  template: ""
})
export class GgcGeojsonLayerComponent
  extends AbstractClickableLayerComponent<
    VectorLayer<VectorSource<Feature<Geometry>>>
  >
  implements OnInit, OnDestroy, OnChanges
{
  /**
   * Opties voor het configureren van de GeoJSON-laag.
   * Bevat instellingen voor bron, stijl, clustering en features.
   */
  @Input() options?: GeojsonLayerOptions;

  private vectorSource: VectorSource<Feature<Geometry>>;
  private clusterSource: Cluster<Feature>;
  private foundFeatures: Array<Feature<Geometry>> = [];
  private geoJsonFormat: GeoJSON;
  private readonly ggcOgcApiFeaturesService: CoreOgcApiFeaturesService = inject(
    CoreOgcApiFeaturesService
  );
  /**
   * Initialiseert de GeoJSON-laag bij het laden van de component.
   * Bouwt de vectorbron en eventueel een clusterbron op basis van de opgegeven opties.
   */
  ngOnInit() {
    super.ngOnInit();

    this.geoJsonFormat = new GeoJSON({
      dataProjection: this.rdNewConfig.projectionCode,
      geometryName: "",
      featureProjection: this.rdNewConfig.projectionCode
    });

    const isOgcApiUrl =
      this.options?.url?.includes("/collections/") &&
      this.options?.url?.includes("/items");

    // basis opties
    const options: Record<string, any> = {
      format: this.geoJsonFormat
    };

    // Options assignen voordat vectorSource wordt geinitialiseerd
    if (!isOgcApiUrl) {
      Object.assign(options, {
        ...this.options?.sourceOptions,
        ...(this.options?.url && { url: this.options?.url }),
        ...(this.options?.features && { features: this.options?.features })
      });
    }

    this.vectorSource = new VectorSource(options);

    const layerOptions: Options<
      Feature<Geometry>,
      VectorSource<Feature<Geometry>>
    > = {
      ...this.options?.layerOptions,
      ...this.layerOptions,
      ...(this.options?.styleLike && { style: this.options?.styleLike })
    };

    if (
      this.options?.clusterDistance !== undefined ||
      this.options?.sourceClusterOptions !== undefined
    ) {
      this.clusterSource = new Cluster({
        ...this.options?.sourceClusterOptions,
        ...(this.options?.clusterDistance && {
          distance: this.options?.clusterDistance
        }),
        ...(this.attributions && { attributions: this.attributions }),
        source: this.vectorSource
      });
      layerOptions.source = this.clusterSource;
    } else {
      layerOptions.source = this.vectorSource;
    }

    this.setLayer(new VectorLayer(layerOptions));

    // OGC API Features inladen na setten van Vectorlaag
    if (isOgcApiUrl) {
      (async () => {
        const limit = this.options?.limit;
        const maxFeatures = this.options?.maxFeatures;
        try {
          const features =
            await this.ggcOgcApiFeaturesService.fetchAllOgcApiFeatures(
              this.options!.url!,
              limit,
              maxFeatures
            );

          options.features = features;

          this.vectorSource.addFeatures(features);
        } catch (e) {
          console.error("Fout bij ophalen OGC API features: ", e);
        }
      })();
    }
  }

  /**
   * Reageert op wijzigingen in de input properties.
   * Ondersteunt dynamische updates van URL en features.
   *
   * @param changes - De gewijzigde inputs.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes.url && !changes.url.firstChange) {
      this.updateUrl(changes.url.currentValue);
    }

    if (changes.features && !changes.features.firstChange) {
      this.updateFeatures(changes.features.currentValue);
    }

    if (changes.options && !changes.options.firstChange) {
      if (
        changes.options.currentValue.sourceOptions?.url !==
        changes.options.previousValue?.sourceOptions?.url
      ) {
        this.updateUrl(changes.options.currentValue.sourceOptions?.url);
      }
      if (
        changes.options.currentValue.url !== changes.options.previousValue?.url
      ) {
        this.updateUrl(changes.options.currentValue.url);
      }
      if (
        changes.options.currentValue.sourceOptions?.features !==
        changes.options.previousValue?.sourceOptions?.features
      ) {
        this.updateFeatures(
          changes.options.currentValue.sourceOptions?.features
        );
      }
      if (
        changes.options.currentValue.features !==
        changes.options.previousValue?.features
      ) {
        this.updateFeatures(changes.options.currentValue.features);
      }
    }
  }

  /**
   * Update de URL van de vectorbron en forceert een refresh.
   *
   * @param url - De nieuwe GeoJSON URL.
   */
  private updateUrl(url: string) {
    const vectorSource = this.olLayer.getSource();
    vectorSource.setUrl(url);
    vectorSource.refresh();
  }

  /**
   * Update de features van de vectorbron.
   *
   * @param features - De nieuwe lijst van Feature objecten.
   */
  private updateFeatures(features: Feature<Geometry>[]) {
    let vectorSource = this.olLayer.getSource();
    if (vectorSource instanceof Cluster) {
      vectorSource = vectorSource.getSource();
    }
    vectorSource.clear();
    vectorSource.addFeatures(features);
  }

  /**
   * Verwerkt een klik op de kaart en haalt relevante features op.
   * Stuurt een MapComponentEvent met de gevonden features.
   *
   * @param event - Het MapBrowserEvent van de klik.
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
    /* Kopie van de foundFeatures meegeven, omdat dit anders later fout gaat met
     de objectreferentie bij het zetten van foundFeatures.length op 0. */
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
      MapComponentEventTypes.GEOJSONFEATUREINFO,
      this.mapIndex,
      "GeoJSON getFeatureInfo resultaten: ",
      this.layerName,
      foundFeaturesCopy
    );
    this.events.emit(mapComponentEvent);
    this.foundFeatures.length = 0;
  }

  /**
   * Beperkt het aantal gevonden features bij een klik.
   *
   * @param feature - Het gevonden FeatureLike object.
   */
  private limitFeatures(feature: FeatureLike) {
    if (this.foundFeatures.length < this.maxFeaturesOnSingleclick) {
      // feature as Feature, because VectorSource contains Features. RenderFeatures are used for VectorTileLayer
      this.foundFeatures.push(feature as Feature<Geometry>);
    }
  }

  /**
   * Filtert lagen om te bepalen of ze relevant zijn voor feature info.
   *
   * @param layerCandidate - De kandidaat BaseLayer.
   * @returns `true` als de laag overeenkomt met deze component.
   */
  private decideLayerCandidate(layerCandidate: BaseLayer) {
    return this.olLayer === layerCandidate;
  }

  /**
   * Opruimen van resources bij het vernietigen van de component.
   */
  ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
