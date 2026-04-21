/**
 * Het type van het event dat de dataset-tree emit als een laag wordt geactiveerd of gedeactiveerd in de dataset-tree
 */
export class DatasetTreeEvent {
  /**
   * Maakt een nieuw DatasetTreeEvent aan
   *
   * @param type - Het type van het event (`layerActivated` of `layerDeactivated`).
   * @param message - De message in het event.
   * @param layerId - De layerId die aangeeft om welke layer het gaat.
   * @param mapIndex - De mapIndex die aangeeft om welke map het gaat.
   */
  constructor(
    public type: DatasetTreeEventType,
    public message: string,
    public layerId: string,
    public mapIndex: string
  ) {}
}

/**
 * De enum die aangeeft of het event het activeren van een laag is of het deactiveren.
 */
export enum DatasetTreeEventType {
  LAYER_ACTIVATED = "layerActivated",
  LAYER_DEACTIVATED = "layerDeactivated"
}
