/**
 * Model voor suggesties die niet direct uit de standaard PDOK Location API komen.
 * Wordt gebruikt voor bijvoorbeeld RD-coördinaten of aangepaste bronnen.
 */
export interface AdditionalSuggestion {
  /** Unieke identifier van de suggestie. */
  id: string;
  /** De tekst die getoond wordt in de suggestielijst. */
  display_name: string;
  /** Het type resultaat (bijv. 'rd' of 'coordinate'). */
  type: string;
  /** Optioneel: De collectie waartoe de suggestie behoort. */
  collection?: string;
}
