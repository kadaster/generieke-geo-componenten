import { GeoJsonLayerService } from "./geojson-layer.service";
import { fakeAsync, flush, TestBed } from "@angular/core/testing";
import {
  Color,
  DataSource,
  DataSourceCollection,
  Entity,
  EntityCollection,
  GeoJsonDataSource,
  PointGraphics,
  Resource
} from "@cesium/engine";
import { GeoJsonConfig, GeoJsonLayerConfig } from "../model/interfaces";
import Spy = jasmine.Spy;

describe("GeoJsonLayerService", () => {
  let service: GeoJsonLayerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeoJsonLayerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("addLayer", () => {
    let dataSourceSpy: Spy;
    const dataSourceMock: Partial<GeoJsonDataSource> = {
      entities: {
        values: [{} as Entity]
      } as EntityCollection
    };

    const layerId = "test-layer";

    beforeEach(() => {
      dataSourceSpy = spyOn(GeoJsonDataSource, "load");
      dataSourceSpy.and.resolveTo(Promise.resolve(dataSourceMock));
    });

    it("should use the resource from the config if it's present for the layer that is being added", () => {
      const resource = {} as Resource;
      service.setConfigs([{ layerId: layerId, resource: resource }]);

      service["addLayer"]("layer.url", {
        layerId: layerId
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(resource, jasmine.anything());
    });

    it("should use the features from the config if it's present for the layer that is being added", () => {
      const features = {} as object;
      service.setConfigs([{ layerId: layerId, features: features }]);

      service["addLayer"]("layer.url", {
        layerId: layerId
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(features, jasmine.anything());
    });

    it("should use url if the config doesn't contain a resource object or features", () => {
      service.setConfigs([{ layerId: layerId }]);

      service["addLayer"]("layer.url", {
        layerId: layerId
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(
        "layer.url",
        jasmine.anything()
      );
    });

    it("should use loadOptions if defined", () => {
      service.setConfigs([{ layerId: layerId }]);
      service["addLayer"]("layer.url", {
        layerId: layerId,
        loadOptions: { markerColor: Color.PINK }
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(
        "layer.url",
        jasmine.objectContaining({
          markerColor: Color.PINK,
          clampToGround: false
        })
      );
    });

    it("should override default value of clampToGround when set in loadOptions", () => {
      service.setConfigs([{ layerId: layerId }]);
      service["addLayer"]("layer.url", {
        layerId: layerId,
        loadOptions: { clampToGround: true }
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(
        "layer.url",
        jasmine.objectContaining({
          clampToGround: true
        })
      );
    });

    it("shouldn't use loadOptions if not defined", () => {
      service.setConfigs([{ layerId: layerId }]);
      service["addLayer"]("layer.url", {
        layerId: layerId,
        loadOptions: {}
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(
        "layer.url",
        jasmine.anything()
      );
    });

    it("should use entitiesFunction if defined", fakeAsync(() => {
      const config = {
        layerId: layerId,
        entitiesFunction: (entity: Entity) => {
          const status = entity.properties?.status.getValue();
          if (status === "In onderzoek") {
            entity.point = new PointGraphics({
              color: Color.ORCHID,
              outlineColor: Color.GREEN,
              pixelSize: 5
            });
            entity.billboard = undefined;
          }
        }
      };
      const spy = spyOn(config, "entitiesFunction");
      service.setConfigs([config]);
      service["addLayer"]("layer.url", {
        layerId: layerId
      } as GeoJsonLayerConfig);
      expect(dataSourceSpy).toHaveBeenCalledWith(
        "layer.url",
        jasmine.anything()
      );
      flush();
      expect(spy).toHaveBeenCalled();
    }));

    it("should clean up configs on destroy", () => {
      service.setConfigs([{ layerId: layerId }]);
      service.destroyLayers();
      expect(service["geoJsonConfigs"].length).toBe(0);
    });

    describe("getEntities(Highlight)Function", () => {
      const geoJsonConfigs = [
        {
          layerId: "layer-1",
          entitiesFunction: (entity) => entity.parent,
          entitiesHighlightFunction: (entity) => entity.parent
        },
        {
          layerId: "layer-2",
          entitiesFunction: (entity) => entity,
          entitiesHighlightFunction: (entity) => entity.parent
        }
      ] as GeoJsonConfig[];

      it("should return the correct EntitiesFunction when getEntitiesFunction is called", () => {
        service.setConfigs(geoJsonConfigs);
        const entitiesFunction = service.getEntitiesFunction("layer-1");
        expect(entitiesFunction).toEqual(geoJsonConfigs[0].entitiesFunction);
      });
      it("should return the correct EntitiesHighlightFunction when getEntitiesHighlightFunction is called", () => {
        service.setConfigs(geoJsonConfigs);
        const entitiesFunction =
          service.getEntitiesHighlightFunction("layer-2");
        expect(entitiesFunction).toEqual(
          geoJsonConfigs[1].entitiesHighlightFunction
        );
      });
    });
  });

  it("should set the internal Cesium DataSourceCollection", () => {
    const collection = new DataSourceCollection();
    service.setLayers(collection);

    // @ts-ignore - accessing protected because this is unit test only
    expect(service.layers).toBe(collection);
  });

  it("should return layer.show if layer is registered", () => {
    const layerId = "layer-1";
    const mock = { show: true } as DataSource;
    service["layerIdToCesiumLayer"].set(layerId, mock);

    expect(service.getEnabled(layerId)).toBeTrue();

    mock.show = false;
    expect(service.getEnabled(layerId)).toBeFalse();
  });
});
