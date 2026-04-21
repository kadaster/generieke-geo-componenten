import { GgcToolbarItemComponent } from "../toolbar/toolbar-item/ggc-toolbar-item.component";

/**
 * Event klasse die wordt gebruikt door `ToolbarItemComponent` om de actieve status te communiceren.
 *
 * Dit event wordt verstuurd via de `activeChanged` output van het `ggc-toolbar-item` component.
 * Het bevat informatie over welk toolbar-item is geactiveerd of gedeactiveerd.
 */
export class ToolbarItemComponentEvent {
  /**
   * Referentie naar het `ToolbarItemComponent` dat het event heeft gegenereerd.
   */
  toolbarItemComponent: GgcToolbarItemComponent;

  /**
   * Boolean die aangeeft of het toolbar-item actief is.
   */
  active: boolean;
}
