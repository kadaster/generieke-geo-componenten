import { TestBed } from "@angular/core/testing";
import { GgcSharedLayerService } from "./ggc-shared-layer.service";
import { GeoJsonLayerService } from "./geojson-layer.service";
import { Tiles3dLayerService } from "./tiles3d-layer.service";
import { WmtsLayerService } from "./wmts-layer.service";
import { Subject } from "rxjs";
import { LayerConfig, Webservice } from "../model/interfaces";
import {
  CesiumLayerChangedEvent,
  Webservice3DType
} from "@kadaster/ggc-models";

describe("SharedLayerService", () => {
  let service: GgcSharedLayerService;

  let geoJsonServiceSpy: jasmine.SpyObj<GeoJsonLayerService>;
  let tiles3dServiceSpy: jasmine.SpyObj<Tiles3dLayerService>;
  let wmtsServiceSpy: jasmine.SpyObj<WmtsLayerService>;

  beforeEach(() => {
    geoJsonServiceSpy = jasmine.createSpyObj("GeoJsonLayerService", [
      "addLayer",
      "removeLayer",
      "isVisible",
      "getEnabled",
      "getLayerChangedObservable"
    ]);
    tiles3dServiceSpy = jasmine.createSpyObj("Tiles3dLayerService", [
      "addLayer",
      "removeLayer",
      "isVisible",
      "getEnabled",
      "getLayerChangedObservable"
    ]);
    wmtsServiceSpy = jasmine.createSpyObj("WmtsLayerService", [
      "addLayer",
      "removeLayer",
      "isVisible",
      "getEnabled",
      "getLayerChangedObservable"
    ]);

    geoJsonServiceSpy.getLayerChangedObservable.and.returnValue(
      new Subject<CesiumLayerChangedEvent>()
    );
    tiles3dServiceSpy.getLayerChangedObservable.and.returnValue(
      new Subject<CesiumLayerChangedEvent>()
    );
    wmtsServiceSpy.getLayerChangedObservable.and.returnValue(
      new Subject<CesiumLayerChangedEvent>()
    );

    TestBed.configureTestingModule({
      providers: [
        GgcSharedLayerService,
        { provide: GeoJsonLayerService, useValue: geoJsonServiceSpy },
        { provide: Tiles3dLayerService, useValue: tiles3dServiceSpy },
        { provide: WmtsLayerService, useValue: wmtsServiceSpy }
      ]
    });

    service = TestBed.inject(GgcSharedLayerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should load webservices and call addLayer for visible layers", () => {
    const webserviceGeojson: Webservice = {
      url: "geojsonUrl",
      type: Webservice3DType.GEOJSON,
      layers: [{ layerId: "idGeojson", visible: true } as LayerConfig]
    };
    const webserviceWmts: Webservice = {
      url: "wmtsUrl",
      type: Webservice3DType.WMTS,
      layers: [{ layerId: "idWtms", visible: true } as LayerConfig]
    };
    const webservice3dTiles: Webservice = {
      url: "drieDtilesUrl",
      type: Webservice3DType.TILES3D,
      layers: [{ layerId: "idTiles3D", visible: true } as LayerConfig]
    };

    service.loadWebservices([
      webserviceGeojson,
      webserviceWmts,
      webservice3dTiles
    ]);

    expect(geoJsonServiceSpy.addLayer).toHaveBeenCalledWith(
      "geojsonUrl",
      jasmine.objectContaining({ layerId: "idGeojson" })
    );
    expect(wmtsServiceSpy.addLayer).toHaveBeenCalledWith(
      "wmtsUrl",
      jasmine.objectContaining({ layerId: "idWtms" })
    );
    expect(tiles3dServiceSpy.addLayer).toHaveBeenCalledWith(
      "drieDtilesUrl",
      jasmine.objectContaining({ layerId: "idTiles3D" })
    );
  });

  it("should load webservices and not call addLayer for invisible layers", () => {
    const webserviceGeojson: Webservice = {
      url: "geojsonUrl",
      type: Webservice3DType.GEOJSON,
      layers: [{ layerId: "idGeojson", visible: false } as LayerConfig]
    };

    service.loadWebservices([webserviceGeojson]);

    expect(geoJsonServiceSpy.addLayer).not.toHaveBeenCalled();
  });

  it("should call addLayer to correct service", () => {
    const layer: LayerConfig = {
      layerId: "id1",
      visible: true,
      layerName: "name"
    };

    service.addLayer(Webservice3DType.WMTS, layer);
    expect(wmtsServiceSpy.addLayer).toHaveBeenCalled();
  });

  it("should call removeLayer on the correct service", () => {
    const layer: LayerConfig = {
      layerId: "id1",
      title: "TestLayer"
    } as LayerConfig;

    service["layerConfigurations"].push({
      url: "http://x",
      type: Webservice3DType.TILES3D,
      layers: [layer]
    });
    service.removeLayer("id1");
    expect(tiles3dServiceSpy.removeLayer).toHaveBeenCalledWith("id1");
  });

  it("should return true if any service reports visible", () => {
    wmtsServiceSpy.isVisible.and.returnValue(false);
    geoJsonServiceSpy.isVisible.and.returnValue(true);

    expect(service.isVisible("id1")).toBeTrue();
  });

  it("should remove layer if currently visible when toggled", () => {
    geoJsonServiceSpy.isVisible.and.returnValue(true);

    const layer: LayerConfig = { layerId: "id1" } as LayerConfig;

    service["layerConfigurations"].push({
      url: "http://x",
      type: Webservice3DType.GEOJSON,
      layers: [layer]
    });

    service.toggleVisibility("id1");

    expect(geoJsonServiceSpy.removeLayer).toHaveBeenCalledWith("id1");
  });

  it("should add layer if currently not visible when toggled", () => {
    geoJsonServiceSpy.isVisible.and.returnValue(false);
    wmtsServiceSpy.isVisible.and.returnValue(false);
    tiles3dServiceSpy.isVisible.and.returnValue(false);

    const layer: LayerConfig = {
      layerId: "id1",
      layerName: "x",
      url: "http://x"
    };

    service["layerConfigurations"].push({
      url: "http://x",
      type: Webservice3DType.GEOJSON,
      layers: [layer]
    });

    service.toggleVisibility("id1");
    expect(geoJsonServiceSpy.addLayer).toHaveBeenCalled();
  });

  it("should return the layer title", () => {
    service["layerConfigurations"].push({
      url: "http://x",
      type: Webservice3DType.WMTS,
      layers: [{ layerId: "id1", title: "MyLayer" } as LayerConfig]
    });
    expect(service.getTitle("id1")).toBe("MyLayer");
  });

  it("should return enabled of a layer", () => {
    wmtsServiceSpy.getEnabled.and.returnValue(true);
    service["layerConfigurations"].push({
      url: "http://x",
      type: Webservice3DType.WMTS,
      layers: [{ layerId: "id1" } as LayerConfig]
    });
    expect(service.getEnabled("id1")).toBe(true);
  });

  it("should return all active legends", () => {
    service["layerConfigurations"].push({
      url: "url",
      type: Webservice3DType.WMTS,
      title: "serviceTitle1",
      layers: [
        {
          layerId: "id1",
          title: "layerTitle1",
          activeLegend: { legendUrl: "legendUrlId1" }
        } as LayerConfig
      ]
    });
    service["layerConfigurations"].push({
      url: "url",
      type: Webservice3DType.WMTS,
      layers: [
        {
          layerId: "id2",
          activeLegend: { legendUrl: "legendUrlId2" }
        } as LayerConfig
      ]
    });
    wmtsServiceSpy.isVisible.and.callFake((id) => {
      if (id == "id1") return true;
      if (id == "id2") return false;
      return false;
    });
    wmtsServiceSpy.getEnabled.and.returnValue(true);
    expect(service.getCurrentActiveLegends()).toEqual([
      {
        layerId: "id1",
        legend: { legendUrl: "legendUrlId1" },
        serviceTitle: "serviceTitle1",
        layerTitle: "layerTitle1",
        layerEnabled: true
      }
    ]);
  });
});
