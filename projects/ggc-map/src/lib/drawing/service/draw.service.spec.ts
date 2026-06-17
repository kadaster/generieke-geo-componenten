import { TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import { GgcDrawService } from "./ggc-draw.service";
import { CoreDrawLayerService } from "./core-draw-layer.service";
import { CoreDrawService } from "./core-draw.service";
import { MapComponentDrawTypes } from "@kadaster/ggc-models";

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
    vi.spyOn(coreService, "addFeatureToLayer");

    service.addFeatureToLayer(layerName, feature, mapIndex);

    expect(coreService.addFeatureToLayer).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      feature
    );
  });

  it("should call coreDrawService.appendCoordinates", () => {
    const coordinates = [150000, 450000];
    vi.spyOn(coreService, "appendCoordinates");

    service.appendCoordinates(coordinates, mapIndex);

    expect(coreService.appendCoordinates).toHaveBeenCalledWith(
      coordinates,
      mapIndex
    );
  });

  it("should call coreDrawService removeLastPoint", () => {
    vi.spyOn(coreService, "removeLastPoint");
    service.removeLastPoint(mapIndex);

    expect(coreService.removeLastPoint).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService getSketchCoordinates", () => {
    vi.spyOn(coreService, "getSketchCoordinates");
    service.getSketchCoordinates(mapIndex);

    expect(coreService.getSketchCoordinates).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.clearLayer", () => {
    vi.spyOn(coreService, "clearLayer");
    service.clearLayer(layerName, mapIndex);

    expect(coreService.clearLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.deleteLayer", () => {
    vi.spyOn(coreService, "deleteLayer");
    service.deleteLayer(layerName, mapIndex);

    expect(coreService.deleteLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.finishCurrentDraw", () => {
    vi.spyOn(coreService, "finishCurrentDraw");
    service.finishCurrentDraw(mapIndex);

    expect(coreService.finishCurrentDraw).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.getDrawObservable", () => {
    vi.spyOn(coreService, "getDrawObservable");
    service.getDrawEventsObservable(mapIndex);

    expect(coreService.getDrawObservable).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.getModifyEventsObservable", () => {
    vi.spyOn(coreService, "getModifyEventsObservable");
    service.getModifyEventsObservable(mapIndex);

    expect(coreService.getModifyEventsObservable).toHaveBeenCalledWith(
      mapIndex
    );
  });

  it("should call coreDrawService.removeLastPoint", () => {
    vi.spyOn(coreService, "removeLastPoint");
    service.removeLastPoint(mapIndex);

    expect(coreService.removeLastPoint).toHaveBeenCalledWith(mapIndex);
  });

  it("should call getDrawEventsObservable.clearLayer", () => {
    vi.spyOn(coreService, "getDrawObservable");
    service.getDrawEventsObservable(mapIndex);

    expect(coreService.getDrawObservable).toHaveBeenCalledWith(mapIndex);
  });

  it("should get the features from the layer", () => {
    const features = [new Feature()];
    const source = new VectorSource({ features });
    const layer = new VectorLayer({ source });
    vi.spyOn(source, "getFeatures");
    vi.spyOn(coreLayerService, "getDrawLayer").mockReturnValue(layer);
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
    vi.spyOn(coreLayerService, "getDrawLayer").mockReturnValue(layer);
    const result = service.isLayerVisible(layerName, mapIndex);

    expect(coreLayerService.getDrawLayer).toHaveBeenCalledWith(
      layerName,
      mapIndex
    );
    expect(result).toEqual(false);
  });

  it("should call coreDrawService.setDrawStyle", () => {
    const styleLikeMap = {};
    vi.spyOn(coreService, "setDrawStyle");
    service.setDrawStyle(layerName, styleLikeMap, mapIndex);

    expect(coreService.setDrawStyle).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      styleLikeMap
    );
  });

  it("should call coreDrawService.setLayerVisibility", () => {
    vi.spyOn(coreService, "setLayerVisibility");
    service.setLayerVisibility(layerName, true, mapIndex);

    expect(coreService.setLayerVisibility).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      true
    );
  });

  it("should call coreDrawService.setLayerZIndex", () => {
    vi.spyOn(coreService, "setLayerZIndex");
    service.setLayerZIndex(42, layerName, mapIndex);

    expect(coreService.setLayerZIndex).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      42
    );
  });

  it("should call coreDrawService.startDraw", () => {
    vi.spyOn(coreService, "startDraw");
    service.startDraw(layerName, MapComponentDrawTypes.POLYGON, {}, mapIndex);

    expect(coreService.startDraw).toHaveBeenCalledWith(
      layerName,
      mapIndex,
      MapComponentDrawTypes.POLYGON,
      {}
    );
  });

  it("should call coreDrawService.startModify", () => {
    vi.spyOn(coreService, "startModify");
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
    vi.spyOn(coreService, "stopDraw");
    service.stopDraw(layerName);

    expect(coreService.stopDraw).toHaveBeenCalledWith(layerName);
  });

  it("should call coreDrawService.stopDrawAndClearLayer", () => {
    vi.spyOn(service, "stopDraw");
    vi.spyOn(coreService, "deleteLayer");
    vi.spyOn(service, "clearLayer");
    service.stopDrawAndClearLayer(layerName, mapIndex);

    expect(coreService.deleteLayer).toHaveBeenCalledWith(layerName, mapIndex);
    expect(service.stopDraw).toHaveBeenCalledWith(mapIndex);
    expect(service.clearLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.stopModify", () => {
    vi.spyOn(coreService, "stopModify");
    service.stopModify(mapIndex);

    expect(coreService.stopModify).toHaveBeenCalledWith(mapIndex);
  });

  it("should call coreDrawService.toggleLayer", () => {
    vi.spyOn(coreService, "toggleLayer");
    service.toggleLayer(layerName, mapIndex);

    expect(coreService.toggleLayer).toHaveBeenCalledWith(layerName, mapIndex);
  });

  it("should call coreDrawService.startMove", () => {
    vi.spyOn(coreService, "startMove");
    service.startMove(layerName, mapIndex);

    expect(coreService.startMove).toHaveBeenCalledWith(layerName, mapIndex, {});
  });

  it("should call coreDrawService.stopMove", () => {
    vi.spyOn(coreService, "stopMove");
    service.stopMove(mapIndex);

    expect(coreService.stopMove).toHaveBeenCalledWith(mapIndex);
  });
});
