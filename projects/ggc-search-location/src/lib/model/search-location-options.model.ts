import { SearchComponentElementIds } from "./search-component-element-ids.model";
import { EventEmitter } from "@angular/core";
import { SearchCurrentLocation } from "./search-current-location.model";
import { PdokLocationApiSearchFeature } from "./pdok-location-api-collection.model";
import { ViewerType } from "@kadaster/ggc-models";
import { SearchCollection } from "@kadaster/ggc-search-location";
/**
 * Uitgebreide configuratie voor de SearchLocationComponent.
 */
export interface SearchLocationOptions {
  /** Alternatieve bronnen (zoals RD) boven de PDOK resultaten getoond moeten worden. Default is false.*/
  alternativeSuggestionsFirst?: boolean;
  /** Vertalingen voor collectie ID's (bijv. 'perceel' naar 'Kadastraal perceel'). Indien er geen vertaling is, wordt de originele waarde gebruikt. */
  collectionIdTranslations?: Map<string, string>;
  /** Custom ID's voor de HTML elementen. */
  elementIds?: SearchComponentElementIds;
  /** De bron/collectie naam verborgen moet worden in de suggestielijst. Default is false. */
  hideCollectionId?: boolean;
  /** De mogelijkheid om de zoekfunctie niet te gebruiken. Wanneer true, wordt alleen de huidige-locatie knop weergegeven. Default is false.*/
  hideSearch?: boolean;
  /** Een EventEmitter om van buitenaf een initieel resultaat in de component te zetten. */
  initialResult?: EventEmitter<PdokLocationApiSearchFeature>;
  /** Een initiële zoekterm die bij het laden direct wordt uitgevoerd. */
  initialSearchTerm?: string;
  /** De tekst voor het label boven/naast het zoekveld. */
  labelText?: string;
  /** De index van de kaart in de MapService waarop acties (zoom/mark) moeten plaatsvinden. Alleen relevant voor 2D viewers */
  mapIndex?: string;
  /** Het geselecteerde resultaat gemarkeerd moet worden op de kaart. Default is false. */
  markResult?: boolean;
  /** Minimaal aantal karakters voor een zoekopdracht wordt gestart. Default is 1. */
  minQueryLength?: number;
  /** Maximaal aantal suggesties dat PDOK moet teruggeven (1-50). Default is 50. */
  numberOfSuggestions?: number;
  /** Placeholder en aria-label tekst voor het invoerveld. */
  placeholderTextAndAriaLabel?: string;
  /** Configuratie voor de "Mijn Locatie" functionaliteit. */
  searchCurrentLocation?: SearchCurrentLocation;
  /** De initiële zoekterm direct getriggerd moet worden. */
  triggerSearch?: boolean;
  /** De kaart automatisch moet zoomen naar het geselecteerde resultaat. Default is false. */
  zoomToResult?: boolean;
  /** Voor welk ViewerType is dit SearchLocationComponent. Default is 2D. */
  viewerType?: ViewerType;
  /**
   * De custom collections waarin dit zoekcomponent moet zoeken. Voor elke collectie moet het id, version en relevance worden opgegeven.
   */
  customCollections?: SearchCollection[];
}
