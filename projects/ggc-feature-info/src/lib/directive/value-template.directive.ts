import { Directive, inject, Input, TemplateRef } from "@angular/core";

export enum ValueTemplateDirectiveType {
  HEADER = "header",
  CONTENT = "content",
  HIDE = "hide",
  HIDE_IF_EMPTY = "hide if empty"
}

@Directive({ selector: "[ggcTemplateKey]" })
export class ValueTemplateDirective {
  templateRef = inject<TemplateRef<any>>(TemplateRef);

  @Input() ggcTemplateKey: string | string[];
  @Input() templateType: ValueTemplateDirectiveType =
    ValueTemplateDirectiveType.CONTENT;
}
