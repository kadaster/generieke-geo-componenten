import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { FeatureKeysPipe } from "../pipe/keys.pipe";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoDisplayComponent } from "./feature-info-display.component";
import { FeatureInfoDisplayType } from "./feature-info-display-type";
import SpyObj = jasmine.SpyObj;
import { provideZoneChangeDetection } from "@angular/core";

describe("FeatureInfoDisplayComponent", () => {
  let component: FeatureInfoDisplayComponent;
  let fixture: ComponentFixture<FeatureInfoDisplayComponent>;
  let featureInfoConfigServiceSpy: SpyObj<GgcFeatureInfoConfigService>;
  let nativeElement: HTMLElement;

  beforeEach(waitForAsync(() => {
    featureInfoConfigServiceSpy = jasmine.createSpyObj(
      "FeatureInfoConfigService",
      ["checkForCustomValues", "filterAndSortAttributes"]
    );
    featureInfoConfigServiceSpy.checkForCustomValues.and.returnValue({});
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
  }));

  beforeEach(() => {
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
    const prepareForDisplaySpy = spyOn(component, "prepareForDisplay");

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
    component.type = FeatureInfoDisplayType.LIST;
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([
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
    featureInfoConfigServiceSpy.filterAndSortAttributes.and.returnValue([
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
