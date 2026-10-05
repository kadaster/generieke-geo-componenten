import type { ElementRef, TemplateRef } from "@angular/core";
import { Component, input, output, signal, viewChild } from "@angular/core";
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
 *
 * ### Voorbeeld met clickCallback (geen content)
 * ```html
 * <ggc-toolbar-item
 *   [icon]="'fas fa-copy'"
 *   [title]="'Link kopiëren'"
 *   [clickCallback]="copyLink.bind(this)">
 * </ggc-toolbar-item>
 * ```
 */
@Component({
  selector: "ggc-toolbar-item",
  styleUrl: "./ggc-toolbar-item.component.scss",
  templateUrl: "./ggc-toolbar-item.component.html",
  imports: [NgClass]
})
export class GgcToolbarItemComponent {
  /**
   * De ID van het actieve toolbar-item. Wordt gebruikt om te bepalen of dit item actief is.
   */
  activeId = input<string>();

  /**
   * Font Awesome icoonklasse die op de knop wordt weergegeven.
   * Bijvoorbeeld: `"fas fa-info-circle"`.
   */
  icon = input<string>();

  /**
   * Tooltip en aria-label voor de knop.
   */
  title = input<string>();

  /**
   * Labeltekst die op de knop wordt weergegeven.
   */
  label = input<string>();

  /**
   * SVG-afbeelding die op de knop wordt weergegeven (alternatief voor `icon`).
   */
  svg = input<string>();

  /**
   * Optionele callbackfunctie die wordt uitgevoerd bij een klik op de knop.
   * Als deze is ingesteld, wordt handleClick niet uitgevoerd (actieve element wordt niet geupdatet en er wordt geen event ge-emit)
   */
  clickCallback = input<() => void>();

  /**
   * Output die een `ToolbarItemComponentEvent` emit wanneer de actieve status verandert.
   */
  readonly activeChanged = output<ToolbarItemComponentEvent>();

  // NOSONAR: Non-cryptographic random value used only as a DOM id.
  // No security-sensitive context.
  protected readonly id = Math.random().toString(36).substring(2);
  protected readonly _active = signal(false);

  /**
   * TemplateRef naar de inhoud van het toolbar-item.
   */
  private readonly toolbarItemTemplateQuery = viewChild.required<
    TemplateRef<any>
  >("toolbarItemTemplate");

  /**
   * ElementRef naar het DOM-element van het toolbar-item.
   */
  private readonly toolbarItemQuery =
    viewChild.required<ElementRef>("toolbarItem");

  get toolbarItemTemplate(): TemplateRef<any> {
    return this.toolbarItemTemplateQuery();
  }

  get toolbarItem(): ElementRef {
    return this.toolbarItemQuery();
  }

  /**
   * Wordt aangeroepen bij een klik op de knop.
   * Roept `clickCallback` aan indien aanwezig, anders `handleClick`.
   */
  onClick() {
    if (this.clickCallback()) {
      this.clickCallback()!();
    } else {
      this.handleClick();
    }
  }

  /**
   * Handelt de klik af door de actieve status te toggelen en een event te emitten.
   */
  handleClick() {
    this._active.set(!this._active());
    this.activeChanged.emit({
      toolbarItemComponent: this,
      active: this._active()
    });
  }

  /**
   * Zet de actieve status van het item.
   */
  set active(state: boolean) {
    this._active.set(state);
  }
}
