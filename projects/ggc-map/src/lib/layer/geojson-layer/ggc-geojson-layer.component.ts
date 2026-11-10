import {
  Component,
  inject,
  model,
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
import { AbstractClickableLayer } from "../abstract-clickable-layer/abstract-clickable-layer.directive";
import { GeojsonLayerOptions } from "../model/geojson-layer.model";
import { UrlParameter } from "../model/abstract-layer.model";
import { CoreOgcApiFeaturesService } from "../service/core-ogc-api-features.service";
import {
  LayerChangedEventTrigger,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import { Extent } from "ol/extent";
import Projection from "ol/proj/Projection";

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
  extends AbstractClickableLayer<VectorLayer<VectorSource<Feature<Geometry>>>>
  implements OnInit, OnDestroy, OnChanges
{
  /**
   * Opties voor het configureren van de GeoJSON-laag.
   * Bevat instellingen voor bron, stijl, clustering en features.
   */
  options = model<GeojsonLayerOptions | undefined>(undefined);

  private vectorSource: VectorSource<Feature<Geometry>>;
  private clusterSource: Cluster<Feature>;
  private foundFeatures: Array<Feature<Geometry>> = [];
  private geoJsonFormat: GeoJSON;
  private loadId = 0;
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

    // basis opties
    const options: Record<string, any> = {
      format: this.geoJsonFormat
    };

    const geojsonLayerOptions = this.options();
    const sourceUrl = this.getSourceUrl(geojsonLayerOptions);
    const isOgcApiUrl = this.isOgcApiUrl(sourceUrl);

    if (!isOgcApiUrl) {
      Object.assign(options, {
        ...geojsonLayerOptions?.sourceOptions,
        ...(sourceUrl
          ? {
              url: this.appendUrlParameters(
                sourceUrl,
                geojsonLayerOptions?.urlParameters
              )
            }
          : {}),
        ...(geojsonLayerOptions?.features && {
          features: geojsonLayerOptions.features
        })
      });
    }

    const layerOptions: Options<
      Feature<Geometry>,
      VectorSource<Feature<Geometry>>
    > = {
      ...this.options()?.layerOptions,
      ...this.layerOptions,
      ...(this.options()?.styleLike && { style: this.options()?.styleLike })
    };

    this.vectorSource = new VectorSource(options);
    this.setVectorSource(layerOptions);
    this.setLayer(new VectorLayer(layerOptions));

    if (isOgcApiUrl) {
      void this.loadOgcApiFeatures(sourceUrl, this.loadId);
    } else {
      this.loadGeojsonFeatures();
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
      const currentOptions: GeojsonLayerOptions | undefined =
        changes.options.currentValue;
      const previousOptions: GeojsonLayerOptions | undefined =
        changes.options.previousValue;
      const sourceUrlChanged =
        currentOptions?.sourceOptions?.url !==
        previousOptions?.sourceOptions?.url;
      const urlChanged = currentOptions?.url !== previousOptions?.url;

      if (currentOptions?.urlParameters !== previousOptions?.urlParameters) {
        this.reloadUrl();
      } else {
        const sourceOptionsUrl = currentOptions?.sourceOptions?.url;
        if (sourceUrlChanged && typeof sourceOptionsUrl === "string") {
          this.updateUrl(sourceOptionsUrl);
        }
        if (urlChanged && currentOptions?.url) {
          this.updateUrl(currentOptions.url);
        }
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
        hitTolerance: this.options()?.hitTolerance
      }
    );
    /* Kopie van de foundFeatures meegeven, omdat dit anders later fout gaat met
     de objectreferentie bij het zetten van foundFeatures.length op 0. */
    const foundFeaturesCopy = this.foundFeatures.slice();
    this.coreSelectionService.handleFeatureInfoForLayer(
      this.mapIndex(),
      foundFeaturesCopy,
      this.getLayerId()
    );

    const mapComponentEvent = new MapComponentEvent(
      MapComponentEventTypes.GEOJSONFEATUREINFO,
      this.mapIndex(),
      "GeoJSON getFeatureInfo resultaten: ",
      this.layerName,
      foundFeaturesCopy
    );
    this.events.emit(mapComponentEvent);
    this.foundFeatures.length = 0;
  }

  /**
   * Opruimen van resources bij het vernietigen van de component.
   */
  ngOnDestroy(): void {
    this.loadId++;
    super.ngOnDestroy();
  }

  /**
   * Vervangt de URL-parameters en laadt de gegevens van de bestaande laag opnieuw.
   *
   * @param urlParameters - De volledige nieuwe lijst met queryparameters.
   */
  override setUrlParameters(urlParameters: UrlParameter[]): void {
    this.options.update((geojsonLayerOptions) => ({
      ...geojsonLayerOptions,
      urlParameters
    }));
    this.reloadUrl();
  }

  protected handleSingleClick(event: MapBrowserEvent) {
    // don't call getFeatureInfo, as that is already solved in the selectService
  }

  private loadGeojsonFeatures() {
    // Andere lagen laden wij zelf in, zodat wij altijd een feature loaded event kunnen throwen
    this.vectorSource.setLoader(
      (extent: Extent, resolution: number, projection: Projection) => {
        const geojsonLayerOptions = this.options();
        const url = this.getSourceUrl(geojsonLayerOptions);
        if (!url) {
          this.emitLayerLoadedErrorEvent();
          throw new Error("GeoJson options.url is verplicht");
        }

        const loadId = this.loadId;
        const fetchPromise = fetch(
          this.appendUrlParameters(url, geojsonLayerOptions?.urlParameters),
          {
            ...(geojsonLayerOptions?.customHeaders && {
              headers: geojsonLayerOptions.customHeaders
            })
          }
        );

        fetchPromise
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (loadId !== this.loadId) {
              return;
            }
            const features = this.geoJsonFormat.readFeatures(data, {
              featureProjection: projection
            });

            this.vectorSource.addFeatures(features);
            this.emitLayerLoadedEvent();
          })
          .catch((error) => {
            if (loadId !== this.loadId) {
              return;
            }
            console.error("GeoJSON load error", error);
            this.emitLayerLoadedErrorEvent();
          });
      }
    );
  }

  private async loadOgcApiFeatures(
    sourceUrl: string,
    loadId: number
  ): Promise<void> {
    const geojsonLayerOptions = this.options();
    const limit =
      geojsonLayerOptions?.urlParameters?.find(
        (urlParameter) => urlParameter.parameterName === "limit"
      )?.parameterValue ?? geojsonLayerOptions?.limit;

    try {
      const features =
        await this.ggcOgcApiFeaturesService.fetchAllOgcApiFeatures(
          this.appendUrlParameters(
            sourceUrl,
            geojsonLayerOptions?.urlParameters
          ),
          limit,
          geojsonLayerOptions?.maxFeatures
        );
      if (loadId !== this.loadId) {
        return;
      }
      this.vectorSource.addFeatures(features);
      this.emitLayerLoadedEvent();
    } catch (error) {
      if (loadId !== this.loadId) {
        return;
      }
      console.error("Fout bij ophalen OGC API features: ", error);
      this.emitLayerLoadedErrorEvent();
    }
  }

  private reloadUrl(): void {
    if (!this.vectorSource) {
      return;
    }

    const geojsonLayerOptions = this.options();
    const sourceUrl = this.getSourceUrl(geojsonLayerOptions);
    if (!sourceUrl) {
      return;
    }

    const loadId = ++this.loadId;
    if (this.isOgcApiUrl(sourceUrl)) {
      this.vectorSource.setLoader(() => {
        // OGC features are loaded by the paginated service.
      });
      this.vectorSource.clear();
      void this.loadOgcApiFeatures(sourceUrl, loadId);
    } else {
      this.vectorSource.setUrl(
        this.appendUrlParameters(sourceUrl, geojsonLayerOptions?.urlParameters)
      );
      this.loadGeojsonFeatures();
      this.vectorSource.refresh();
    }
  }

  private isOgcApiUrl(sourceUrl: string | undefined): sourceUrl is string {
    return (
      typeof sourceUrl === "string" &&
      sourceUrl.includes("/collections/") &&
      sourceUrl.includes("/items")
    );
  }

  private getSourceUrl(
    geojsonLayerOptions: GeojsonLayerOptions | undefined
  ): string | undefined {
    const sourceOptionsUrl = geojsonLayerOptions?.sourceOptions?.url;
    return (
      geojsonLayerOptions?.url ??
      (typeof sourceOptionsUrl === "string" ? sourceOptionsUrl : undefined)
    );
  }

  private appendUrlParameters(
    url: string,
    urlParameters: UrlParameter[] | undefined
  ): string {
    if (!urlParameters?.length) {
      return url;
    }

    const fragmentIndex = url.indexOf("#");
    const fragment = fragmentIndex === -1 ? "" : url.slice(fragmentIndex);
    const urlWithoutFragment =
      fragmentIndex === -1 ? url : url.slice(0, fragmentIndex);
    const queryIndex = urlWithoutFragment.indexOf("?");
    const path =
      queryIndex === -1
        ? urlWithoutFragment
        : urlWithoutFragment.slice(0, queryIndex);
    const searchParams = new URLSearchParams(
      queryIndex === -1 ? "" : urlWithoutFragment.slice(queryIndex + 1)
    );
    for (const urlParameter of urlParameters) {
      searchParams.set(urlParameter.parameterName, urlParameter.parameterValue);
    }
    return `${path}?${searchParams.toString()}${fragment}`;
  }

  private setVectorSource(
    layerOptions: Options<Feature<Geometry>, VectorSource<Feature<Geometry>>>
  ) {
    if (
      this.options()?.clusterDistance !== undefined ||
      this.options()?.sourceClusterOptions !== undefined
    ) {
      this.clusterSource = new Cluster({
        ...this.options()?.sourceClusterOptions,
        ...(this.options()?.clusterDistance && {
          distance: this.options()?.clusterDistance
        }),
        ...(this.attributions && { attributions: this.attributions }),
        source: this.vectorSource
      });
      layerOptions.source = this.clusterSource;
    } else {
      layerOptions.source = this.vectorSource;
    }
  }

  private emitLayerLoadedEvent() {
    this.coreMapService.emitLayerChangedEvent(
      this.getLayerId(),
      this.mapIndex(),
      LayerChangedEventTrigger.LAYER_LOADED
    );
  }

  private emitLayerLoadedErrorEvent() {
    this.coreMapService.emitLayerChangedEvent(
      this.getLayerId(),
      this.mapIndex(),
      LayerChangedEventTrigger.LAYER_LOADED_ERROR
    );
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
}
