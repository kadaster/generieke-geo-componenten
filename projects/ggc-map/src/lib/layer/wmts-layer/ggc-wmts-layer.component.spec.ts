import type { MockedObject } from "vitest";
import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { View } from "ol";
import { Coordinate } from "ol/coordinate";
import Tile from "ol/layer/Tile";
import OlMap from "ol/Map";
import MapBrowserEvent from "ol/MapBrowserEvent";
import TileSource from "ol/source/Tile";
import { of } from "rxjs";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapEventsService } from "../../map/service/core-map-events.service";
import { CoreMapService } from "../../map/service/core-map.service";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { Capabilities } from "../model/capabilities.model";
import { CoreWmsWmtsCapabilitiesService } from "../service/core-wms-wmts-capabilities.service";
import { GgcWmtsLayerComponent } from "./ggc-wmts-layer.component";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

describe("WmtsLayerComponent", () => {
  let component: GgcWmtsLayerComponent;
  let fixture: ComponentFixture<GgcWmtsLayerComponent>;
  let debugElement: DebugElement;
  let resultTileLayer: Tile<TileSource>;
  let capabilitiesService: MockedObject<CoreWmsWmtsCapabilitiesService>;
  let coreSelectionServiceSpy: MockedObject<CoreSelectionService>;

  beforeEach(() => {
    const capSpy = {
      getCapabilitiesForUrl: vi
        .fn()
        .mockName("CapabilitiesService.getCapabilitiesForUrl"),
      hasFeatureInfoUrl: vi
        .fn()
        .mockName("CapabilitiesService.hasFeatureInfoUrl"),
      optionsFromCapabilities: vi
        .fn()
        .mockName("CapabilitiesService.optionsFromCapabilities"),
      createGetFeatureInfoUrlObservable: vi
        .fn()
        .mockName("CapabilitiesService.createGetFeatureInfoUrlObservable")
    };
    capSpy.getCapabilitiesForUrl.mockReturnValue(of({}));
    capSpy.optionsFromCapabilities.mockReturnValue(of({}));
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
        { provide: CoreWmsWmtsCapabilitiesService, useValue: capSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcWmtsLayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugElement = fixture.debugElement;
    resultTileLayer = new Tile();
    capabilitiesService = TestBed.inject(
      CoreWmsWmtsCapabilitiesService
    ) as MockedObject<CoreWmsWmtsCapabilitiesService>;
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

    capabilitiesService.optionsFromCapabilities.mockImplementation(
      (_: any, config: any) => {
        expect(config.layer).toBe("my-layer");
        return config;
      }
    );
    component.ngOnInit();
    expect(getMapSpy).toHaveBeenCalled();
  });

  it("when ngOnInit is called, it should subscribe to the capabilities service", () => {
    const coreMapService: CoreMapService =
      debugElement.injector.get(CoreMapService);
    const getMapSpy = vi
      .spyOn(coreMapService, "getMap")
      .mockReturnValue(addTileLayerMock);

    component.ngOnInit();

    expect(capabilitiesService.getCapabilitiesForUrl).toHaveBeenCalled();
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
        capabilitiesService.getCapabilitiesForUrl.mockReturnValue(
          of(undefined)
        );
        component.ngOnInit();
        component["map"] = mapViewMock;
        const emitFeatureInfoEventSpy = vi.spyOn(
          component,
          "emitFeatureInfoEvent"
        );

        component.getFeatureInfo(evt);

        expect(capabilitiesService.hasFeatureInfoUrl).not.toHaveBeenCalled();
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
        capabilitiesService.hasFeatureInfoUrl.mockReturnValue(false);
        component["capabilities"] = {} as Capabilities;

        component.getFeatureInfo(evt);

        expect(capabilitiesService.hasFeatureInfoUrl).toHaveBeenCalled();
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
        capabilitiesService.hasFeatureInfoUrl.mockReturnValue(true);
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
        capabilitiesService.createGetFeatureInfoUrlObservable.mockReturnValue(
          of(featureData)
        );
        component["capabilities"] = {} as Capabilities;

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

        expect(capabilitiesService.hasFeatureInfoUrl).toHaveBeenCalled();
        expect(
          capabilitiesService.createGetFeatureInfoUrlObservable
        ).toHaveBeenCalled();
      }
    );

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
