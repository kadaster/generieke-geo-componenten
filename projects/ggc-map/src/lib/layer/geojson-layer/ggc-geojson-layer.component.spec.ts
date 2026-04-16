import { DebugElement, SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import Feature, { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, Point } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { Pixel } from "ol/pixel";
import Cluster from "ol/source/Cluster";
import OSM from "ol/source/OSM";
import VectorSource from "ol/source/Vector";
import Stroke from "ol/style/Stroke";
import Style, { StyleFunction } from "ol/style/Style";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../../map/service/core-map-events.service";
import { CoreMapService } from "../../map/service/core-map.service";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { GgcGeojsonLayerComponent } from "./ggc-geojson-layer.component";
import { ViewStateLayerStateExtent } from "ol/View";
import { featureData, getFoundFeatures } from "../mock/feature.mock";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";

describe("GeojsonLayerComponent", () => {
  let component: GgcGeojsonLayerComponent;
  let fixture: ComponentFixture<GgcGeojsonLayerComponent>;
  let debugElement: DebugElement;
  let resultLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;

  beforeEach(waitForAsync(() => {
    coreSelectionServiceSpy = jasmine.createSpyObj("CoreSelectionServiceSpy", [
      "handleFeatureInfoForLayer",
      "clearFeatureInfoForLayer"
    ]);
    TestBed.configureTestingModule({
      imports: [GgcGeojsonLayerComponent],
      providers: [
        CoreMapService,
        GgcCrsConfigService,
        CoreMapEventsService,
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(GgcGeojsonLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  const addLayerMock = {
    addLayer(layer) {
      resultLayer = layer as VectorLayer<VectorSource<Feature<Geometry>>>;
    },
    removeLayer(_layer) {
      return;
    }
  } as OlMap;

  const createMapSpy = () => {
    // create ol.Map mock
    const mapSpy: jasmine.SpyObj<OlMap> = jasmine.createSpyObj("ol.Map", [
      "forEachFeatureAtPixel",
      "removeLayer"
    ]);
    mapSpy.forEachFeatureAtPixel.and.callThrough();
    mapSpy.removeLayer.and.stub();
    return mapSpy;
  };

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("when attributions is provided for a layer, it should be contained in the source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);

    component.options = {
      sourceOptions: {
        attributions: "Een attributie voor de GeoJSON kaartlaag"
      }
    };
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorSource<Feature<Geometry>> = resultLayer.getSource()!;
    // get and call attribution function to check if attribution has the expected value
    const attributionFunction = source.getAttributions();
    expect(attributionFunction).not.toBeNull();
    if (attributionFunction) {
      expect(attributionFunction({} as ViewStateLayerStateExtent)).toEqual([
        "Een attributie voor de GeoJSON kaartlaag"
      ]);
    }
  });

  it("when attributions is provided for a layer with clusterDistance, it should be contained in the cluster source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);

    component.options = {
      sourceOptions: {},
      sourceClusterOptions: {
        attributions: "Een attributie voor de GeoJSON kaartlaag",
        distance: 10
      }
    };
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const clusterSource: Cluster<Feature> =
      resultLayer.getSource() as Cluster<Feature>;
    expect(clusterSource.getDistance()).toBe(10);
    // get and call attribution function to check if attribution has the expected value
    const attributionFunction = clusterSource.getAttributions();
    expect(attributionFunction).not.toBeNull();
    if (attributionFunction) {
      expect(attributionFunction({} as ViewStateLayerStateExtent)).toEqual([
        "Een attributie voor de GeoJSON kaartlaag"
      ]);
    }
  });

  it("when attributions is undefined for a layer, it should not be contained in te source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);

    component.options = {
      sourceOptions: {
        attributions: undefined
      }
    };
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorSource<Feature<Geometry>> = resultLayer.getSource()!;
    expect(source.getAttributions()).toBeNull();
  });

  it("when an url is provided, it should be applied to the source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);

    component.options = {
      sourceOptions: {
        url: "test-url"
      }
    };
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorSource<Feature<Geometry>> = resultLayer.getSource()!;
    expect(source.getUrl()).toBe("test-url");
  });

  it("when an Openlayers style object is provided, it should be applied to the layer", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);

    component.options = {
      layerOptions: {
        style: new Style({
          stroke: new Stroke({
            color: [63, 195, 128, 1],
            width: 3
          })
        })
      }
    };

    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const styleObject: Style = resultLayer.getStyle() as Style;
    const strokeObject: Stroke | null = styleObject.getStroke();
    expect(strokeObject?.getColor()).toEqual([63, 195, 128, 1]);
    expect(strokeObject?.getWidth()).toBe(3);
  });

  it("when an Openlayers StyleFunction is provided and called, it should be applied to the layer", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);

    component.options = {
      layerOptions: {
        style: () => {
          return new Style({
            stroke: new Stroke({
              color: [63, 195, 128, 1],
              width: 3
            })
          });
        }
      }
    };

    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const styleFunction = resultLayer.getStyle() as StyleFunction;
    const styleObject = styleFunction({} as FeatureLike, 0) as Style;
    const strokeObject = styleObject.getStroke();
    expect(strokeObject?.getColor()).toEqual([63, 195, 128, 1]);
    expect(strokeObject?.getWidth()).toBe(3);
  });

  it("when minResolution is supplied to a layer, it should be used as a parameter", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    component.options = {
      layerOptions: {
        minResolution: 100
      }
    };

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getMinResolution()).toBe(100);
  });

  it("when maxResolution is supplied to a layer, it should be used as a parameter", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options = {
      layerOptions: {
        maxResolution: 861
      }
    };

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getMaxResolution()).toBe(861);
  });

  it("when zIndex is supplied to a layer, it should be used as a parameter", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options = {
      layerOptions: {
        zIndex: 123
      }
    };

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getZIndex()).toBe(123);
  });

  it("when clusterDistance is supplied, the layer should have a cluster source and distance should be set", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options = {
      sourceClusterOptions: {
        distance: 40
      }
    };

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    // NOTE: jasmine 3.5.0 introduces toBeInstanceOf()
    expect(
      (resultLayer.getSource() as Cluster<Feature>) instanceof Cluster
    ).toBeTruthy();
    expect((resultLayer.getSource() as Cluster<Feature>).getDistance()).toBe(
      40
    );
  });

  it("when layerId is supplied to a layer, it should be used as a property", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options = { layerId: "testLayer" };

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(addLayerMock);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.get("ggc-layer-id")).toBe("testLayer");
  });

  it("when getFeatureInfoOnSingleclick is true, add singleclick listener to map", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const mapEventsService: CoreMapEventsService =
      debugElement.injector.get(CoreMapEventsService);
    const mapEventsServicespy = spyOn<CoreMapEventsService, any>(
      mapEventsService,
      "getSingleclickObservableForMap"
    ).and.callThrough();
    component.options = { getFeatureInfoOnSingleclick: true };
    const onMock = {
      addLayer(_layer) {
        return;
      },
      removeLayer(_layer) {
        return;
      }
    } as OlMap;

    const getMapSpy = spyOn<CoreMapService, any>(
      coreMapService,
      "getMap"
    ).and.returnValue(onMock);
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(mapEventsServicespy).toHaveBeenCalled();
  });

  it(
    "should return a feature to the foundFeatures-array if the maxFeaturesonSingleclick is not yet reached " +
      "when limitFeatures() is called",
    () => {
      component.options = { maxFeaturesOnSingleclick: 5 };
      // Preparing the foundFeatures-array with already 4 features in it.
      component["foundFeatures"] = getFoundFeatures(4);
      component["limitFeatures"](featureData);

      expect(component["foundFeatures"].length).toBe(5);
    }
  );

  it(
    "should NOT return a feature to the foundFeatures-array if maxFeaturesonSingleclick is not changed and" +
      "the array size is already 8 (default limit) when is limitFeatures() is called",
    () => {
      // Preparing the foundFeatures-array with already 8 features in it.
      component["foundFeatures"] = getFoundFeatures(8);

      component["limitFeatures"](featureData);
      expect(component["foundFeatures"].length).toBe(8);
    }
  );

  it("should NOT return a feature to the foundFeatures-array if maxFeaturesonSingleclick is already reached when limitFeatures() is called", () => {
    component.options = { maxFeaturesOnSingleclick: 14 };
    // Preparing the foundFeatures-array with already 14 features in it.
    component["foundFeatures"] = getFoundFeatures(14);
    component["limitFeatures"](featureData);
    expect(component["foundFeatures"].length).toBe(14);
  });

  it("should return true for the layerCandidate from which features should be extracted when decideLayerCandidate() is called", () => {
    const vectorLayer = new VectorLayer({});
    component["olLayer"] = vectorLayer;

    const decidedLayer: boolean =
      component["decideLayerCandidate"](vectorLayer);

    expect(decidedLayer).toBe(true);
  });

  it(
    "should return true for the cluster layerCandidate from which features should be extracted when decideLayerCandidate() " +
      "is called",
    () => {
      const clusterLayer = new VectorLayer({ source: new Cluster({}) });
      component["olLayer"] = clusterLayer;

      const decidedLayer: boolean =
        component["decideLayerCandidate"](clusterLayer);

      expect(decidedLayer).toBe(true);
    }
  );

  it("should return false for the layerCandidate from which features should NOT be extracted when decideLayerCandidate() is called", () => {
    component["vectorSource"] = createTestVectorSource();
    const wrongLayerCandidate = new Layer({
      source: new OSM({
        url: "test-url"
      })
    });

    const decidedLayer: boolean =
      component["decideLayerCandidate"](wrongLayerCandidate);
    expect(decidedLayer).toBe(false);
  });

  it("should emit an event if getFeatureInfoOnSingleclick is true and the forEachFeaturePixelAt function returns features", (done) => {
    component.options = {
      mapIndex: "test-map",
      layerName: "test-layer",
      getFeatureInfoOnSingleclick: true
    };
    component.ngOnInit();
    const mapSpy = createMapSpy();
    component["map"] = mapSpy;

    const eventSpy = spyOn(component.events, "emit").and.callThrough();
    const pixel: Pixel = [123, 456];
    const evt = { pixel } as MapBrowserEvent;

    component.events.subscribe((emittedEvent: MapComponentEvent) => {
      expect(emittedEvent.type).toBe(MapComponentEventTypes.GEOJSONFEATUREINFO);
      expect(emittedEvent.mapIndex).toBe("test-map");
      expect(emittedEvent.layerName).toBe("test-layer");
      expect(emittedEvent.message).toBe("GeoJSON getFeatureInfo resultaten: ");
      expect(emittedEvent.value).toEqual([]);

      expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalled();
      expect(
        coreSelectionServiceSpy.handleFeatureInfoForLayer
      ).toHaveBeenCalled();
      done();
    });

    mapSpy.forEachFeatureAtPixel.and.callThrough();
    component.getFeatureInfo(evt);
  });

  it("should pass pixel and hit tolerance to function forEachFeaturePixelAt", () => {
    component.options = {
      mapIndex: "test-map",
      hitTolerance: 5,
      getFeatureInfoOnSingleclick: true
    };
    component.ngOnInit();
    const mapSpy = createMapSpy();
    component["map"] = mapSpy;

    const pixel: Pixel = [123, 456];
    const evt = { pixel } as MapBrowserEvent;

    mapSpy.forEachFeatureAtPixel.and.callThrough();
    component.getFeatureInfo(evt);

    expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalled();
    expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalledWith(
      pixel,
      jasmine.any(Function),
      { layerFilter: jasmine.any(Function), hitTolerance: 5 }
    );
  });

  describe("Dynamic url change", () => {
    let vectorSource: VectorSource<Feature<Geometry>>;
    let getSourceSpy: jasmine.Spy;
    let vectorSourceUrlSpy: jasmine.Spy;
    let vectorSourceRefreshSpy: jasmine.Spy;

    beforeEach(() => {
      vectorSource = createTestVectorSource();
      getSourceSpy = spyOn(component["olLayer"], "getSource");
      vectorSourceUrlSpy = spyOn(vectorSource, "setUrl");
      vectorSourceRefreshSpy = spyOn(vectorSource, "refresh");
    });

    it("should change the url and refresh the VectorSource when the url is changed via a SimpleChange", () => {
      getSourceSpy.and.returnValue(vectorSource);

      component.options = { sourceOptions: { url: "currentUrl" } };
      component.ngOnChanges({
        options: new SimpleChange(
          component.options,
          { sourceOptions: { url: "newUrl" } },
          false
        )
      });

      expect(getSourceSpy).toHaveBeenCalled();
      expect(vectorSourceUrlSpy).toHaveBeenCalledWith("newUrl");
      expect(vectorSourceRefreshSpy).toHaveBeenCalled();
    });

    it("should NOT change the url and when the url is a firstChange", () => {
      getSourceSpy.and.returnValue(vectorSource);

      component.ngOnChanges({
        options: new SimpleChange(
          null,
          { sourceOptions: { url: "firstUrl" } },
          true
        )
      });

      expect(getSourceSpy).not.toHaveBeenCalled();
      expect(vectorSourceUrlSpy).not.toHaveBeenCalled();
      expect(vectorSourceRefreshSpy).not.toHaveBeenCalled();
    });
  });

  describe("Add features dynamically", () => {
    it("should add the features to the source", () => {
      const vectorSource = createTestVectorSource();
      const getSourceSpy = spyOn(component["olLayer"], "getSource");
      getSourceSpy.and.returnValue(vectorSource);
      spyOn(vectorSource, "clear").and.callThrough();
      spyOn(vectorSource, "addFeatures").and.stub();

      const features = [new Feature(new Point([194190, 465880]))];
      component.options = { features };
      component.ngOnChanges({
        options: new SimpleChange(
          component.options,
          { sourceOptions: { features } },
          false
        )
      });

      expect(vectorSource.clear).toHaveBeenCalled();
      expect(vectorSource.addFeatures).toHaveBeenCalledWith(features);
    });

    it("should add the features to the VectorSource in the Cluster", () => {
      const vectorSource = createTestVectorSource();
      const clusterSource = new Cluster({
        source: vectorSource
      });
      const getClusterSourceSpy = spyOn(component["olLayer"], "getSource");
      getClusterSourceSpy.and.returnValue(clusterSource);
      const getSourceSpy = spyOn(clusterSource, "getSource");
      getSourceSpy.and.returnValue(vectorSource);

      spyOn(vectorSource, "clear").and.callThrough();
      spyOn(vectorSource, "addFeatures").and.stub();

      const features = [new Feature(new Point([194190, 465880]))];
      component.options = { features };
      component.ngOnChanges({
        options: new SimpleChange(
          component.options,
          { sourceOptions: { features } },
          false
        )
      });

      expect(vectorSource.clear).toHaveBeenCalled();
      expect(vectorSource.addFeatures).toHaveBeenCalledWith(features);
    });
  });

  function getGeoJsonFormat() {
    return {} as GeoJSON;
  }

  function createTestVectorSource() {
    return new VectorSource({
      format: getGeoJsonFormat(),
      url: "test-url"
    });
  }
});
