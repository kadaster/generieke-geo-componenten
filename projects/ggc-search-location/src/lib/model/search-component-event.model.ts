/**
 * De verschillende types events die de zoekcomponent kan afvuren.
 */
export enum SearchComponentEventTypes {
  /** Wordt afgevuurd als een eerder resultaat niet meer relevant is (bijv. na wissen). */
  RESULT_INVALIDATED = "resultInvalidated",
  /** Succesvol zoekresultaat vanuit PDOK of RD-service. */
  SEARCH_RESULT = "searchResult",
  /** Resultaat specifiek op basis van de huidige browserlocatie. */
  SEARCH_LOCATION_RESULT = "searchLocationResult",
  /** Melding dat er geen resultaten zijn gevonden voor de zoekterm. */
  NO_SUGGESTIONS = "noSuggestions",
  /** Algemene fout bij het ophalen van een resultaat. */
  SEARCH_RESULT_ERROR = "searchResultError",
  /** Fout bij het bepalen van de huidige browserlocatie (bijv. geen toestemming). */
  SEARCH_LOCATION_RESULT_ERROR = "searchLocationResultError",
  /** Fout tijdens het ophalen van automatische suggesties. */
  SEARCH_SUGGESTION_ERROR = "searchSuggestionError"
}

/**
 * Representeert een event dat vanuit de zoekcomponent naar de buitenwereld wordt gecommuniceerd.
 */
export class SearchComponentEvent {
  /**
   * @param type Het type event, zie {@link SearchComponentEventTypes}.
   * @param message Een beschrijvende tekst over wat er is gebeurd.
   * @param value Optionele data behorend bij het event (bijv. het resultaat-object of een error).
   */
  constructor(
    public type: SearchComponentEventTypes,
    public message: string,
    public value?: any
  ) {}
}
