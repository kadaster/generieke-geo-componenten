import Geometry from "ol/geom/Geometry";
import { GgcFeatureInfoComponent } from "./ggc-feature-info.component";
import { SimpleChange, SimpleChanges } from "@angular/core";
import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import Feature from "ol/Feature";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideZoneChangeDetection } from "@angular/core";

describe("FeatureInfoComponent, no testbed", () => {
  let component: GgcFeatureInfoComponent;
  let fixture: ComponentFixture<GgcFeatureInfoComponent>;
  const simpleChanges: SimpleChanges = {
    featureInfoCollection: {} as SimpleChange
  };
  let featureInfoConfigSpy: jasmine.SpyObj<GgcFeatureInfoConfigService>;
  let event: FeatureInfoComponentEvent;

  beforeEach(() => {
    featureInfoConfigSpy = jasmine.createSpyObj("FeatureInfoConfigService", [
      "filterAndSortAttributes"
    ]);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: GgcFeatureInfoConfigService,
          useValue: featureInfoConfigSpy
        },
        provideZoneChangeDetection()
      ]
    });
    fixture = TestBed.createComponent(GgcFeatureInfoComponent);
    component = fixture.componentInstance;
    component.events.subscribe(
      (featureInfoComponentEvent: FeatureInfoComponentEvent) => {
        event = featureInfoComponentEvent;
      }
    );
  });

  describe("when array is not present", () => {
    beforeEach(() => {
      component.ngOnChanges(simpleChanges);
    });

    it("goToPreviousFeature should decrease currentFeatureIndex by one", () => {
      component.goToPreviousFeature();
      expect(component["currentFeatureIndex"]).toEqual(-1);
      expect(component["displayFeaturesProperties"]).toBeUndefined();
      expect(
        featureInfoConfigSpy.filterAndSortAttributes
      ).not.toHaveBeenCalled();
      expect(event).toBeDefined();
      expect(event.type).toBe(FeatureInfoComponentEventType.SELECTEDOBJECT);
      expect(event.value).toBeUndefined();
    });

    it("goToNextFeature should increase currentFeatureIndex by one", () => {
      component.goToNextFeature();
      expect(component["currentFeatureIndex"]).toEqual(-1);
      expect(component["displayFeaturesProperties"]).toBeUndefined();
      expect(
        featureInfoConfigSpy.filterAndSortAttributes
      ).not.toHaveBeenCalled();
      expect(event).toBeDefined();
      expect(event.type).toBe(FeatureInfoComponentEventType.SELECTEDOBJECT);
      expect(event.value).toBeUndefined();
    });
  });

  describe("when array has one element", () => {
    let feature1: object;
    beforeEach(() => {
      feature1 = { test: "123" };
      const features = [feature1];
      component.featureInfoCollection = { layerName: "laag", features };
      component["currentFeatureIndex"] = 0;
      featureInfoConfigSpy.filterAndSortAttributes.and.returnValue(features);
      component.ngOnChanges(simpleChanges);
    });

    it("goToPreviousFeature should not change currentFeature and currentFeatureIndex", () => {
      component.goToPreviousFeature();
      expect(component["currentFeatureIndex"]).toEqual(0);
      expect(component["currentFeature"]).toEqual(feature1);
      const displayFeatures = component["displayFeaturesProperties"];
      expect(displayFeatures).toBeDefined();
      expect(displayFeatures?.length).toBe(1);
      expect(featureInfoConfigSpy.filterAndSortAttributes).toHaveBeenCalled();
      expect(event).toBeDefined();
      if (event) {
        expect(event.type).toBe(FeatureInfoComponentEventType.SELECTEDOBJECT);
        expect(event.value).toEqual(feature1);
      }
    });

    it("goToNextFeature should increase currentFeatureIndex by one", () => {
      component.goToNextFeature();
      expect(component["currentFeatureIndex"]).toEqual(0);
      expect(component["currentFeature"]).toEqual(feature1);
      const displayFeatures = component["displayFeaturesProperties"];
      expect(displayFeatures).toBeDefined();
      expect(displayFeatures?.length).toBe(1);
      expect(featureInfoConfigSpy.filterAndSortAttributes).toHaveBeenCalled();
      expect(event).toBeDefined();
      expect(event.type).toBe(FeatureInfoComponentEventType.SELECTEDOBJECT);
      expect(event.value).toEqual(feature1);
    });
  });

  describe("when array has one element", () => {
    it("hasNextFeature should be false", () => {
      expect(component.hasNextFeature()).toEqual(false);
    });

    it("hasPreviousFeature should be false", () => {
      expect(component.hasPreviousFeature()).toEqual(false);
    });
  });

  describe("when array has three elements and the second element is selected", () => {
    let feature1: object;
    let feature3: object;

    beforeEach(() => {
      feature1 = { test: "123" };
      const feature2 = { test: "456" };
      feature3 = { test: "789" };
      const features = [feature1, feature2, feature3];
      component.featureInfoCollection = { layerName: "laag", features };
      featureInfoConfigSpy.filterAndSortAttributes.and.returnValue(features);
      component.ngOnChanges(simpleChanges);
      component["currentFeatureIndex"] = 1;
    });

    it("displayFeatures length should be 3", () => {
      expect(component.hasNextFeature()).toEqual(true);
      const displayFeatures = component["displayFeaturesProperties"];
      expect(displayFeatures).toBeDefined();
      expect(displayFeatures?.length).toBe(3);
    });

    it("hasNextFeature should be true", () => {
      expect(component.hasNextFeature()).toEqual(true);
    });

    it("after goToNextFeature, hasNextFeature should be false", () => {
      component.goToNextFeature();
      expect(component.hasNextFeature()).toEqual(false);
    });

    it("hasPreviousFeature should be true", () => {
      expect(component.hasPreviousFeature()).toEqual(true);
    });

    it("after goToPreviousFeature, hasPreviousFeature should be false", () => {
      component.goToPreviousFeature();
      expect(component.hasPreviousFeature()).toEqual(false);
    });

    it("after goToNextFeature should emit nextFeature", () => {
      component.goToNextFeature();
      expect(component["currentFeatureIndex"]).toEqual(2);
      expect(component["currentFeature"]).toEqual(feature3);
      // check if is has emitted the value
      expect(event).toBeTruthy();
      expect(event.value).toEqual(feature3);
    });

    it("after goToPreviousFeature should emit previousFeature", () => {
      component.goToPreviousFeature();
      expect(component["currentFeatureIndex"]).toEqual(0);
      expect(component["currentFeature"]).toEqual(feature1);
      // check if is has emitted the value
      expect(event).toBeTruthy();
      expect(event.value).toEqual(feature1);
    });
  });

  describe("when the array has features and then is set to undefined", () => {
    beforeEach(() => {
      const feature1 = new Feature({ test: "123" });
      const feature2 = new Feature({ test: "456" });
      const feature3 = new Feature({ test: "789" });
      const features = [feature1, feature2, feature3];
      component.featureInfoCollection = { layerName: "laag", features };
      featureInfoConfigSpy.filterAndSortAttributes.and.returnValue(features);
      component.ngOnChanges(simpleChanges);
      component["currentFeatureIndex"] = 1;

      component.featureInfoCollection = undefined;
      component.ngOnChanges(simpleChanges);
    });

    it("displayFeatures length should be 0", () => {
      expect(component.hasNextFeature()).toEqual(false);
      expect(component["displayFeaturesProperties"]).toBeUndefined();
    });

    it("emitted event should not have a value", () => {
      component.goToNextFeature();
      expect(event).toBeTruthy();
      expect(event.value).toBeUndefined();
    });
  });

  describe("when the array contains objects or features and it needs to be checked on the which type", () => {
    it(
      "when I call getPropertiesFromFeatures and it contains Features," +
        " it should return an object array with the properties of those features",
      () => {
        const arrayContaningFeatures: Feature<Geometry>[] = [];

        const featureOne = new Feature({ x: "x", y: "y", z: "z" });
        const featureTwo = new Feature({ d: "d", e: "e", f: "f" });
        arrayContaningFeatures.push(featureOne, featureTwo);

        const objectArray: object[] = component.getPropertiesFromFeatures(
          arrayContaningFeatures
        );

        expect(objectArray[0]).toEqual({ x: "x", y: "y", z: "z" });
        expect(objectArray[1]).toEqual({ d: "d", e: "e", f: "f" });
      }
    );

    it(
      "when I call getPropertiesFromFeatures and it contains object," +
        " it should return an object array with those objects",
      () => {
        const arrayContaningFeatures: object[] = [];

        const objectOne = { a: "a", b: "b" };
        const objectTwo = { c: "c", d: "d" };
        arrayContaningFeatures.push(objectOne, objectTwo);

        const objectArray: object[] = component.getPropertiesFromFeatures(
          arrayContaningFeatures
        );

        expect(objectArray[0]).toEqual({ a: "a", b: "b" });
        expect(objectArray[1]).toEqual({ c: "c", d: "d" });
      }
    );

    it("when I call checkArrayType and it doesn't contain Features, it should return the array", () => {
      const arrayNotContaningFeatures: Feature<Geometry>[] = [];

      const objectArray: object[] = component.getPropertiesFromFeatures(
        arrayNotContaningFeatures
      );

      expect(objectArray.length).toEqual(0);
    });

    it(
      "when I call ngOnChanges and featureInfoCollection contains features," +
        " it should not modify the features",
      () => {
        const arrayContaningFeatures: Feature<Geometry>[] = [];

        const featureOne = new Feature({ x: "x", y: "y", z: "z" });
        const featureTwo = new Feature({ d: "d", e: "e", f: "f" });
        arrayContaningFeatures.push(featureOne, featureTwo);

        const features = [{ a: "a" }, { b: "b" }];
        component.featureInfoCollection = {
          layerName: "laag",
          features: arrayContaningFeatures
        };
        featureInfoConfigSpy.filterAndSortAttributes.and.returnValue(features);
        component.ngOnChanges(simpleChanges);

        expect(component.featureInfoCollection.features).toBe(
          arrayContaningFeatures
        );
      }
    );
  });
});
