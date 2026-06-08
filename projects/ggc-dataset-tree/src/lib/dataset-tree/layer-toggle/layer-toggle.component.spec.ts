import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LayerToggleComponent } from "./layer-toggle.component";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { EMPTY, Subject } from "rxjs";
import MapEvent from "ol/MapEvent";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import {
  LayerChangedEvent,
  LayerChangedEventTrigger
} from "@kadaster/ggc-models";
import { createFakeMapEvent } from "../../../../../../src/test/mocks/ggc/mock-ggc-map.service";

describe("LayerToggleComponent", () => {
  let component: LayerToggleComponent;
  let fixture: ComponentFixture<LayerToggleComponent>;
  let datasetTreeMapConnectServiceSpy: Pick<
    MockedObject<DatasetTreeMapConnectService>,
    | "isVisible"
    | "getTitle"
    | "getEnabled"
    | "toggleVisibility"
    | "getZoomendObservableForMap"
    | "getLayerChangedObservable"
    | "getTriggerObservable"
  >;
  let coreDatasetTreeServiceSpy: Pick<
    MockedObject<CoreDatasetTreeService>,
    "emitDatasetTreeEvent"
  >;

  let layerChanged$: Subject<LayerChangedEvent>;
  let zoomend$: Subject<MapEvent>;

  beforeEach(async () => {
    layerChanged$ = new Subject<any>();
    zoomend$ = new Subject<any>();

    datasetTreeMapConnectServiceSpy = {
      isVisible: vi.fn().mockName("DatasetTreeMapConnectService.isVisible"),
      getTitle: vi.fn().mockName("DatasetTreeMapConnectService.getTitle"),
      getEnabled: vi.fn().mockName("DatasetTreeMapConnectService.getEnabled"),
      toggleVisibility: vi
        .fn()
        .mockName("DatasetTreeMapConnectService.toggleVisibility"),
      getZoomendObservableForMap: vi
        .fn()
        .mockName("DatasetTreeMapConnectService.getZoomendObservableForMap"),
      getLayerChangedObservable: vi
        .fn()
        .mockName("DatasetTreeMapConnectService.getLayerChangedObservable"),
      getTriggerObservable: vi
        .fn()
        .mockName("DatasetTreeMapConnectService.getTriggerObservable")
    };
    coreDatasetTreeServiceSpy = {
      emitDatasetTreeEvent: vi
        .fn()
        .mockName("CoreDatasettreeService.emitDatasetTreeEvent")
    };

    await TestBed.configureTestingModule({
      providers: [
        LayerToggleComponent,
        {
          provide: DatasetTreeMapConnectService,
          useValue: datasetTreeMapConnectServiceSpy
        },
        {
          provide: CoreDatasetTreeService,
          useValue: coreDatasetTreeServiceSpy
        }
      ]
    }).compileComponents();
    datasetTreeMapConnectServiceSpy.getZoomendObservableForMap.mockReturnValue(
      Promise.resolve(zoomend$.asObservable())
    );
    datasetTreeMapConnectServiceSpy.getLayerChangedObservable.mockReturnValue(
      Promise.resolve(layerChanged$.asObservable())
    );
    datasetTreeMapConnectServiceSpy.getTriggerObservable.mockReturnValue(EMPTY);

    fixture = TestBed.createComponent(LayerToggleComponent);
    component = fixture.componentInstance;
    component.layer = { layerId: "id" };
    component.mapIndex = "mapIndex";
    component["enabled"].set(true);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should update its values on layerchanged event", async () => {
    datasetTreeMapConnectServiceSpy.getTitle.mockReturnValue(
      Promise.resolve("titleNew")
    );
    datasetTreeMapConnectServiceSpy.isVisible.mockReturnValue(
      Promise.resolve(true)
    );

    await (component as any).initialize();

    layerChanged$.next({
      layerId: "id",
      mapIndex: "mapIndex",
      eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
    });

    expect(component["title"]).toBe("titleNew");
    expect(component["visible"]()).toBe(true);
  });

  it("should not update its values on layerchanged event if this is not the layer", () => {
    datasetTreeMapConnectServiceSpy.getTitle.mockReturnValue(
      Promise.resolve("titleNew")
    );
    datasetTreeMapConnectServiceSpy.isVisible.mockReturnValue(
      Promise.resolve(true)
    );

    layerChanged$.next({
      layerId: "otherId",
      mapIndex: "mapIndex",
      eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
    });

    expect(component["title"]).not.toBe("titleNew");
    expect(component["visible"]).not.toBe(true);
  });

  it("should update its values on zoomend event", () => {
    datasetTreeMapConnectServiceSpy.getEnabled.mockReturnValue(
      Promise.resolve(true)
    );

    zoomend$.next(createFakeMapEvent("zoomend"));

    expect(component["enabled"]()).toBe(true);
  });

  it("should send an event on click", async () => {
    datasetTreeMapConnectServiceSpy.toggleVisibility.mockReturnValue(
      Promise.resolve(true)
    );

    await component.toggleVisibility();

    expect(coreDatasetTreeServiceSpy.emitDatasetTreeEvent).toHaveBeenCalledWith(
      "id",
      "mapIndex",
      true
    );
  });

  it("updateEnabled: should default to enabled=true when getEnabled returns null/undefined", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.mockReturnValue(
      Promise.resolve(undefined as any)
    );

    component["enabled"].set(false);

    await (component as any).updateEnabled();

    expect(component["enabled"]()).toBe(true);
  });

  it("updateEnabled: should set enabled to computedEnabled when no callback is provided", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.mockReturnValue(
      Promise.resolve(false)
    );
    component.layerEnabledCallback = undefined as any;

    component["enabled"].set(true);

    await (component as any).updateEnabled();

    expect(component["enabled"]()).toBe(false);
  });

  it("updateEnabled: should override computedEnabled when callback returns boolean", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.mockReturnValue(
      Promise.resolve(true)
    );

    const cb = vi.fn().mockResolvedValue(false);

    component.layerEnabledCallback = cb as any;

    await (component as any).updateEnabled();

    expect(cb).toHaveBeenCalledWith({
      layer: component.layer,
      mapIndex: "mapIndex",
      viewerType: component.viewerType,
      isEnabled: true
    });
    expect(component["enabled"]()).toBe(false);
  });

  it("updateEnabled: should not override computedEnabled when callback does not return a boolean", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.mockReturnValue(
      Promise.resolve(false)
    );

    component.layerEnabledCallback = (async () => "nope") as any;

    await (component as any).updateEnabled();

    expect(component["enabled"]()).toBe(false);
  });
});
