import VectorTileLayer, { Options } from "ol/layer/VectorTile";
import { Options as VectorTileSourceOptions } from "ol/source/VectorTile";
import { AbstractClickableLayerOptions } from "./abstract-layer.model";
import { StyleLike } from "ol/style/Style";

/**
 * Opties voor het configureren van een VectorTile-laag.
 */
export interface VectorTileLayerOptions extends AbstractClickableLayerOptions {
  /**
   * Optioneel: Instellen van de layerOptions voor de Openlayers Layer,
   * onder andere zIndex, minResolution en maxResolution kunnen worden ingesteld.
   * Zie Vector Tile Layer voor alle opties. [VectorTileLayer](https://openlayers.org/en/latest/apidoc/module-ol_layer_VectorTile-VectorTileLayer.html)
   */
  layerOptions?: Options;

  /**
   * Optioneel: Instellen van de sourceOptions voor de Openlayers Source.
   * Hier kan onder andere de url worden ingesteld.
   * Zie Vector [Tile Source](https://openlayers.org/en/latest/apidoc/module-ol_source_VectorTile-VectorTile.html) voor alle opties.
   */
  sourceOptions?: Partial<VectorTileSourceOptions>;

  /**
   * Optioneel: Voor het meegeven van een OpenLayers-stijlobject, stijlfunctie of url
   * met json styles aan de weergegeven data. Denk hierbij aan het meegeven van kleur,
   * dikte van een strook of een eigen icoon. Voor extra info zie: [OpenLayers StyleLike](https://openlayers.org/en/latest/apidoc/module-ol_style_Style.html#~StyleLike)
   */
  style?: StyleLike | string;

  /**
   * Optioneel: Instellen van een straal in pixels rond de plek waar in de kaart
   * geklikt wordt bij getFeatureInfoOnSingleclick. Met deze optie wordt het makkelijker
   * om bijvoorbeeld op een lijn te klikken.
   */
  hitTolerance?: number;

  /**
   * Optioneel: Grootte van de tiles in pixels, default waarde is [256, 256].
   */
  tileSize?: [number, number];

  /**
   * Optioneel: Met deze optie kan je overzoom aanzetten, default waarde is false.
   * Om overzoom goed te laten werken, moet de maxzoom van de kaartlaag worden bepaald
   * (het bepalen van de minzoom is niet nodig voor overzoom). Deze maxzoom wordt
   * automatisch bepaald aan de hand van de (style)url. Wanneer de maxzoom niet is
   * ingevuld in de style json of in de metadata van de API tiles of je wilt deze
   * waarde zelf overschrijven, dan kan je deze handmatig via de maxzoom optie in de
   * sourceOptions meegeven. De overzoom werkt tot de ingestelde minResolution
   * van de kaartlaag; je kan de minResolution ook weglaten, dan wordt er automatisch
   * doorgezoomd tot het maximale zoomniveau van de kaart.
   */
  enableOverzoom?: boolean;
}
