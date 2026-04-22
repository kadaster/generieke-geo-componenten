import { TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { MapComponentDrawTypes } from "../../model/draw-interaction-event.model";

import { GgcDrawService } from "./ggc-draw.service";
import { CoreDrawLayerService } from "./core-draw-layer.service";
import { CoreDrawService } from "./core-draw.service";

describe("DrawService", () => {
  let service: GgcDrawService;
  let coreLayerService: CoreDrawLayerService;
  let coreService: CoreDrawService;

  const layerName = "testLayer";
  const mapIndex = "testMap";

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GgcDrawService);
    coreLayerService = TestBed.inject(CoreDrawLayerService);
    coreService = TestBed.inject(CoreDrawService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should call coreDrawService.addFeatureToLayer", () => {
    const feature = new Feature<Geometry>();
    spyOn(coreService, "addFeatureToLayer");

    service.addFeatureToLayer(layerName, feature, mapIndex);

    expect(coreService.addFeatureToLayer).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      feature
    );
  });

  it("should call coreDrawService.appendCoordinates", () => {
    const coordinates = [150000, 450000];
    spyOn(coreService, "appendCoordinates");

    service.appendCoordinates(coordinates, mapIndex);

    expect(coreService.appendCoordinates).toHaveBeenCalledWith(
      coordinates,
      mapIndex
    );
  });

  it("should call coreDrawService removeLastPoint", () => {
    spyOn(coreService, "removeLastPoint");
    service.removeLastPoint(mapIndex);

    expect(coreService.removeLastPoint).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService getSketchCoordinates", () => {
    spyOn(coreService, "getSketchCoordinates");
    service.getSketchCoordinates(mapIndex);

    expect(coreService.getSketchCoordinates).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.clearLayer", () => {
    spyOn(coreService, "clearLayer");
    service.clearLayer(layerName, mapIndex);

    expect(coreService.clearLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.deleteLayer", () => {
    spyOn(coreService, "deleteLayer");
    service.deleteLayer(layerName, mapIndex);

    expect(coreService.deleteLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.finishCurrentDraw", () => {
    spyOn(coreService, "finishCurrentDraw");
    service.finishCurrentDraw(mapIndex);

    expect(coreService.finishCurrentDraw).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.getDrawObservable", () => {
    spyOn(coreService, "getDrawObservable");
    service.getDrawEventsObservable(mapIndex);

    expect(coreService.getDrawObservable).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.getModifyEventsObservable", () => {
    spyOn(coreService, "getModifyEventsObservable");
    service.getModifyEventsObservable(mapIndex);

    expect(coreService.getModifyEventsObservable).toHaveBeenCalledWith(
      mapIndex
    );
  });

  it("should call coreDrawService.removeLastPoint", () => {
    spyOn(coreService, "removeLastPoint");
    service.removeLastPoint(mapIndex);

    expect(coreService.removeLastPoint).toHaveBeenCalledWith(mapIndex);
  });

  it("should call getDrawEventsObservable.clearLayer", () => {
    spyOn(coreService, "getDrawObservable");
    service.getDrawEventsObservable(mapIndex);

    expect(coreService.getDrawObservable).toHaveBeenCalledWith(mapIndex);
  });

  it("should get the features from the layer", () => {
    const features = [new Feature()];
    const source = new VectorSource({ features });
    const layer = new VectorLayer({ source });
    spyOn(source, "getFeatures").and.callThrough();
    spyOn(coreLayerService, "getDrawLayer").and.returnValue(layer);
    const result = service.getFeaturesFromLayer(layerName, mapIndex);

    expect(coreLayerService.getDrawLayer).toHaveBeenCalledWith(
      layerName,
      mapIndex
    );
    expect(source.getFeatures).toHaveBeenCalled();
    expect(result).toEqual(features);
  });

  it("should return false if the layer is visible", () => {
    const source = new VectorSource();
    const layer = new VectorLayer({ source });
    layer.setVisible(false);
    spyOn(coreLayerService, "getDrawLayer").and.returnValue(layer);
    const result = service.isLayerVisible(layerName, mapIndex);

    expect(coreLayerService.getDrawLayer).toHaveBeenCalledWith(
      layerName,
      mapIndex
    );
    expect(result).toEqual(false);
  });

  it("should call coreDrawService.setDrawStyle", () => {
    const styleLikeMap = {};
    spyOn(coreService, "setDrawStyle");
    service.setDrawStyle(layerName, styleLikeMap, mapIndex);

    expect(coreService.setDrawStyle).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      styleLikeMap
    );
  });

  it("should call coreDrawService.setLayerVisibility", () => {
    spyOn(coreService, "setLayerVisibility");
    service.setLayerVisibility(layerName, true, mapIndex);

    expect(coreService.setLayerVisibility).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      true
    );
  });

  it("should call coreDrawService.setLayerZIndex", () => {
    spyOn(coreService, "setLayerZIndex");
    service.setLayerZIndex(42, layerName, mapIndex);

    expect(coreService.setLayerZIndex).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      42
    );
  });

  it("should call coreDrawService.startDraw", () => {
    spyOn(coreService, "startDraw");
    service.startDraw(layerName, MapComponentDrawTypes.POLYGON, {}, mapIndex);

    expect(coreService.startDraw).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      MapComponentDrawTypes.POLYGON,
      {},
      undefined
    );
  });

  it("should call coreDrawService.startModify", () => {
    spyOn(coreService, "startModify");
    service.startModify(layerName, mapIndex, {}, undefined, undefined);

    expect(coreService.startModify).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      {},
      undefined,
      undefined
    );
  });

  it("should call coreDrawService.stopDraw", () => {
    spyOn(coreService, "stopDraw");
    service.stopDraw(layerName);

    expect(coreService.stopDraw).toHaveBeenCalledWith(layerName);
  });

  it("should call coreDrawService.stopDrawAndClearLayer", () => {
    spyOn(service, "stopDraw");
    spyOn(coreService, "deleteLayer");
    spyOn(service, "clearLayer");
    service.stopDrawAndClearLayer(layerName, mapIndex);

    expect(coreService.deleteLayer).toHaveBeenCalledWith(layerName, mapIndex);
    expect(service.stopDraw).toHaveBeenCalledWith(mapIndex);
    expect(service.clearLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.stopModify", () => {
    spyOn(coreService, "stopModify");
    service.stopModify(mapIndex);

    expect(coreService.stopModify).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.toggleLayer", () => {
    spyOn(coreService, "toggleLayer");
    service.toggleLayer(layerName, mapIndex);

    expect(coreService.toggleLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.startMove", () => {
    spyOn(coreService, "startMove");
    service.startMove(layerName, mapIndex);

    expect(coreService.startMove).toHaveBeenCalledWith(layerName, mapIndex, {});
  });

  it("should call coreDrawService.stopMove", () => {
    spyOn(coreService, "stopMove");
    service.stopMove(mapIndex);

    expect(coreService.stopMove).toHaveBeenCalledWith(mapIndex);
  });
});
