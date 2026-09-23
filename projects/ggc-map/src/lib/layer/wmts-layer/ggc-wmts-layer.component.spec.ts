import type { MockedObject } from "vitest";
import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { View } from "ol";
import { Coordinate } from "ol/coordinate";
import Tile from "ol/layer/Tile";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import TileSource from "ol/source/Tile";
import WMTS from "ol/source/WMTS";
import { of } from "rxjs";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../../map/service/core-map-events.service";
import { CoreMapService } from "../../map/service/core-map.service";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { Capabilities } from "../model/capabilities.model";
import { GgcCapabilitiesService } from "../service/ggc-capabilities.service";
import { GgcWmtsLayerComponent } from "./ggc-wmts-layer.component";
import {
  DEFAULT_MAPINDEX,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";

/**
 * Bouwt een minimale, maar voor `ol`'s `optionsFromCapabilities` volledig
 * geldige WMTS-capabilities structuur op, zodat de echte `ol`-functie
 * (die het component rechtstreeks aanroept) een bruikbare `WMTS`-source
 * kan construeren zonder te crashen.
 */
function createWmtsCapabilitiesFixture(
  layerIdentifier?: string,
  includeFeatureInfoUrl = false
): Record<string, any> {
  return {
    ...(includeFeatureInfoUrl && {
      OperationsMetadata: {
        GetFeatureInfo: {
          DCP: { HTTP: { Get: [{ href: "https://example.com/wmts" }] } }
        }
      }
    }),
    Contents: {
      Layer: [
        {
          Identifier: layerIdentifier,
          TileMatrixSetLink: [{ TileMatrixSet: "EPSG:3857" }],
          Format: ["image/png"],
          Style: [{ Identifier: "default", Title: "default", isDefault: true }],
          ResourceURL: [
            {
              resourceType: "tile",
              format: "image/png",
              template:
                "https://example.com/wmts/{TileMatrix}/{TileCol}/{TileRow}.png"
            }
          ]
        }
      ],
      TileMatrixSet: [
        {
          Identifier: "EPSG:3857",
          SupportedCRS: "EPSG:3857",
          TileMatrix: [
            {
              Identifier: "0",
              ScaleDenominator: 559082264.0287178,
              TopLeftCorner: [-20037508.342789244, 20037508.342789244],
              TileWidth: 256,
              TileHeight: 256,
              MatrixWidth: 1,
              MatrixHeight: 1
            }
          ]
        }
      ]
    }
  };
}

describe("WmtsLayerComponent", () => {
  let component: GgcWmtsLayerComponent;
  let fixture: ComponentFixture<GgcWmtsLayerComponent>;
  let debugElement: DebugElement;
  let resultTileLayer: Tile<TileSource>;
  let capabilitiesService: MockedObject<GgcCapabilitiesService>;
  let coreSelectionServiceSpy: MockedObject<CoreSelectionService>;
  let mapEventsService: CoreMapEventsService;

  beforeEach(() => {
    const capSpy = {
      getCapabilities: vi
        .fn()
        .mockName("GgcCapabilitiesService.getCapabilities"),
      getWmtsFeatureInfo: vi
        .fn()
        .mockName("GgcCapabilitiesService.getWmtsFeatureInfo")
    };
    capSpy.getCapabilities.mockReturnValue(
      of(createWmtsCapabilitiesFixture(undefined))
    );
    const selectionSpy = {
      handleFeatureInfoForLayer: vi
        .fn()
        .mockName("CoreSelectionService.handleFeatureInfoForLayer"),
      clearFeatureInfoForLayer: vi
        .fn()
        .mockName("CoreSelectionService.clearFeatureInfoForLayer")
    };
    TestBed.configureTestingModule({
      imports: [GgcWmtsLayerComponent],
      providers: [
        CoreMapService,
        GgcCrsConfigService,
        CoreMapEventsService,
        { provide: CoreSelectionService, useValue: selectionSpy },
        { provide: GgcCapabilitiesService, useValue: capSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcWmtsLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
    resultTileLayer = new Tile();
    mapEventsService = TestBed.inject(CoreMapEventsService);
    capabilitiesService = TestBed.inject(
      GgcCapabilitiesService
    ) as MockedObject<GgcCapabilitiesService>;
    coreSelectionServiceSpy = TestBed.inject(
      CoreSelectionService
    ) as MockedObject<CoreSelectionService>;
  });

  const addTileLayerMock = {
    addLayer(layer) {
      resultTileLayer = layer as Tile<TileSource>;
    },
    removeLayer(_) {
      return;
    }
  } as OlMap;

  it("should be created", () => {
    expect(component).toBeTruthy();
  });

  it("when a layer is supplied, it should be used as a parameter", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue(addTileLayerMock);

    component.options = {
      sourceOptions: {
        layer: "my-layer"
      }
    };
    capabilitiesService.getCapabilities.mockReturnValue(
      of(createWmtsCapabilitiesFixture("my-layer"))
    );

    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    expect((component["wmtsSource"] as WMTS).getLayer()).toBe("my-layer");
  });

  it("when ngOnInit is called, it should subscribe to the capabilities service", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue(addTileLayerMock);

    component.ngOnInit();

    expect(capabilitiesService.getCapabilities).toHaveBeenCalled();
    expect(getMapSpy).toHaveBeenCalled();
  });

  describe("when the component is destroyed, ", () => {
    it("unsubscribe from singleclick events, removeLayer should be called on the map", () => {
      const coreMapService: CoreMapService =
        debugElement.injector.get(CoreMapService);
      const getMapSpy = vi
        .spyOn(coreMapService, "getMap")
        .mockReturnValue(addTileLayerMock);
      const mapEventsService: CoreMapEventsService =
        debugElement.injector.get(CoreMapEventsService);
      const mapEventsServicespy = vi
        .spyOn(mapEventsService, "getSingleclickObservableForMap")
        .mockReturnValue(of());

      component.options = {
        getFeatureInfoOnSingleclick: true
      };
      component.ngOnInit();
      vi.spyOn(component["singleclick"], "unsubscribe");
      component.ngOnDestroy();

      expect(mapEventsServicespy).toHaveBeenCalled();
      expect(getMapSpy).toHaveBeenCalled();
      expect(resultTileLayer).toBeDefined();
      expect(component["singleclick"].unsubscribe).toHaveBeenCalled();
    });
  });

  it("when opacity is set, the layer should have opacity and no transition", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);

    const getMapSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue(addTileLayerMock);

    component.options = {
      layerOptions: {
        opacity: 0.8
      }
    };
    component.ngOnInit();

    expect(getMapSpy).toHaveBeenCalled();
    expect(resultTileLayer.getOpacity()).toBe(0.8);
  });

  describe("GetFeatureInfo", () => {
    const coordinate: Coordinate = [45000, 55000];
    const evt = { coordinate } as MapBrowserEvent;
    evt.coordinate = coordinate;
    const mapViewMock = {
      getView() {
        return {
          getResolution() {
            return 10;
          }
        } as View;
      },
      removeLayer(_) {
        return;
      }
    } as OlMap;

    it(
      "when getFeatureInfo is called and the mapresolution is not within the range of the min/max resolution of the wms layer, " +
        "an event with an empty array will be emitted",
      () => {
        component["map"] = mapViewMock;
        component.options = {
          layerOptions: {
            minResolution: 20
          }
        };
        const emitFeatureInfoEventSpy = vi.spyOn(
          component,
          "emitFeatureInfoEvent"
        );
        component.getFeatureInfo(evt);
        expect(emitFeatureInfoEventSpy).toHaveBeenCalledWith([], coordinate);
      }
    );

    it(
      "when getFeatureInfo is called and capabilities is undefined, " +
        "an event with an empty array will be emitted",
      () => {
        capabilitiesService.getCapabilities.mockReturnValue(of(undefined));
        component.ngOnInit();
        component["map"] = mapViewMock;
        const emitFeatureInfoEventSpy = vi.spyOn(
          component,
          "emitFeatureInfoEvent"
        );

        component.getFeatureInfo(evt);

        expect(component["capabilities"]).toBeUndefined();
        expect(emitFeatureInfoEventSpy).toHaveBeenCalledWith([], coordinate);
      }
    );

    it(
      "when getFeatureInfo is called and capabilities does not have a featureInfoUrl, " +
        "an event with an empty array will be emitted",
      () => {
        component["map"] = mapViewMock;
        const emitFeatureInfoEventSpy = vi.spyOn(
          component,
          "emitFeatureInfoEvent"
        );
        component["capabilities"] = new Capabilities({});

        component.getFeatureInfo(evt);

        expect(emitFeatureInfoEventSpy).toHaveBeenCalledWith([], coordinate);
      }
    );

    it(
      "when getFeatureInfo is called and capabilities does have a featureInfoUrl and subscribed to observable, " +
        "an event with an empty array will be emitted",
      () => {
        component["map"] = mapViewMock;
        const emitFeatureInfoEventSpy = vi.spyOn(
          component,
          "emitFeatureInfoEvent"
        );
        // simulate feature data
        const featureData = {
          type: "Feature",
          id: "annotatie.1815051",
          geometry: { type: "Point", coordinates: [197782.397, 470543.292] },
          geometry_name: "geom",
          properties: {
            classificatiecode: "X02",
            rotatiehoek: "21.807",
            tekst: "2"
          }
        };
        capabilitiesService.getWmtsFeatureInfo.mockReturnValue(of(featureData));
        component["capabilities"] = new Capabilities({
          OperationsMetadata: {
            GetFeatureInfo: {
              DCP: { HTTP: { Get: [{ href: "https://example.com/wmts" }] } }
            }
          }
        });

        // subscribe to check result
        component.events.subscribe((result: MapComponentEvent) => {
          expect(result.type).toEqual(MapComponentEventTypes.WMTSFEATUREINFO);
          expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
          expect(result.value.length).toBe(1);
          expect(result.value[0].getId()).toBe("annotatie.1815051");
          expect(result.value[0].getGeometry().getCoordinates()).toEqual([
            197782.397, 470543.292
          ]);
          expect(result.value[0].getProperties().tekst).toBe("2");
          expect(emitFeatureInfoEventSpy).toHaveBeenCalled();
        });

        component.getFeatureInfo(evt);

        expect(capabilitiesService.getWmtsFeatureInfo).toHaveBeenCalled();
      }
    );

    it("when getFeatureInfoOnSingleclick is true, add singleclick listener to map", () => {
      const mapEventsServicespy = vi.spyOn(
        mapEventsService,
        "getSingleclickObservableForMap"
      );

      component["options"] = { getFeatureInfoOnSingleclick: true };
      component.ngOnInit();

      expect(mapEventsServicespy).toHaveBeenCalled();
      expect(component["singleclick"]).toBeDefined();
    });

    it("when options.getFeatureInfoOnSingleclick is true, add singleclick listener to map", () => {
      const mapEventsServicespy = vi.spyOn(
        mapEventsService,
        "getSingleclickObservableForMap"
      );

      component["options"] = { getFeatureInfoOnSingleclick: true };
      component.ngOnInit();

      expect(mapEventsServicespy).toHaveBeenCalled();
      expect(component["singleclick"]).toBeDefined();
    });

    it("when options.maxFeaturesOnSingleclick is set, maxFeaturesOnSingleclick should be set on component", () => {
      component["options"] = { maxFeaturesOnSingleclick: 15 };
      component.ngOnInit();

      expect(component["maxFeaturesOnSingleclick"]).toBe(15);
    });

    it("when emitFeatureInfoEvent is called it should emit an event and call CoreSelectionService", () => {
      component.options = {
        layerName: "test-layer"
      };
      component.ngOnInit();
      component.events.subscribe((result: MapComponentEvent) => {
        expect(result.type).toEqual(MapComponentEventTypes.WMTSFEATUREINFO);
        expect(result.mapIndex).toBe(DEFAULT_MAPINDEX);
        expect(result.value.length).toBe(0);
      });

      component["emitFeatureInfoEvent"]([], [1, 2]);

      expect(
        coreSelectionServiceSpy.handleFeatureInfoForLayer
      ).toHaveBeenCalled();
    });
  });
});
