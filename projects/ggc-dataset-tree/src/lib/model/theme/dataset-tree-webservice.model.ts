/**
 * Modelklasse die één kaartlaag representeert binnen een webservice.
 *
 * De `DatasetTreeLayer` is het onderliggende niveau binnen de dataset‑boom.
 * Elke laag heeft een referentie naar een kaartlaag in de kaart (`layerId`) waarmee
 * het kaartcomponent de juiste laag kan aansturen of opvragen.
 */
export class DatasetTreeLayer {
  /**
   * Maakt een nieuwe laag aan.
   *
   * @param layerId - De technische en unieke identifier van de laag.
   */

  constructor(public layerId: string) {}
}

/**
 * Een DatasetTreeWebservice is het niveau onder een Dataset in de recursieve dataset-tree. Onder een Service hangt een {@link DatasetTreeLayer}
 */
export class DatasetTreeWebservice {
  /**
   * Maakt een nieuwe webservice aan die kaartlagen bevat.
   *
   * @param layers - De verzameling kaartlagen die onder deze service vallen.
   */

  constructor(public layers: DatasetTreeLayer[]) {}
}
