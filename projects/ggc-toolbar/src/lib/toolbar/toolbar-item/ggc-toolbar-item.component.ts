import type { ElementRef, TemplateRef } from "@angular/core";
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from "@angular/core";
import { ToolbarItemComponentEvent } from "../../event/toolbar-item-event";
import { NgClass } from "@angular/common";

/**
 * Component voor een toolbar-item binnen de `ggc-toolbar`.
 *
 * Een `ggc-toolbar-item` representeert een knop in de toolbar die een actie uitvoert of content toont onder de toolbar.
 *
 * ### Functionaliteit
 * - Toont een knop met een icoon, label of SVG.
 * - Kan content tonen onder de toolbar bij activatie.
 * - Ondersteunt een `clickCallback` voor custom gedrag.
 * - Emit een `activeChanged` event bij activatie/deactivatie.
 *
 * ### Voorbeeldgebruik
 * ```html
 * <ggc-toolbar-item
 *   [icon]="'fas fa-info-circle'"
 *   [label]="'Info'"
 *   [title]="'Toon informatie'"
 *   (activeChanged)="onActiveChanged($event)">
 *   <div>Inhoud die onder de toolbar verschijnt</div>
 * </ggc-toolbar-item>
 * ```
 */
@Component({
  selector: "ggc-toolbar-item",
  styleUrl: "./ggc-toolbar-item.component.css",
  templateUrl: "./ggc-toolbar-item.component.html",
  imports: [NgClass]
})
export class GgcToolbarItemComponent {
  /**
   * De ID van het actieve toolbar-item. Wordt gebruikt om te bepalen of dit item actief is.
   */
  @Input() activeId: string;

  /**
   * Font Awesome icoonklasse die op de knop wordt weergegeven.
   * Bijvoorbeeld: `"fas fa-info-circle"`.
   */
  @Input() icon: string;

  /**
   * Tooltip en aria-label voor de knop.
   */
  @Input() title: string;

  /**
   * Labeltekst die op de knop wordt weergegeven.
   */
  @Input() label: string;

  /**
   * SVG-afbeelding die op de knop wordt weergegeven (alternatief voor `icon`).
   */
  @Input() svg: string;

  /**
   * Optionele callbackfunctie die wordt uitgevoerd bij een klik op de knop.
   * Als deze is ingesteld, wordt handleClick niet uitgevoerd (actieve element wordt niet geupdatet en er wordt geen event ge-emit)
   */
  @Input() clickCallback: () => void;

  /**
   * TemplateRef naar de inhoud van het toolbar-item.
   */
  @ViewChild("toolbarItemTemplate") toolbarItemTemplate: TemplateRef<any>;

  /**
   * ElementRef naar het DOM-element van het toolbar-item.
   */
  @ViewChild("toolbarItem") toolbarItem: ElementRef;

  /**
   * EventEmitter die een `ToolbarItemComponentEvent` emit wanneer de actieve status verandert.
   */
  @Output() activeChanged: EventEmitter<ToolbarItemComponentEvent> =
    new EventEmitter<ToolbarItemComponentEvent>();

  protected id = Math.random().toString(36).substring(2);
  protected _active = false;

  /**
   * Wordt aangeroepen bij een klik op de knop.
   * Roept `clickCallback` aan indien aanwezig, anders `handleClick`.
   */
  onClick() {
    if (this.clickCallback) {
      this.clickCallback();
    } else {
      this.handleClick();
    }
  }

  /**
   * Handelt de klik af door de actieve status te toggelen en een event te emitten.
   */
  handleClick() {
    this._active = !this._active;
    this.activeChanged.emit({
      toolbarItemComponent: this,
      active: this._active
    });
  }

  /**
   * Zet de actieve status van het item.
   */
  set active(state: boolean) {
    this._active = state;
  }
}
