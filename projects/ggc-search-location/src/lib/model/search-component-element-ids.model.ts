/**
 * Opties voor het overschrijven van standaard HTML element ID's voor accessibility en testen.
 */
export interface ElementIdOptions {
  /** ID voor het tekstinvoerveld. */
  searchInputId?: string;
  /** ID voor de zoekknop. */
  searchButtonId?: string;
  /** ID voor de container van de suggestielijst. */
  suggestionListId?: string;
  /** ID voor het label van het zoekveld. */
  searchLabelId?: string;
}

/**
 * Beheert de HTML element ID's van de zoekcomponent met standaardwaarden als fallback.
 */
export class SearchComponentElementIds {
  searchInputId?: string;
  searchButtonId?: string;
  suggestionListId?: string;
  searchLabelId?: string;

  constructor(elementIdOptions: ElementIdOptions) {
    this.searchInputId = elementIdOptions.searchInputId || "ggcSearchInput";
    this.searchButtonId = elementIdOptions.searchButtonId || "ggcSearchButton";
    this.suggestionListId =
      elementIdOptions.suggestionListId || "ggcSuggestionList";
    this.searchLabelId = elementIdOptions.searchLabelId || "ggcSearchLabel";
  }
}
