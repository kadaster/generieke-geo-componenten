import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Layer } from "ol/layer";
import ImageLayer from "ol/layer/Image";
import OlMap from "ol/Map";
import { ImageStatic, Source } from "ol/source";
import ImageSource from "ol/source/Image";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapService } from "../../map/service/core-map.service";
import { AbstractConfigurableLayerComponent } from "./abstract-configurable-layer.component";
import { ViewStateLayerStateExtent } from "ol/View";
import { Options } from "ol/source/ImageStatic";
import { zoomlevelToResolution } from "../../utils/epsg28992";
import { expect } from "vitest";

@Component({ template: "" })
class TestLayerComponent extends AbstractConfigurableLayerComponent<
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

describe("AbstractConfigurableLayerComponent", () => {
  let component: TestLayerComponent;
  let fixture: ComponentFixture<TestLayerComponent>;
  let debugElement: DebugElement;
  let resultLayer: ImageLayer<ImageSource>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AbstractConfigurableLayerComponent, TestLayerComponent],
      providers: [CoreMapService, GgcCrsConfigService]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(TestLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  const addLayerMock = {
    addLayer(layer) {
      resultLayer = layer as ImageLayer<ImageSource>;
    },
    removeLayer(_) {
      return;
    }
  } as OlMap;

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("when attributions is provided via options.attributions, it should be contained in the source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(addLayerMock);
    const layer = new Layer({});

    layer.setSource(new ImageStatic({ url: "//" } as Options));
    component["options"] = {
      attributions: "Options attributie voor de kaartlaag"
    };
    component.ngOnInit();
    component.setTestLayer(layer);

    expect(getMapSpy).toHaveBeenCalled();
    // get and call attribution function to check if attribution has the expected value
    const attributionFunction = resultLayer.getSource()?.getAttributions();
    expect(attributionFunction).not.toBeNull();
    if (attributionFunction) {
      expect(attributionFunction({} as ViewStateLayerStateExtent)).toEqual([
        "Options attributie voor de kaartlaag"
      ]);
    }
  });

  it("should set the layer id from options", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(addLayerMock);
    const layer = new Layer({});

    layer.setSource(new ImageStatic({ url: "//" } as Options));
    component["options"] = { layerId: "test-layer-id" };
    component.setTestLayer(layer);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.get("ggc-layer-id")).toBe("test-layer-id");
  });

  it("should set the layer name from options", () => {
    const layerName = "test-layer-name";
    component["options"] = { layerName };
    component.ngOnInit();

    expect(component["layerName"]).toBe(layerName);
  });

  it("should set the zIndex from options", () => {
    const zIndex = 6;
    component["options"] = { zIndex };
    component.ngOnInit();

    expect(component["layerOptions"].zIndex).toBe(zIndex);
  });

  it("layerOptions should not have property zIndex, when zIndex in not provided", () => {
    component.ngOnInit();

    expect(component["layerOptions"]).not.toEqual(
      expect.objectContaining({
        zIndex: undefined,
        url: "",
        imageExtent: []
      } as Options)
    );
  });

  describe("min/maxZoomLevel", () => {
    it("should set maxResolution based on minZoomLevel when maxResolution is not provided", () => {
      const minZoomLevel = 5;
      component["options"] = { minZoomLevel };

      component.ngOnInit();

      expect(component["layerOptions"].maxResolution).toBe(
        zoomlevelToResolution(minZoomLevel)
      );
    });

    it("should NOT override maxResolution when both minZoomLevel and maxResolution are provided", () => {
      const minZoomLevel = 5;
      const maxResolution = 1234;

      component["options"] = { minZoomLevel, maxResolution };

      component.ngOnInit();

      expect(component["layerOptions"].maxResolution).toBe(maxResolution);
    });

    it("should set minResolution based on maxZoomlevel when minResolution is not provided", () => {
      const maxZoomlevel = 10;
      component["options"] = { maxZoomlevel };

      component.ngOnInit();

      expect(component["layerOptions"].minResolution).toBe(
        zoomlevelToResolution(maxZoomlevel)
      );
    });

    it("should NOT override minResolution when both maxZoomlevel and minResolution are provided", () => {
      const maxZoomlevel = 10;
      const minResolution = 4321;

      component["options"] = { maxZoomlevel, minResolution };

      component.ngOnInit();

      expect(component["layerOptions"].minResolution).toBe(minResolution);
    });
  });
});
