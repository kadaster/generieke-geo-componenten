import type { Mock, MockedObject, MockInstance } from "vitest";
import { DebugElement, SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import Feature, { FeatureLike } from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry, Point } from "ol/geom";
import { Extent } from "ol/extent";
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
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { GgcGeojsonLayerComponent } from "./ggc-geojson-layer.component";
import { ViewStateLayerStateExtent } from "ol/View";
import { featureData, getFoundFeatures } from "../mock/feature.mock";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import {
  LayerChangedEventTrigger,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import Projection from "ol/proj/Projection";
import { filter, firstValueFrom } from "rxjs";

describe("GeojsonLayerComponent", () => {
  let component: GgcGeojsonLayerComponent;
  let fixture: ComponentFixture<GgcGeojsonLayerComponent>;
  let debugElement: DebugElement;
  let resultLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  let coreSelectionServiceSpy: MockedObject<CoreSelectionService>;

  beforeEach(() => {
    coreSelectionServiceSpy = {
      handleFeatureInfoForLayer: vi
        .fn()
        .mockName("CoreSelectionServiceSpy.handleFeatureInfoForLayer")
    } as unknown as MockedObject<CoreSelectionService>;
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
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(GgcGeojsonLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
  });

  const createMapSpy = () =>
    ({
      addLayer: vi.fn().mockImplementation((layer) => {
        resultLayer = layer as VectorLayer<VectorSource<Feature<Geometry>>>;
      }),
      removeLayer: vi.fn(),
      forEachFeatureAtPixel: vi.fn().mockName("ol.Map.forEachFeatureAtPixel")
    }) as unknown as MockedObject<OlMap>;

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("when attributions is provided for a layer, it should be contained in the source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());

    component.options.set({
      sourceOptions: {
        attributions: "Een attributie voor de GeoJSON kaartlaag"
      }
    });
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

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());

    component.options.set({
      sourceOptions: {},
      sourceClusterOptions: {
        attributions: "Een attributie voor de GeoJSON kaartlaag",
        distance: 10
      }
    });
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

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());

    component.options.set({
      sourceOptions: {
        attributions: undefined
      }
    });
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorSource<Feature<Geometry>> = resultLayer.getSource()!;
    expect(source.getAttributions()).toBeNull();
  });

  it("when an url is provided, it should be applied to the source", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());

    component.options.set({
      sourceOptions: {
        url: "test-url"
      }
    });
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    const source: VectorSource<Feature<Geometry>> = resultLayer.getSource()!;
    expect(source.getUrl()).toBe("test-url");
  });

  it("when an Openlayers style object is provided, it should be applied to the layer", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());

    component.options.set({
      layerOptions: {
        style: new Style({
          stroke: new Stroke({
            color: [63, 195, 128, 1],
            width: 3
          })
        })
      }
    });

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
    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());

    component.options.set({
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
    });

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

    component.options.set({
      layerOptions: {
        minResolution: 100
      }
    });

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getMinResolution()).toBe(100);
  });

  it("when maxResolution is supplied to a layer, it should be used as a parameter", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options.set({
      layerOptions: {
        maxResolution: 861
      }
    });

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getMaxResolution()).toBe(861);
  });

  it("when zIndex is supplied to a layer, it should be used as a parameter", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options.set({
      layerOptions: {
        zIndex: 123
      }
    });

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.getZIndex()).toBe(123);
  });

  it("when clusterDistance is supplied, the layer should have a cluster source and distance should be set", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    component.options.set({
      sourceClusterOptions: {
        distance: 40
      }
    });

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());
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
    component.options.set({ layerId: "testLayer" });

    const getMapSpy = vi
      .spyOn<CoreMapService, any>(coreMapService, "getMap")
      .mockReturnValue(createMapSpy());
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
    expect(resultLayer.get("ggc-layer-id")).toBe("testLayer");
  });

  it(
    "should return a feature to the foundFeatures-array if the maxFeaturesonSingleclick is not yet reached " +
      "when limitFeatures() is called",
    () => {
      component.options.set({ maxFeaturesOnSingleclick: 5 });
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
    component.options.set({ maxFeaturesOnSingleclick: 14 });
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

  it("should emit an event if getFeatureInfoOnSingleclick is true and the forEachFeaturePixelAt function returns features", async () => {
    component.options.set({
      mapIndex: "test-map",
      layerName: "test-layer",
      getFeatureInfoOnSingleclick: true
    });
    component.ngOnInit();
    const mapSpy = createMapSpy();
    component["map"] = mapSpy as unknown as OlMap;

    const emittedEvents: MapComponentEvent[] = [];
    component.events.subscribe((event) => emittedEvents.push(event));
    const pixel: Pixel = [123, 456];
    const evt = { pixel } as MapBrowserEvent;

    component.events.subscribe((emittedEvent: MapComponentEvent) => {
      expect(emittedEvent.type).toBe(MapComponentEventTypes.GEOJSONFEATUREINFO);
      expect(emittedEvent.mapIndex).toBe("test-map");
      expect(emittedEvent.layerName).toBe("test-layer");
      expect(emittedEvent.message).toBe("GeoJSON getFeatureInfo resultaten: ");
      expect(emittedEvent.value).toEqual([]);

      expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalled();
      expect(emittedEvents).toHaveLength(1);
      expect(
        coreSelectionServiceSpy.handleFeatureInfoForLayer
      ).toHaveBeenCalled();
    });

    mapSpy.forEachFeatureAtPixel;
    component.getFeatureInfo(evt);
  });

  it("should pass pixel and hit tolerance to function forEachFeaturePixelAt", () => {
    component.options.set({
      mapIndex: "test-map",
      hitTolerance: 5,
      getFeatureInfoOnSingleclick: true
    });
    component.ngOnInit();
    const mapSpy = createMapSpy();
    component["map"] = mapSpy as unknown as OlMap;

    const pixel: Pixel = [123, 456];
    const evt = { pixel } as MapBrowserEvent;

    mapSpy.forEachFeatureAtPixel;
    component.getFeatureInfo(evt);

    expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalled();
    expect(component["map"].forEachFeatureAtPixel).toHaveBeenCalledWith(
      pixel,
      expect.any(Function),
      { layerFilter: expect.any(Function), hitTolerance: 5 }
    );
  });

  describe("Dynamic url change", () => {
    let vectorSource: VectorSource<Feature<Geometry>>;
    let getSourceSpy: MockInstance;
    let vectorSourceUrlSpy: Mock;
    let vectorSourceRefreshSpy: Mock;

    beforeEach(() => {
      vectorSource = createTestVectorSource();
      getSourceSpy = vi.spyOn(component["olLayer"], "getSource");
      vectorSourceUrlSpy = vi.spyOn(vectorSource, "setUrl");
      vectorSourceRefreshSpy = vi.spyOn(vectorSource, "refresh");
    });

    it("should change the url and refresh the VectorSource when the url is changed via a SimpleChange", () => {
      getSourceSpy.mockReturnValue(vectorSource);

      component.options.set({ sourceOptions: { url: "currentUrl" } });
      component.ngOnChanges({
        options: new SimpleChange(
          component.options(),
          { sourceOptions: { url: "newUrl" } },
          false
        )
      });

      expect(getSourceSpy).toHaveBeenCalled();
      expect(vectorSourceUrlSpy).toHaveBeenCalledWith("newUrl");
      expect(vectorSourceRefreshSpy).toHaveBeenCalled();
    });

    it("should NOT change the url and when the url is a firstChange", () => {
      getSourceSpy.mockReturnValue(vectorSource);

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
      const getSourceSpy = vi.spyOn(component["olLayer"], "getSource");
      getSourceSpy.mockReturnValue(vectorSource);
      vi.spyOn(vectorSource, "clear");
      vi.spyOn(vectorSource, "addFeatures").mockImplementation(() => {
        /* empty */
      });

      const features = [new Feature(new Point([194190, 465880]))];
      component.options.set({ features });
      component.ngOnChanges({
        options: new SimpleChange(
          component.options(),
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
      const getClusterSourceSpy = vi.spyOn(component["olLayer"], "getSource");
      getClusterSourceSpy.mockReturnValue(clusterSource);
      const getSourceSpy = vi.spyOn(clusterSource, "getSource");
      getSourceSpy.mockReturnValue(vectorSource);

      vi.spyOn(vectorSource, "clear");
      vi.spyOn(vectorSource, "addFeatures").mockImplementation(() => {
        /* empty */
      });

      const features = [new Feature(new Point([194190, 465880]))];
      component.options.set({ features });
      component.ngOnChanges({
        options: new SimpleChange(
          component.options(),
          { sourceOptions: { features } },
          false
        )
      });

      expect(vectorSource.clear).toHaveBeenCalled();
      expect(vectorSource.addFeatures).toHaveBeenCalledWith(features);
    });
  });

  describe("URL parameters", () => {
    const extent: Extent = [0, 0, 1, 1];
    const projection = new Projection({ code: "EPSG:28992" });
    const featureCollection = (id: number) => ({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [194000, 469000] },
          properties: { id }
        }
      ]
    });
    let coreMapService: CoreMapService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
      coreMapService = TestBed.inject(CoreMapService);
      httpTestingController = TestBed.inject(HttpTestingController);
      vi.spyOn(coreMapService, "getMap").mockReturnValue(createMapSpy());
    });

    afterEach(() => {
      httpTestingController.verify();
      vi.unstubAllGlobals();
    });

    it("should encode parameters and override matching base URL parameters without changing the base URL", async () => {
      const fetchSpy = vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          new Response(JSON.stringify(featureCollection(1)), { status: 200 })
        );
      vi.stubGlobal("fetch", fetchSpy);
      const baseUrl = "/data.geojson?f=json&filter=oud&filter=ander#kaart";
      const requestUrl =
        "/data.geojson?f=json&filter=sectie+%3D+A%26B&kenmerk=a%2Fb#kaart";
      component.options.set({
        url: baseUrl,
        customHeaders: [["X-Test", "voorbeeld"]],
        urlParameters: [
          { parameterName: "filter", parameterValue: "sectie = A&B" },
          { parameterName: "kenmerk", parameterValue: "a/b" }
        ]
      });

      component.ngOnInit();
      const vectorSource = resultLayer.getSource();
      if (!vectorSource) {
        throw new Error("Expected a vector source");
      }
      expect(vectorSource.getUrl()).toBe(requestUrl);
      vectorSource.loadFeatures(extent, 1, projection);

      expect(fetchSpy).toHaveBeenCalledWith(
        requestUrl,
        expect.objectContaining({ headers: [["X-Test", "voorbeeld"]] })
      );
      await vi.waitFor(() =>
        expect(
          vectorSource.getFeatures().map((feature) => feature.get("id"))
        ).toEqual([1])
      );
      expect(component.options()?.url).toBe(baseUrl);
    });

    it("should reload the existing source and ignore an older GeoJSON response", async () => {
      let resolveOldResponse: ((response: Response) => void) | undefined;
      const oldRequest = new Promise<Response>((resolve) => {
        resolveOldResponse = resolve;
      });
      const oldResponse = new Response();
      const oldJsonSpy = vi
        .spyOn(oldResponse, "json")
        .mockResolvedValue(featureCollection(1));
      const fetchSpy = vi
        .fn<typeof fetch>()
        .mockReturnValueOnce(oldRequest)
        .mockResolvedValueOnce(
          new Response(JSON.stringify(featureCollection(2)), { status: 200 })
        );
      vi.stubGlobal("fetch", fetchSpy);
      component.options.set({
        url: "/data.geojson?filter=basis",
        urlParameters: [{ parameterName: "filter", parameterValue: "oud" }]
      });
      component.ngOnInit();
      const layer = resultLayer;
      const vectorSource = layer.getSource();
      if (!vectorSource) {
        throw new Error("Expected a vector source");
      }
      vectorSource.loadFeatures(extent, 1, projection);

      component.setUrlParameters([
        { parameterName: "filter", parameterValue: "nieuw" }
      ]);
      expect(vectorSource.getUrl()).toBe("/data.geojson?filter=nieuw");
      vectorSource.loadFeatures(extent, 1, projection);
      await vi.waitFor(() =>
        expect(
          vectorSource.getFeatures().map((feature) => feature.get("id"))
        ).toEqual([2])
      );

      if (!resolveOldResponse) {
        throw new Error("Expected the first request to be pending");
      }
      resolveOldResponse(oldResponse);
      await vi.waitFor(() => expect(oldJsonSpy).toHaveBeenCalled());
      await Promise.resolve();
      expect(
        vectorSource.getFeatures().map((feature) => feature.get("id"))
      ).toEqual([2]);
      expect(resultLayer).toBe(layer);

      component.setUrlParameters([]);
      expect(vectorSource.getUrl()).toBe("/data.geojson?filter=basis");
      expect(component.options()?.url).toBe("/data.geojson?filter=basis");
    });

    it("should reload OGC features with the updated parameters", async () => {
      const baseUrl =
        "https://example.test/collections/perceel/items?filter=basis&limit=5";
      component.options.set({
        url: baseUrl,
        layerId: "perceel",
        mapIndex: "map",
        limit: 10,
        urlParameters: [
          { parameterName: "filter", parameterValue: "oud" },
          { parameterName: "limit", parameterValue: "2" }
        ]
      });
      component.ngOnInit();
      const layer = resultLayer;
      const vectorSource = layer.getSource();
      if (!vectorSource) {
        throw new Error("Expected a vector source");
      }

      httpTestingController
        .expectOne((request) => {
          const url = new URL(request.url);
          return (
            url.searchParams.get("filter") === "oud" &&
            url.searchParams.get("limit") === "2"
          );
        })
        .flush(featureCollection(1));
      await vi.waitFor(() =>
        expect(vectorSource.getFeatures()).toHaveLength(1)
      );

      component.setUrlParameters([
        { parameterName: "filter", parameterValue: "nieuw" }
      ]);
      expect(vectorSource.getFeatures()).toHaveLength(0);
      httpTestingController
        .expectOne((request) => {
          const url = new URL(request.url);
          return (
            url.searchParams.get("filter") === "nieuw" &&
            url.searchParams.get("limit") === "10"
          );
        })
        .flush(featureCollection(2));
      await vi.waitFor(() =>
        expect(
          vectorSource.getFeatures().map((feature) => feature.get("id"))
        ).toEqual([2])
      );

      expect(resultLayer).toBe(layer);
      expect(component.options()?.url).toBe(baseUrl);
    });
  });

  describe("Layer loaded error event", () => {
    let coreMapService: CoreMapService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
      coreMapService = TestBed.inject(CoreMapService);
      httpTestingController = TestBed.inject(HttpTestingController);
      vi.spyOn<CoreMapService, any>(coreMapService, "getMap").mockReturnValue(
        createMapSpy()
      );
      vi.spyOn(console, "error").mockImplementation(() => {
        /* empty */
      });
    });

    afterEach(() => {
      httpTestingController.verify();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    const getLayerLoadedErrorEvent = () =>
      firstValueFrom(
        coreMapService
          .getLayerChangedObservable()
          .pipe(
            filter(
              (event) =>
                event.eventTrigger ===
                LayerChangedEventTrigger.LAYER_LOADED_ERROR
            )
          )
      );

    it("should emit a LAYER_LOADED_ERROR event when the GeoJSON url cannot be loaded", async () => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockName("fetch")
          .mockResolvedValue({ ok: false, status: 404 } as Response)
      );
      component.options.set({
        url: "https://example.com/foutieve-url.json",
        layerId: "geojson-layer",
        mapIndex: "test-map"
      });
      component.ngOnInit();
      const layerLoadedErrorEvent = getLayerLoadedErrorEvent();

      component["vectorSource"].loadFeatures(
        [0, 0, 1, 1],
        1,
        new Projection({ code: "EPSG:28992" })
      );

      expect(await layerLoadedErrorEvent).toEqual({
        layerId: "geojson-layer",
        mapIndex: "test-map",
        eventTrigger: LayerChangedEventTrigger.LAYER_LOADED_ERROR
      });
    });

    it("should emit a LAYER_LOADED_ERROR event when the OGC API features url cannot be loaded", async () => {
      const ogcApiFeaturesUrl =
        "https://example.com/ogc/collections/foutief/items";
      component.options.set({
        url: ogcApiFeaturesUrl,
        layerId: "ogc-api-features-layer",
        mapIndex: "test-map"
      });
      const layerLoadedErrorEvent = getLayerLoadedErrorEvent();
      component.ngOnInit();

      httpTestingController
        .expectOne((request) => request.url.startsWith(ogcApiFeaturesUrl))
        .flush("Not Found", { status: 404, statusText: "Not Found" });

      expect(await layerLoadedErrorEvent).toEqual({
        layerId: "ogc-api-features-layer",
        mapIndex: "test-map",
        eventTrigger: LayerChangedEventTrigger.LAYER_LOADED_ERROR
      });
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
