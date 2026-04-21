import { Directive, inject, Input, TemplateRef } from "@angular/core";

/**
 * Directive waarmee een custom template kan worden aangeboden voor het
 * weergeven van een layerlabel binnen het `ggc-dataset-tree` component.
 *
 * Deze directive wordt geplaatst op een `<ng-template>` en stelt het
 * dataset‑structuurcomponent in staat om de standaard weergave van een layer
 * te vervangen door een door de afnemer gedefinieerde template.
 *
 * ## Gebruik
 * Een voorbeeld van een custom layerlabel:
 *
 * ```html
 * <ggc-dataset-tree [themes]="themes" ...>
 *
 *   <ng-template
 *     [ggcLayerLabelTemplate]
 *     let-value="layer">
 *
 *     <!-- Custom html voor een layer label -->
 *     <app-dataset-tree-layer-label
 *       [layer]="value">
 *     </app-dataset-tree-layer-label>
 *
 *   </ng-template>
 *
 * </ggc-dataset-tree>
 * ```
 */

@Directive({ selector: "[ggcLayerLabelTemplate]" })
export class LayerLabelTemplateDirective {
  templateRef = inject<TemplateRef<any>>(TemplateRef);

  @Input() ggcLayerLabelTemplate: void;
}
