import { Options } from "ol/layer/BaseVector";
import VectorSource, { Options as VectorSourceOptions } from "ol/source/Vector";
import { Options as ClusterSourceOptions } from "ol/source/Cluster";
import { AbstractClickableLayerOptions } from "./abstract-layer.model";
import { Geometry } from "ol/geom";
import Feature from "ol/Feature";
import { StyleLike } from "ol/style/Style";

/**
 * Opties voor het configureren van een Geojson laag binnen een kaartapplicatie.
 */
export interface GeojsonLayerOptions extends AbstractClickableLayerOptions {
  /**
   * Optioneel: instellen van de layerOptions voor de OpenLayers Layer.
   * Hiermee kunnen onder andere `zIndex`, `minResolution` en `maxResolution` worden ingesteld.
   * Zie de OpenLayers documentatie voor meer informatie: [VectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html)
   */
  layerOptions?: Options<Feature<Geometry>, VectorSource<Feature<Geometry>>>;

  /**
   * Optioneel: instellen van de sourceOptions voor de OpenLayers Source.
   * Hier kan onder andere de zIndex, minResolution en maxResolution worden ingesteld.
   * Voor alle opties zie: [VectorLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Vector-VectorLayer.html)
   */
  sourceOptions?: Partial<VectorSourceOptions>;

  /**
   * Optioneel: instellen van de sourceOptions voor de OpenLayers Source.
   * Dit is alleen van toepassing wanneer clusterDistance is ingesteld
   * Zie de OpenLayers documentatie voor alle opties [CLustersource](https://openlayers.org/en/latest/apidoc/module-ol_source_Cluster-Cluster.html).
   */
  sourceClusterOptions?: Partial<ClusterSourceOptions<Feature<Geometry>>>;

  /**
   * Optioneel: instellen van een straal in pixels rond de plek waar in de kaart
   * geklikt wordt bij getFeatureInfoOnSingleclick.
   * Met deze optie wordt het makkelijker om bijvoorbeeld op een lijn te klikken.
   */
  hitTolerance?: number;

  /**
   * Optioneel: instellen van geografische objecten (features) op deze laag,
   * zonder gebruik te maken van een (externe) url.
   */
  features?: Feature<Geometry>[];

  /**
   * Optioneel: meegeven van een OpenLayers-stijlobject of stijlfunctie aan
   * de weergegeven data.
   * Als er geen eigen stijlfunctie of stijlobjecten worden meegegeven wordt de
   * standaard OpenLayers styling gebruikt.
   */
  styleLike?: StyleLike;

  /**
   * Optioneel: instellen dat de GeoJSON objecten geclusterd weergegeven worden op de kaart.
   * De clusterDistance is de minimale afstand in pixels tussen de clusters.
   * Let op: clusteren werkt op dit moment alleen bij een GeoJSON kaartlaag met punt geometrieën,
   * maar dit kan uitgebreid worden voor andere types geometrieën.
   */
  clusterDistance?: number;

  /**
   * Optioneel: instellen van het aantal OGC API Features dat per batch (pagina) opgehaald wordt.
   * Alleen van toepassing bij het ophalen van OGC API Features.
   * Default: 100
   */
  limit?: 10 | 100 | 1000;

  /**
   * Optioneel: instellen van het maximaal aantal OCG API Features dat opgehaald wordt.
   * Alleen van toepassing bij het ophalen van OGC API Features.
   * Default: 5000
   */
  maxFeatures?: number;
}
