import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { Layer } from "ol/layer";
import OlMap from "ol/Map";
import { Source } from "ol/source";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapService } from "../../map/service/core-map.service";
import { AbstractBaseLayerComponent } from "./abstract-base-layer.component";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({ template: "" })
class TestLayerComponent extends AbstractBaseLayerComponent<
  Layer<Source, any>
> {
  init(): void {
    super.ngOnInit();
  }

  destroy(): void {
    super.ngOnDestroy();
  }

  setTestLayer(layer: Layer<Source, any>): void {
    this.setLayer(layer);
  }
}

describe("AbstractBaseLayerComponent", () => {
  let component: TestLayerComponent;
  let fixture: ComponentFixture<TestLayerComponent>;
  let coreMapService: CoreMapService;
  let debugElement: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AbstractBaseLayerComponent, TestLayerComponent],
      providers: [CoreMapService, GgcCrsConfigService]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(TestLayerComponent);
    component = fixture.componentInstance;
    coreMapService = TestBed.inject(CoreMapService);
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("mapIndex", () => {
    it("should set default mapIndex", () => {
      expect(component["mapIndex"]).toBe(DEFAULT_MAPINDEX);
    });

    it("should set default mapIndex from options input", () => {
      const optionsmapIndex = "optionsmapIndex";
      component["options"] = { mapIndex: optionsmapIndex };
      component.ngOnInit();

      expect(component["mapIndex"]).toBe(optionsmapIndex);
    });
  });

  describe("layerId", () => {
    it("should generate a layerId when not set", () => {
      component["options"] = { mapIndex: "map" };
      component.ngOnInit();

      expect(component["options"]?.layerId).toBeDefined();
    });

    it("should not call generateLayerId when layerId is sel", () => {
      spyOn(component as any, "generateLayerId");
      component["options"] = { mapIndex: "map", layerId: "test" };
      component.ngOnInit();

      expect(component["generateLayerId"]).not.toHaveBeenCalled();
    });

    it("getLayerId should return layerId", () => {
      component["options"] = { mapIndex: "map", layerId: "test" };

      expect(component.getLayerId()).toBe("test");
    });
  });

  describe("when the component is destroyed,", () => {
    it("removeLayer should be called on the map", () => {
      const removeLayerMock = {
        addLayer(_) {},
        removeLayer(layer) {
          expect(layer.getExtent()).toEqual([1, 2, 3, 4]);
        }
      } as OlMap;

      const getMapSpy = spyOn(coreMapService, "getMap").and.returnValue(
        removeLayerMock
      );
      component.setTestLayer(new Layer({ extent: [1, 2, 3, 4] }));
      component.ngOnDestroy();

      expect(getMapSpy).toHaveBeenCalled();
    });
  });
});
