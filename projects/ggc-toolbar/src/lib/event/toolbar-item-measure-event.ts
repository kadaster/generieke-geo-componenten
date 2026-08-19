/**
 * Enum die de verschillende meetacties beschrijft die beschikbaar zijn in het `ToolbarItemMeasureComponent`.
 *
 * Deze waarden worden gebruikt om aan te geven welke actie is uitgevoerd, bijvoorbeeld bij het versturen van een `measureItemClicked` event.
 *
 * @remarks
 * De volgorde van de buttons in het component is vast en kan niet worden aangepast.
 */
export enum ToolbarItemMeasureType {
  /** Bewerk bestaande metingen. */
  EDIT = "edit",

  /** Verplaats bestaande metingen. */
  MOVE = "move",

  /** Stop met meten. */
  STOP = "stop",

  /** Start een lijnmeting. */
  LINE = "line",

  /** Start een polygonmeting. */
  POLYGON = "polygon",

  /** Wis alle metingen uit de laag. */
  CLEAR = "clear"
}

/**
 * Eventklasse die wordt gebruikt door `ToolbarItemMeasureComponent` om aan te geven welke meetactie is uitgevoerd.
 *
 * Dit event wordt verstuurd via de `measureItemClicked` output en bevat het element `toolbarItemName` met een waarde van
 * `ToolbarItemMeasureType`
 */
export class ToolbarItemMeasureComponentEvent {
  /**
   * De naam van de meetactie die is uitgevoerd.
   */
  toolbarItemName: ToolbarItemMeasureType;
}
