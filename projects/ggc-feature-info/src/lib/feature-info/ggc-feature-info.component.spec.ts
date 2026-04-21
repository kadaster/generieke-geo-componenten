import { Component, SimpleChange, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { Feature } from "ol";
import {
  ValueTemplateDirective,
  ValueTemplateDirectiveType
} from "../directive/value-template.directive";
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
  @ViewChild(GgcFeatureInfoComponent) featureInfoChild: GgcFeatureInfoComponent;
  protected readonly ValueTemplateDirectiveType = ValueTemplateDirectiveType;
}

describe("FeatureInfoComponent", () => {
  let component: GgcFeatureInfoComponent;
  let fixture: ComponentFixture<GgcFeatureInfoComponent>;
  let nativeElement: HTMLElement;
  const featureInfoConfigServiceSpy: jasmine.SpyObj<GgcFeatureInfoConfigService> =
    jasmine.createSpyObj("FeatureInfoConfigService", [
      "filterAndSortAttributes",
      "checkForCustomValues"
    ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcFeatureInfoComponent, FeatureKeysPipe],
      providers: [
        {
          provide: GgcFeatureInfoConfigService,
          useValue: featureInfoConfigServiceSpy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcFeatureInfoComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    featureInfoConfigServiceSpy.checkForCustomValues.and.returnValue([
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
      features: [feature1]
    };
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([{}]);

    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });
    fixture.detectChanges();

    const emptyMessageElement = nativeElement.querySelector(".ggc-fi-empty");

    expect(emptyMessageElement).toBeNull();
    expect(
      featureInfoConfigServiceSpy.filterAndSortAttributes
    ).toHaveBeenCalled();
  });

  it("when hidePagerWithOneFeature is not set it should default always show the pager", () => {
    const feature = new Feature({ test: "123" });
    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature]
    };
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([
      { test: "123" }
    ]);

    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });
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
      features: [feature]
    };
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([
      { test: "123" }
    ]);

    component.hidePagerWithOneFeature = true;
    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });
    fixture.detectChanges();

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
    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature, secondFeature]
    };
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([
      { test: "123" },
      { test: "456" }
    ]);

    component.hidePagerWithOneFeature = true;
    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });
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

  it("when the pagerPrevious and pagerNext haven't been set, it should be the default < and >", () => {
    const feature = new Feature({ test: "123" });
    const secondFeature = new Feature({ test: "456" });
    component.featureInfoCollection = {
      layerName: "laag",
      features: [feature, secondFeature]
    };
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([
      { test: "123" },
      { test: "456" }
    ]);

    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });

    component.pagerPrevious = "previous";
    component.pagerNext = "next";

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
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        WrapperComponent,
        GgcFeatureInfoComponent,
        ValueTemplateDirective
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
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
