import type { MockedObject } from "vitest";
import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FeatureKeysPipe } from "../pipe/keys.pipe";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoDisplayComponent } from "./feature-info-display.component";
import { FeatureInfoDisplayType } from "./feature-info-display-type";
import { provideZoneChangeDetection } from "@angular/core";

describe("FeatureInfoDisplayComponent", () => {
  let component: FeatureInfoDisplayComponent;
  let fixture: ComponentFixture<FeatureInfoDisplayComponent>;
  let featureInfoConfigServiceSpy: MockedObject<GgcFeatureInfoConfigService>;
  let nativeElement: HTMLElement;

  beforeEach(() => {
    featureInfoConfigServiceSpy = {
      checkForCustomValues: vi
        .fn()
        .mockName("FeatureInfoConfigService.checkForCustomValues"),
      filterAndSortAttributes: vi
        .fn()
        .mockName("FeatureInfoConfigService.filterAndSortAttributes")
    } as unknown as MockedObject<GgcFeatureInfoConfigService>;
    featureInfoConfigServiceSpy.checkForCustomValues.mockReturnValue({});
    TestBed.configureTestingModule({
      imports: [FeatureInfoDisplayComponent, FeatureKeysPipe],
      providers: [
        {
          provide: GgcFeatureInfoConfigService,
          useValue: featureInfoConfigServiceSpy
        },
        provideZoneChangeDetection()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    nativeElement = fixture.nativeElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("prepareForDisplay()", () => {
    it("when prepareForDisplay() is called and currentFeature is an object with one key, objectKeys should have one key", () => {
      component.currentFeature = { dit: "is de key" };

      component.prepareForDisplay();

      expect(component["objectKeys"].length).toEqual(1);
      expect(component["objectKeys"]).toEqual(["dit"]);
    });

    it("when prepareForDisplay() is called and currentFeature is undefined, objectKeys should be an empty array", () => {
      component.prepareForDisplay();

      expect(component["objectKeys"]).toEqual([]);
    });
  });

  it("when a SimpleChange has occured, prepareForDisplay() should be called", () => {
    const prepareForDisplaySpy = vi.spyOn(component, "prepareForDisplay");

    const currentFeature = { bronhoudernaam: "Bergen" };
    component.currentFeature = currentFeature;

    component.ngOnChanges({
      currentFeature: new SimpleChange(null, currentFeature, false)
    });
    fixture.detectChanges();

    expect(prepareForDisplaySpy).toHaveBeenCalled();
  });

  it("when prepareForDisplay() is called, it should call checkForCustomValues() in the FeatureInfoConfigService", () => {
    const currentFeature = { bronhoudernaam: "Bergen" };
    component.currentFeature = currentFeature;

    component.prepareForDisplay();

    // Deze expect zorgt ervoor dat kan worden uitgesloten dat het de methode niet alleen vanuit ngOninit() wordt aangeroepen,
    // omdat anders deze argumenten niet worden meegegeven.
    expect(
      featureInfoConfigServiceSpy.checkForCustomValues
    ).toHaveBeenCalledWith(currentFeature, component["objectKeys"]);
    expect(
      featureInfoConfigServiceSpy.checkForCustomValues
    ).toHaveBeenCalledTimes(2);
  });

  it("when featureInfoDisplayType is featureInfoDisplayType.LIST, it should show a list item", () => {
    fixture.componentRef.setInput("type", FeatureInfoDisplayType.LIST);
    featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
      { test: "123" }
    ]);

    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });
    fixture.detectChanges();

    const ListItemElement = nativeElement.querySelector(".ggc-fi-list-item");
    const TableItemElement = nativeElement.querySelector(".ggc-fi-table");
    expect(ListItemElement).not.toBeNull();
    expect(TableItemElement).toBeNull();
  });

  it("when featureInfoDisplayType is not set, it should show a table item", () => {
    featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
      { test: "123" }
    ]);

    component.ngOnChanges({ featureInfoCollection: {} as SimpleChange });
    fixture.detectChanges();

    const ListItemElement = nativeElement.querySelector(".ggc-fi-list-item");
    const TableItemElement = nativeElement.querySelector(".ggc-fi-table");
    expect(TableItemElement).not.toBeNull();
    expect(ListItemElement).toBeNull();
  });
});

// import type { MockedObject } from "vitest";
// import { ComponentFixture, TestBed } from "@angular/core/testing";
// import { FeatureKeysPipe } from "../pipe/keys.pipe";
// import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
// import { FeatureInfoDisplayComponent } from "./feature-info-display.component";
// import { FeatureInfoDisplayType } from "./feature-info-display-type";
// import { provideZoneChangeDetection } from "@angular/core";
//
// describe("FeatureInfoDisplayComponent", () => {
//   let component: FeatureInfoDisplayComponent;
//   let fixture: ComponentFixture<FeatureInfoDisplayComponent>;
//   let featureInfoConfigServiceSpy: MockedObject<GgcFeatureInfoConfigService>;
//   let nativeElement: HTMLElement;
//
//   beforeEach(async () => {
//     featureInfoConfigServiceSpy = {
//       checkForCustomValues: vi.fn(),
//       filterAndSortAttributes: vi.fn()
//     } as unknown as MockedObject<GgcFeatureInfoConfigService>;
//
//     featureInfoConfigServiceSpy.checkForCustomValues.mockReturnValue({});
//
//     await TestBed.configureTestingModule({
//       imports: [FeatureInfoDisplayComponent, FeatureKeysPipe],
//       providers: [
//         { provide: GgcFeatureInfoConfigService, useValue: featureInfoConfigServiceSpy },
//         provideZoneChangeDetection()
//       ]
//     }).compileComponents();
//
//     fixture = TestBed.createComponent(FeatureInfoDisplayComponent);
//     component = fixture.componentInstance;
//     nativeElement = fixture.nativeElement;
//   });
//
//   it("should create", () => {
//     expect(component).toBeTruthy();
//   });
//
//   describe("prepareForDisplay", () => {
//     it("should extract object keys from currentFeature", () => {
//       component.currentFeature = { dit: "is de key" };
//
//       component.prepareForDisplay();
//
//       expect(component["objectKeys"]).toEqual(["dit"]);
//     });
//
//     it("should handle undefined currentFeature", () => {
//       component.currentFeature = undefined as any;
//
//       component.prepareForDisplay();
//
//       expect(component["objectKeys"]).toEqual([]);
//     });
//
//     it("should call checkForCustomValues with correct args", () => {
//       const input = { bronhoudernaam: "Bergen" };
//       component.currentFeature = input;
//
//       component.prepareForDisplay();
//
//       expect(featureInfoConfigServiceSpy.checkForCustomValues).toHaveBeenCalledWith(
//         input,
//         component["objectKeys"]
//       );
//     });
//   });
//
//   it("should call prepareForDisplay when currentFeature is set and method is invoked", () => {
//     const spy = vi.spyOn(component, "prepareForDisplay");
//
//     component.currentFeature = { bronhoudernaam: "Bergen" };
//
//     component.ngOnChanges({
//       currentFeature: {
//         previousValue: null,
//         currentValue: component.currentFeature,
//         firstChange: false,
//         isFirstChange: () => false
//       } as any
//     });
//
//     expect(spy).toHaveBeenCalled();
//   });
//
//   it("renders LIST view when type is LIST", () => {
//     featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
//       { test: "123" }
//     ]);
//
//     component.type = FeatureInfoDisplayType.LIST;
//     component.currentFeature = { test: "123" };
//
//     component.prepareForDisplay();
//
//     fixture.detectChanges();
//
//     expect(nativeElement.querySelector(".ggc-fi-list-item")).not.toBeNull();
//     expect(nativeElement.querySelector(".ggc-fi-table")).toBeNull();
//   });
//
//   it("renders TABLE view when type is TABLE", () => {
//     featureInfoConfigServiceSpy.filterAndSortAttributes.mockReturnValue([
//       { test: "123" }
//     ]);
//
//     component.type = FeatureInfoDisplayType.TABLE;
//     component.currentFeature = { test: "123" };
//
//     component.prepareForDisplay();
//
//     fixture.detectChanges();
//
//     expect(nativeElement.querySelector(".ggc-fi-table")).not.toBeNull();
//     expect(nativeElement.querySelector(".ggc-fi-list-item")).toBeNull();
//   });
// });
