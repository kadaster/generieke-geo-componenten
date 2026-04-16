import { LegendType } from "@kadaster/ggc-models";

/**
 * Basale laagopties die gebruikt worden om een laag aan een specifieke kaart te koppelen.
 */
export interface AbstractBaseLayerOptions {
  /**
   * De naam van de kaart waarop de laag moet worden toegevoegd.
   */
  mapIndex?: string;
  /**
   * Optioneel: Een unieke identifier voor deze layer.
   * Kan gebruikt worden om via MapService.getLayer() de laag te verkrijgen.
   */
  layerId?: string;

  /**
   * Optioneel: de weergavenaam van de kaartlaag.
   */
  title?: string;

  /**
   * Optioneel: wanneer true, dan is de kaartlaag initieel zichtbaar op de kaart.
   */
  visible?: boolean;
}

/**
 * Uitgebreide configuratieopties voor een laag.
 * Breidt AbstractBaseLayerOptions uit.
 */
export interface AbstractConfigurableLayerOptions extends AbstractBaseLayerOptions {
  /**
   * Optioneel: Instellen van de naam van de kaartlaag. Deze naam wordt ook meegegeven
   * in de events vanuit de kaartlaag, zodat herkend kan worden welke kaartlaag
   * het event heeft gegooid.
   */
  layerName?: string;

  /**
   * Optioneel: Instellen van de minimale resolutie waarbij de kaartlaag zichtbaar is
   * en er op de beschikbare featureInfo kan worden geklikt.
   */
  minResolution?: number;

  /**
   * Optioneel: Instellen van de maximale resolutie waarbij de kaartlaag zichtbaar is
   * en er op de beschikbare featureInfo kan worden geklikt.
   */
  maxResolution?: number;

  /**
   * Optioneel: Instellen van de z-index voor de volgorde waarin de layer in de kaart
   * weergegeven wordt. Wanneer er meerdere layers zijn met dezelfde z-index, is de
   * volgorde waarin de layer aan de kaart is toegevoegd bepalend. Wanneer er geen
   * z-index is ingesteld, krijgt deze de default waarde 0.
   * Niet beschikbaar voor de ggc-layer-brt-achtergrondkaart.
   */
  zIndex?: number;

  /**
   * Optioneel: Tekst die kan worden meegegeven aan de kaartlaag waarin bijvoorbeeld
   * copyright wordt verleend. Deze tekst wordt onderin de kaart in open-klapbare info
   * dialoog weergeven. Wanneer de attributions bij meerdere kaartlagen is ingesteld,
   * worden deze naast elkaar getoond in de dialoog. Wanneer bij verschillende
   * kaartlagen dezelfde tekst is ingesteld, wordt deze eenmaal weergegeven in de dialoog.
   */
  attributions?: string;

  /**
   * URL voor het invoeren van de WMS / WMTS / GeoJSON / Vector Tile / Image url.
   */
  url?: string;

  /**
   * Optioneel: Het legenda object voor deze laag.
   */
  activeLegend?: LegendType;

  /**
   * Optioneel: De legendIndex bepaalt de volgorde waarin de legenda in het
   * legendcomponent getoond wordt.
   */
  legendIndex?: number;

  /**
   * Optioneel: de opacity van de kaartlaag
   */
  opacity?: number;
}

/**
 * Extra opties voor lagen die klikbare functionaliteit ondersteunen.
 * Breidt AbstractConfigurableLayerOptions uit.
 */
export interface AbstractClickableLayerOptions extends AbstractConfigurableLayerOptions {
  /**
   * Optioneel: Instellen dat er op de kaartlaag geklikt kan worden,
   * waardoor er informatie door middel van een 'GetFeatureInfo' request wordt opgehaald.
   * De FeatureInfo is ook afhankelijk van de ingestelde [minResolution] en
   * [maxResolution] of deze beschikbaar is.
   */
  getFeatureInfoOnSingleclick?: boolean;

  /**
   * Optioneel: Instellen van het maximaal op te halen aantal geografische objecten
   * bij het gebruik van _ getFeatureInfoOnSingleclick_. Bij het niet instellen
   * van de property worden default maximaal 8 objecten per request opgehaald.
   */
  maxFeaturesOnSingleclick?: number;
}
