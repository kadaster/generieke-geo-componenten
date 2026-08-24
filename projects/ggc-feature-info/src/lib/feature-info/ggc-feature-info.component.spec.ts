import type { MockedObject } from "vitest";
import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import {
  ValueTemplateDirective,
  ValueTemplateDirectiveType
} from "../directive/value-template.directive";
import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { FeatureKeysPipe } from "../pipe/keys.pipe";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { GgcFeatureInfoComponent } from "./ggc-feature-info.component";

@Component({
  template: `
    <ggc-feature-info>
      <ng-template [ggcTemplateKey]="'status'" let-key let-value="value">
        test bronhoudernaam
      </ng-template>
      <ng-template
        [ggcTemplateKey]="['bronhoudercode', 'bronhoudernaam']"
        let-key
        let-value="value"
      >
        test bronhoudercode
      </ng-template>
      <ng-template
        [ggcTemplateKey]="'waarde1'"
        [templateType]="ValueTemplateDirectiveType.HEADER"
        let-key
        let-value="value"
      >
        test waarde
      </ng-template>
      <ng-template
        [ggcTemplateKey]="['waarde2', 'waarde3']"
        [templateType]="ValueTemplateDirectiveType.HEADER"
        let-key
        let-value="value"
      >
        test waardes
      </ng-template>
      <ng-template
        [ggcTemplateKey]="'waarde4'"
        [templateType]="ValueTemplateDirectiveType.HIDE"
      >
      </ng-template>
    </ggc-feature-info>
  `,
  imports: [GgcFeatureInfoComponent, ValueTemplateDirective]
})
class WrapperComponent {
  @ViewChild(GgcFeatureInfoComponent)
  featureInfoChild: GgcFeatureInfoComponent;
  protected readonly ValueTemplateDirectiveType = ValueTemplateDirectiveType;
}

describe("FeatureInfoComponent", () => {
  let component: GgcFeatureInfoComponent;
  let fixture: ComponentFixture<GgcFeatureInfoComponent>;
  let nativeElement: HTMLElement;
  const featureInfoConfigServiceSpy: MockedObject<GgcFeatureInfoConfigService> =
    {
      filterAndSortAttributes: vi
        .fn()
        .mockName("FeatureInfoConfigService.filterAndSortAttributes"),
      checkForCustomValues: vi
        .fn()
        .mockName("FeatureInfoConfigService.checkForCustomValues")
    } as unknown as MockedObject<GgcFeatureInfoConfigService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GgcFeatureInfoComponent, FeatureKeysPipe],
      providers: [
        {
          provide: GgcFeatureInfoConfigService,
          useValue: featureInfoConfigServiceSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcFeatureInfoComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    featureInfoConfigServiceSpy.checkForCustomValues.mockReturnValue([
      { test: "123" }
    ]);
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("when featureInfoCollection is empty, it should show empty message", () => {
    fixture.detectChanges();
    const emptyMessageElement = nativeElement.querySelector(".ggc-fi-empty");
    let message;
    if (emptyMessageElement) {
      message = emptyMessageElement.textContent;
    }

    expect(emptyMessageElement).toBeDefined();
    expect(message).toBe("Geen informatie beschikbaar");
  });

  it("when showEmpty is false, it should not show empty message", () => {
    component.showEmptyMessage = false;
    fixture.detectChanges();
    const emptyMessageElement = nativeElement.querySelector(".ggc-fi-empty");

    expect(emptyMessageElement).toBeNull();
  });

  it("when featureInfoCollection is not empty, it should not show empty message", () => {
    const feature1 = new Feature({ test: "123" });
    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature1],
      layerTitle: "title",
      layerId: "id"
    };

    const emptyMessageElement = nativeElement.querySelector(".ggc-fi-empty");

    expect(emptyMessageElement).toBeNull();
    expect(
      featureInfoConfigServiceSpy.filterAndSortAttributes
    ).toHaveBeenCalled();
  });

  it("when handleFeatureInfoEvent receives SELECTEDTAB with undefined value, it should set featureInfoCollection to undefined", () => {
    component.featureInfoCollection = {
      layerName: "laag",
      features: [new Feature({ test: "123" })],
      layerTitle: "title",
      layerId: "id"
    };

    component["handleFeatureInfoEvent"](
      new FeatureInfoComponentEvent(
        FeatureInfoComponentEventType.SELECTEDTAB,
        "test",
        undefined
      )
    );

    expect(component.featureInfoCollection).toBeUndefined();
  });

  it("when hidePagerWithOneFeature is not set it should default always show the pager", () => {
    featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
      { test: "123" }
    ]);
    const feature = new Feature({ test: "123" });
    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature],
      layerTitle: "title",
      layerId: "id"
    };
    fixture.detectChanges();

    const pagerElement = nativeElement.querySelector(".ggc-fi-pager");
    const pagerPreviousElement = nativeElement.querySelector(
      ".ggc-fi-pager-previous"
    );
    const pagerNextElement = nativeElement.querySelector(".ggc-fi-pager-next");

    expect(component.hidePagerWithOneFeature).toBe(false);
    expect(pagerElement).not.toBeNull();
    expect(pagerPreviousElement).not.toBeNull();
    expect(pagerNextElement).not.toBeNull();
  });

  it("when hidePagerWithOneFeature is set to true it not show the pager when there is only one feature", () => {
    const feature = new Feature({ test: "123" });

    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature],
      layerTitle: "title",
      layerId: "id"
    };
    featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
      { test: "123" }
    ]);
    component.hidePagerWithOneFeature = true;

    const pagerElement = nativeElement.querySelector(".ggc-fi-pager");
    const pagerPreviousElement = nativeElement.querySelector(
      ".ggc-fi-pager-previous"
    );
    const pagerNextElement = nativeElement.querySelector(".ggc-fi-pager-next");

    expect(pagerElement).toBeNull();
    expect(pagerPreviousElement).toBeNull();
    expect(pagerNextElement).toBeNull();
  });

  it("when hidePagerWithOneFeature is set to true, but there is more than 1 feature, it should show the pager", () => {
    const feature = new Feature({ test: "123" });
    const secondFeature = new Feature({ test: "456" });
    component.hidePagerWithOneFeature = true;
    featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
      { test: "123" },
      { test: "456" }
    ]);
    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature, secondFeature],
      layerTitle: "title",
      layerId: "id"
    };

    fixture.detectChanges();

    const pagerElement = nativeElement.querySelector(".ggc-fi-pager");
    const pagerPreviousElement = nativeElement.querySelector(
      ".ggc-fi-pager-previous"
    );
    const pagerNextElement = nativeElement.querySelector(".ggc-fi-pager-next");

    expect(pagerElement).not.toBeNull();
    expect(pagerPreviousElement).not.toBeNull();
    expect(pagerNextElement).not.toBeNull();
  });

  it("should use provided pagerPrevious and pagerNext values", () => {
    const feature = new Feature({ test: "123" });
    const secondFeature = new Feature({ test: "456" });

    featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
      { test: "123" },
      { test: "456" }
    ]);

    component.pagerPrevious = "previous";
    component.pagerNext = "next";

    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature, secondFeature],
      layerTitle: "title",
      layerId: "id"
    };

    fixture.detectChanges();

    const pagerPreviousElement = nativeElement.querySelector(
      ".ggc-fi-pager-previous"
    );
    const pagerNextElement = nativeElement.querySelector(".ggc-fi-pager-next");

    expect(pagerPreviousElement?.textContent).toBe(" previous ");
    expect(pagerNextElement?.textContent).toBe(" next ");
  });
});

describe("FeatureInfoWrapperComponent", () => {
  let component: GgcFeatureInfoComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        WrapperComponent,
        GgcFeatureInfoComponent,
        ValueTemplateDirective
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WrapperComponent);
    const wrapperComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    component = wrapperComponent.featureInfoChild;
  });

  it("when customTemplates are present, then ngAfterContentInit should add them to the correct customValueTemplates", () => {
    expect(component).toBeDefined();
    expect(component["templates"].length).toBe(5);
    expect(component["customValueTemplates"].size).toBe(3);
    expect(component["customHeaderValueTemplates"].size).toBe(4);
    expect(component["customValueTemplates"].get("status")).toBeDefined();
    expect(component["customValueTemplates"].get("bronhoudernaam")).toEqual(
      component["customValueTemplates"].get("bronhoudercode")
    );
    expect(
      component["customHeaderValueTemplates"].get("waarde1")
    ).toBeDefined();
    expect(
      component["customHeaderValueTemplates"].get("waarde2")
    ).toBeDefined();
    expect(
      component["customHeaderValueTemplates"].get("waarde3")
    ).toBeDefined();
    expect(
      component["customHeaderValueTemplates"].get("waarde4")
    ).toBeDefined();
    expect(component["customHeaderValueTemplates"].get("waarde1")).not.toEqual(
      component["customHeaderValueTemplates"].get("waarde2")
    );
  });
});
