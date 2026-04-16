/**
 * Configuratie voor de "Mijn Locatie" functionaliteit binnen de zoekcomponent.
 */
export interface SearchCurrentLocation {
  /** Bepaalt of de locatieknop in de lijst (select) of als aparte knop (button) verschijnt. */
  type: SearchCurrentLocationType;
  /** Het icoon dat getoond wordt (bijv. FontAwesome klasse). */
  icon: string;
  /** Het icoon dat getoond wordt terwijl de locatie geladen wordt. */
  loadIcon: string;
  /** De tekst bij de locatieoptie (bijv. "Gebruik mijn huidige locatie"). */
  label: string;
  /** De gevonden coördinaten teruggestuurd moeten worden via events. */
  returnLocation: boolean;
  /** De kaart automatisch naar de gevonden locatie moet zoomen. */
  zoomToLocation: boolean;
  /** Er een marker geplaatst moet worden op de gevonden locatie. */
  markLocation: boolean;
  /** De locatie van de gebruiker continu gevolgd moet worden. */
  trackLocation: boolean;
}

/**
 * Weergavetypes voor de huidige locatie optie.
 */
export enum SearchCurrentLocationType {
  /** Weergave als item in de suggestielijst. */
  SELECT = "select",
  /** Weergave als losse knop naast het zoekveld. */
  BUTTON = "button"
}
