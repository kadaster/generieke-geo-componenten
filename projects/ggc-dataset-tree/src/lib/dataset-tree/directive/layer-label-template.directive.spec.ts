import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { LayerLabelTemplateDirective as LayerLabelTemplateDirective } from "./layer-label-template.directive";

@Component({
  imports: [LayerLabelTemplateDirective],
  template: ` <ng-template [ggcLayerLabelTemplate]="" let-key let-value="value">
    test directive
  </ng-template>`
})
class WrapperComponent {
  @ViewChild(LayerLabelTemplateDirective) template: LayerLabelTemplateDirective;
}

describe("ValueTemplateDirective", () => {
  let directive: LayerLabelTemplateDirective;
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WrapperComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapperComponent = fixture.debugElement.componentInstance;
  });

  it("should create the directive and set templateRef", () => {
    fixture.detectChanges();
    directive = wrapperComponent.template;

    expect(directive).toBeDefined();
    expect(directive.templateRef).toBeDefined();
  });
});
