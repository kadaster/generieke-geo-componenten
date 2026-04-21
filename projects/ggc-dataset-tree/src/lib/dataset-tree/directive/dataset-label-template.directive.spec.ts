import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { DatasetLabelTemplateDirective } from "./dataset-label-template.directive";

@Component({
  imports: [DatasetLabelTemplateDirective],
  template: ` <ng-template
    [ggcDatasetLabelTemplate]=""
    let-key
    let-value="value"
  >
    test directive
  </ng-template>`
})
class WrapperComponent {
  @ViewChild(DatasetLabelTemplateDirective)
  template: DatasetLabelTemplateDirective;
}

describe("ValueTemplateDirective", () => {
  let directive: DatasetLabelTemplateDirective;
  let fixture: ComponentFixture<WrapperComponent>;
  let wrapperComponent: any;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [WrapperComponent, DatasetLabelTemplateDirective]
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
