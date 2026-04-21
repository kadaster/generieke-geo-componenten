/**
 * Enum die de verschillende tekenacties beschrijft die beschikbaar zijn in het `ToolbarItemDrawComponent`.
 *
 * Deze waarden worden gebruikt om aan te geven welke actie is uitgevoerd, bijvoorbeeld bij het versturen van een `drawItemClicked` event.
 */
export enum ToolbarItemDrawType {
  /** Stop met tekenen. */
  STOP = "stop",

  /** Verplaats bestaande tekeningen. */
  MOVE = "move",

  /** Bewerk bestaande tekeningen. */
  EDIT = "edit",

  /** Teken een punt. */
  POINT = "point",

  /** Teken een lijn. */
  LINE = "line",

  /** Teken een cirkel. */
  CIRCLE = "circle",

  /** Teken een rechthoek. */
  RECTANGLE = "rectangle",

  /** Teken een polygon. */
  POLYGON = "polygon",

  /** Wis alle tekeningen uit de laag. */
  CLEAR = "clear"
}

/**
 * Eventklasse die wordt gebruikt door `ToolbarItemDrawComponent` om aan te geven welke tekenactie is uitgevoerd.
 *
 * Dit event wordt verstuurd via de `drawItemClicked` output en bevat het type actie via `toolbarItemName`.
 */
export class ToolbarItemDrawComponentEvent {
  /**
   * De naam van de tekenactie die is uitgevoerd.
   */
  toolbarItemName: ToolbarItemDrawType;
}
