import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ValueTemplateDirective } from "./value-template.directive";

@Component({
  imports: [ValueTemplateDirective],
  template: ` <ng-template
    [ggcTemplateKey]="templateKey"
    let-key
    let-value="value"
  >
    test directive
  </ng-template>`
})
class WrapperComponent {
  @ViewChild(ValueTemplateDirective) template: ValueTemplateDirective;
  templateKey = "bronhoudernaam";
}

describe("ValueTemplateDirective", () => {
  let directive: ValueTemplateDirective;
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: any;

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.debugElement.componentInstance;
  });

  it("should create the directive and set ggcTemplateKey and templateRef", () => {
    fixture.detectChanges();
    directive = wrapperComponent.template;

    expect(directive).toBeDefined();
    expect(directive.ggcTemplateKey).toBe("bronhoudernaam");
    expect(directive.templateRef).toBeDefined();
  });

  it("should create the directive with an array, and set ggcTemplateKey and templateRef", () => {
    wrapperComponent.templateKey = ["bronhoudernaam", "bronhoudercode"];
    fixture.detectChanges();
    directive = wrapperComponent.template;

    expect(directive).toBeDefined();
    expect(directive.ggcTemplateKey).toEqual([
      "bronhoudernaam",
      "bronhoudercode"
    ]);
    expect(directive.templateRef).toBeDefined();
  });
});
