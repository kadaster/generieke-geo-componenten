/**
 * De class DatasetSwitcherButton die gebruikt wordt voor de {@link GgcDatasetSwitcherComponent}.
 */
export class DatasetSwitcherButton {
  name: string;
  imageUrl: string;

  /**
   * Maakt een DatasetSwitcherButton
   * @param name de naam die de button krijgt
   * @param imageUrl de URL naar de afbeelding
   */
  constructor(name: string, imageUrl: string) {
    this.name = name;
    this.imageUrl = imageUrl;
  }
}
