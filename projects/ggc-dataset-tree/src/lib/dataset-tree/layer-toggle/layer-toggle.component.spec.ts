import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LayerToggleComponent } from "./layer-toggle.component";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { EMPTY, Subject } from "rxjs";
import MapEvent from "ol/MapEvent";
import OlMap from "ol/Map";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import {
  LayerChangedEvent,
  LayerChangedEventTrigger
} from "@kadaster/ggc-models";

describe("LayerToggleComponent", () => {
  let component: LayerToggleComponent;
  let fixture: ComponentFixture<LayerToggleComponent>;
  let datasetTreeMapConnectServiceSpy: jasmine.SpyObj<DatasetTreeMapConnectService>;
  let coreDatasetTreeServiceSpy: jasmine.SpyObj<CoreDatasetTreeService>;

  let layerChanged$: Subject<LayerChangedEvent>;
  let zoomend$: Subject<MapEvent>;

  beforeEach(async () => {
    layerChanged$ = new Subject<any>();
    zoomend$ = new Subject<any>();

    datasetTreeMapConnectServiceSpy =
      jasmine.createSpyObj<DatasetTreeMapConnectService>(
        "DatasetTreeMapConnectService",
        [
          "isVisible",
          "getTitle",
          "getEnabled",
          "toggleVisibility",
          "getZoomendObservableForMap",
          "getLayerChangedObservable",
          "getTriggerObservable"
        ]
      );
    coreDatasetTreeServiceSpy = jasmine.createSpyObj("CoreDatasettreeService", [
      "emitDatasetTreeEvent"
    ]);
    datasetTreeMapConnectServiceSpy.getZoomendObservableForMap.and.returnValue(
      Promise.resolve(zoomend$.asObservable())
    );
    datasetTreeMapConnectServiceSpy.getLayerChangedObservable.and.returnValue(
      Promise.resolve(layerChanged$.asObservable())
    );
    datasetTreeMapConnectServiceSpy.getTriggerObservable.and.returnValue(EMPTY);

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

    fixture = TestBed.createComponent(LayerToggleComponent);
    component = fixture.componentInstance;
    component.layer = { layerId: "id" };
    component.mapIndex = "mapIndex";
    component["enabled"] = true;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should update its values on layerchanged event", async () => {
    datasetTreeMapConnectServiceSpy.getTitle.and.returnValue(
      Promise.resolve("titleNew")
    );
    datasetTreeMapConnectServiceSpy.isVisible.and.returnValue(
      Promise.resolve(true)
    );

    await (component as any).initialize();

    layerChanged$.next({
      layerId: "id",
      mapIndex: "mapIndex",
      eventTrigger: LayerChangedEventTrigger.LAYER_ADDED
    });

    expect(component["title"]).toBe("titleNew");
    expect(component["visible"]).toBe(true);
  });

  it("should not update its values on layerchanged event if this is not the layer", () => {
    datasetTreeMapConnectServiceSpy.getTitle.and.returnValue(
      Promise.resolve("titleNew")
    );
    datasetTreeMapConnectServiceSpy.isVisible.and.returnValue(
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
    datasetTreeMapConnectServiceSpy.getEnabled.and.returnValue(
      Promise.resolve(true)
    );

    zoomend$.next(new MapEvent("type", new OlMap()));

    expect(component["enabled"]).toBe(true);
  });

  it("should send an event on click", async () => {
    datasetTreeMapConnectServiceSpy.toggleVisibility.and.returnValue(
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
    datasetTreeMapConnectServiceSpy.getEnabled.and.returnValue(
      Promise.resolve(undefined as any)
    );

    component["enabled"] = false;

    await (component as any).updateEnabled();

    expect(component["enabled"]).toBe(true);
  });

  it("updateEnabled: should set enabled to computedEnabled when no callback is provided", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.and.returnValue(
      Promise.resolve(false)
    );
    component.layerEnabledCallback = undefined as any;

    component["enabled"] = true;

    await (component as any).updateEnabled();

    expect(component["enabled"]).toBe(false);
  });

  it("updateEnabled: should override computedEnabled when callback returns boolean", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.and.returnValue(
      Promise.resolve(true)
    );

    const cb = jasmine.createSpy("layerEnabledCallback").and.resolveTo(false);

    component.layerEnabledCallback = cb as any;

    await (component as any).updateEnabled();

    expect(cb).toHaveBeenCalledWith({
      layer: component.layer,
      mapIndex: "mapIndex",
      viewerType: component.viewerType,
      isEnabled: true
    });
    expect(component["enabled"]).toBe(false);
  });

  it("updateEnabled: should not override computedEnabled when callback does not return a boolean", async () => {
    datasetTreeMapConnectServiceSpy.getEnabled.and.returnValue(
      Promise.resolve(false)
    );

    component.layerEnabledCallback = (async () => "nope") as any;

    await (component as any).updateEnabled();

    expect(component["enabled"]).toBe(false);
  });
});
