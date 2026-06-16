import { Directive, inject, Input, TemplateRef } from "@angular/core";

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
