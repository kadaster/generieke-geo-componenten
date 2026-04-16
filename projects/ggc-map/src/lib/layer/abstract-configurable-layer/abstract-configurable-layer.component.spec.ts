import { Component, DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
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
import objectContaining = jasmine.objectContaining;

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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AbstractConfigurableLayerComponent, TestLayerComponent],
      providers: [CoreMapService, GgcCrsConfigService]
    }).compileComponents();
  }));
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
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
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
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
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
      objectContaining({
        zIndex: undefined,
        url: "",
        imageExtent: []
      } as Options)
    );
  });
});
