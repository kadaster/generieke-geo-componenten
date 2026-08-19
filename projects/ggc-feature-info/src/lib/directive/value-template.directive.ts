import { Directive, inject, Input, TemplateRef } from "@angular/core";

/**
 * Bepaalt hoe een custom template (gekoppeld via {@link ValueTemplateDirective})
 * wordt toegepast op een veld binnen de feature-info weergave.
 */
export enum ValueTemplateDirectiveType {
  /**
   * Template wordt gebruikt als header.
   */
  HEADER = "header",

  /**
   * Template wordt gebruikt voor content (standaard gedrag).
   */
  CONTENT = "content",

  /**
   * Template wordt volledig verborgen.
   */
  HIDE = "hide",

  /**
   * Template wordt alleen verborgen wanneer de waarde leeg is.
   */
  HIDE_IF_EMPTY = "hide if empty"
}

/**
 * Directive waarmee een template gekoppeld kan worden aan een specifieke key
 * voor het renderen van waarden binnen bijvoorbeeld feature-info componenten.
 *
 * Deze directive maakt het mogelijk om:
 * - specifieke velden te voorzien van custom templates;
 * - verschillende rendering types te ondersteunen via {@link ValueTemplateDirectiveType};
 * - templates conditioneel te verbergen.
 *
 * @remarks
 * Binnen het `ng-template` zijn de volgende contextvariabelen beschikbaar:
 * - `let-key` (of `$implicit`): de naam van het veld;
 * - `let-value="value"`: de waarde van het veld;
 * - `let-properties="properties"`: alle properties van de feature.
 *
 * @example
 * Custom template voor het koppelen van het veld `bronhoudernaam`, en een
 * gedeeld custom template voor het koppelen van de content van de velden `status` en
 * `omschrijving`:
 * <ggc-feature-info>
 *   <ng-template [ggcTemplateKey]="'bronhoudernaam'" let-key let-value="value">
 *     <button (click)="customClick()">{{key}} {{value}}</button>
 *   </ng-template>
 *   <ng-template
 *     [ggcTemplateKey]="['status', 'omschrijving']"
 *     [templateType]="ValueTemplateDirectiveType.CONTENT"
 *     let-key
 *     let-value="value"
 *   >
 *     <button (click)="customClick()">{{key}} {{value}}</button>
 *   </ng-template>
 * </ggc-feature-info>
 */
@Directive({ selector: "[ggcTemplateKey]" })
export class ValueTemplateDirective {
  templateRef = inject<TemplateRef<any>>(TemplateRef);

  /**
   * Key (of lijst van keys) waaraan dit template gekoppeld is.
   * Deze keys worden gebruikt om te bepalen wanneer dit template toegepast wordt.
   */
  @Input() ggcTemplateKey: string | string[];

  /**
   * Type van het template dat bepaalt hoe deze wordt gebruikt bij rendering.
   *
   * @defaultValue {@link ValueTemplateDirectiveType.CONTENT}
   */
  @Input() templateType: ValueTemplateDirectiveType =
    ValueTemplateDirectiveType.CONTENT;
}
