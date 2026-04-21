import { Theme } from "../../model/theme/theme.model";

/**
 * Het type van het event dat de dataset-switcher emit als een theme gewisseld wordt
 */
export class DatasetSwitcherEvent {
  message: string;
  value: Theme;

  /**
   * Maakt een nieuw DatasetSwitcherEvent aan
   * @param message bericht over het theme dat gekozen is
   * @param value de theme die gekozen is
   */
  constructor(message: string, value: Theme) {
    this.message = message;
    this.value = value;
  }
}
