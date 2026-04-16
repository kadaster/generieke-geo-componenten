import { Options } from "ol/layer/BaseImage";
import ImageSource, { Options as SourceOptions } from "ol/source/ImageStatic";
import { AbstractConfigurableLayerOptions } from "./abstract-layer.model";

/**
 * Opties voor het configureren van een afbeeldingslaag binnen een kaartapplicatie.
 */
export interface ImageLayerOptions extends AbstractConfigurableLayerOptions {
  /**
   * De extent (bereik) van de afbeelding in kaartcoördinaten.
   * Dit is een array van vier getallen: `[minX, minY, maxX, maxY]`.
   *
   * @example
   * [0, 0, 1024, 768]
   */
  imageExtent?: [number, number, number, number];

  /**
   * Optioneel: Instellen van de layerOptions voor de OpenLayers Layer.
   * Hiermee kunnen onder andere `zIndex`, `minResolution` en `maxResolution` worden ingesteld.
   * Zie de OpenLayers documentatie voor meer informatie. [ImageLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_Image-ImageLayer.html)
   */
  layerOptions?: Options<ImageSource>;

  /**
   * Optioneel: Instellen van de sourceOptions voor de OpenLayers layer.
   * Hier kan onder andere de url worden ingesteld.
   * Voor alle opties zie: [ImageStatic-Static](https://openlayers.org/en/latest/apidoc/module-ol_source_ImageStatic-Static.html)
   */
  sourceOptions?: Partial<SourceOptions>;
}
