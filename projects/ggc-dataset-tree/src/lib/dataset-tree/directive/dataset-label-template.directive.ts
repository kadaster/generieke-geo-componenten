import { Directive, inject, Input, TemplateRef } from "@angular/core";

/**
 * Directive voor het aanleveren van een custom dataset‑label template
 * binnen het `ggc-dataset-tree` component.
 *
 * Met deze directive kan een afnemer zelf bepalen hoe de datasetnaam
 * (en eventuele aanvullende informatie) wordt weergegeven in de dataset‑structuur.
 *
 * ### Gebruik
 * In de HTML van het afnemende component:
 * ```html
 * <ggc-dataset-tree ...>
 *   <ng-template
 *     [ggcDatasetLabelTemplate]
 *     let-value="dataset">
 *
 *     <!-- Custom html voor een dataset label -->
 *     <app-dataset-tree-dataset-label
 *       [dataset]="value">
 *     </app-dataset-tree-dataset-label>
 *
 *   </ng-template>
 * </ggc-dataset-tree>
 * ```
 */

@Directive({ selector: "[ggcDatasetLabelTemplate]" })
export class DatasetLabelTemplateDirective {
  templateRef = inject<TemplateRef<any>>(TemplateRef);

  @Input() ggcDatasetLabelTemplate: void;
}
