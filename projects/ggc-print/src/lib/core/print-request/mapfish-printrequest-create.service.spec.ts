import { TestBed } from "@angular/core/testing";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  CrsConfig,
  GgcCrsConfigService,
  GgcDrawService,
  GgcMapService
} from "@kadaster/ggc-map";
import { basicGeojsonStyle, basicMeasureStyle } from "./mapfish-printstyles";
import {
  FeatureCollection,
  GeoJsonProperties,
  Geometry as GeoJsonGeometry
} from "geojson";
import Collection from "ol/Collection";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import GeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import ImageLayer from "ol/layer/Image";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import OlMap from "ol/Map";
import ImageSource from "ol/source/Image";
import ImageWMS from "ol/source/ImageWMS";
import TileSource from "ol/source/Tile";
import VectorSource from "ol/source/Vector";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { PrintConfig } from "../../model/config/print-config.model";
import { Attributes } from "../../model/print-request/attributes.model";
import { GeoJSONLayer } from "../../model/print-request/geojson-layer.model";
import { MapfishMap } from "../../model/print-request/mapfish-map.model";
import { MapFishPrintRequest } from "../../model/print-request/mapfish-printrequest.model";
import { Matrix } from "../../model/print-request/matrix.model";
import { ImageLayer as ImagePrintLayer } from "../../model/print-request/image-layer.model";
import { WmsLayer } from "../../model/print-request/wms-layer.model";
import { WmtsLayer } from "../../model/print-request/wmts-layer.model";
import { PrintConfigService } from "../print-config/print-config.service";
import { GgcMapfishPrintrequestCreateService } from "./ggc-mapfish-printrequest-create.service";
import { ImageStatic } from "ol/source";
import { TiledWmsLayer } from "../../model/print-request/tiled-wms-layer.model";
import TileWmsSource from "ol/source/TileWMS";
import VectorTileLayer from "ol/layer/VectorTile";
import VectorTileSource from "ol/source/VectorTile";
import { PrintPreviewService } from "../print-preview/print-preview.service";
import { MVTEncoder } from "@geoblocks/print";
import { MapfishPrintProperties } from "../../model/print-request/mapfish-print-properties";
import type { MockedObject } from "vitest";

describe("MapfishPrintrequestCreateService", () => {
  let mapfishPrintrequestCreateService: GgcMapfishPrintrequestCreateService;
  let mapServiceMock: MockedObject<GgcMapService>;
  let crsConfigServiceMock: MockedObject<GgcCrsConfigService>;
  let printConfigServiceMock: MockedObject<PrintConfigService>;
  let drawServiceMock: MockedObject<GgcDrawService>;
  let drawServiceSpy: MockedObject<GgcDrawService>;
  let mapServiceSpy: MockedObject<GgcMapService>;
  let crsConfigSpy: MockedObject<GgcCrsConfigService>;
  let printConfigServiceSpy: MockedObject<PrintConfigService>;
  let mvtEncoderSpy: MockedObject<MVTEncoder>;
  let printPreviewServiceSpy: MockedObject<PrintPreviewService>;
  let printProperties: MapfishPrintProperties;

  beforeEach(() => {
    drawServiceSpy = {
      isLayerVisible: vi.fn(),
      getFeaturesFromLayer: vi.fn()
    } as unknown as MockedObject<GgcDrawService>;
    mapServiceSpy = {
      getMap: vi.fn()
    } as unknown as MockedObject<GgcMapService>;
    crsConfigSpy = {
      getRdNewCrsConfig: vi.fn()
    } as unknown as MockedObject<GgcCrsConfigService>;
    printConfigServiceSpy = {
      applyConfigToLayer: vi.fn(),
      isLayerPrintDisabled: vi.fn(),
      extractConfig: vi.fn()
    } as unknown as MockedObject<PrintConfigService>;
    printPreviewServiceSpy = {
      calculatePrintRectangle: vi.fn()
    } as unknown as MockedObject<PrintPreviewService>;

    mvtEncoderSpy = {
      encodeMVTLayer: vi.fn()
    } as unknown as MockedObject<MVTEncoder>;
    mvtEncoderSpy.encodeMVTLayer.mockResolvedValue([
      {
        baseURL: "test.vector.tile.png",
        extent: [1, 2, 3, 4]
      } as any
    ]);

    printProperties = {
      scale: 500,
      layout: "test",
      center: [1, 2],
      extraPrintlayers: ["test"],
      mapAreaSize: { width: 100, height: 100 },
      attributes: {}
    };

    TestBed.configureTestingModule({
      providers: [
        GgcMapfishPrintrequestCreateService,
        { provide: GgcDrawService, useValue: drawServiceSpy },
        { provide: GgcMapService, useValue: mapServiceSpy },
        { provide: GgcCrsConfigService, useValue: crsConfigSpy },
        { provide: PrintConfigService, useValue: printConfigServiceSpy },
        { provide: PrintPreviewService, useValue: printPreviewServiceSpy }
      ]
    });

    mapfishPrintrequestCreateService = TestBed.inject(
      GgcMapfishPrintrequestCreateService
    );
    mapServiceMock = TestBed.inject(GgcMapService) as MockedObject<GgcMapService>;
    crsConfigServiceMock = TestBed.inject(
      GgcCrsConfigService
    ) as MockedObject<GgcCrsConfigService>;
    printConfigServiceMock = TestBed.inject(
      PrintConfigService
    ) as MockedObject<PrintConfigService>;
    drawServiceMock = TestBed.inject(GgcDrawService) as MockedObject<GgcDrawService>;
  });

  it("should create", () => {
    expect(mapfishPrintrequestCreateService).toBeTruthy();
  });

  it("should return an array with different types of layers (in reversed order) from the map when createLayers() is called", async () => {
    const getLayersMock = {
      getLayers() {
        return new Collection([
          new ImageLayer({
            source: new ImageWMS({
              url: "test.url.bagterugmeldingen",
              projection: undefined,
              params: {
                LAYERS: ["bagterugmeldingen"]
              }
            })
          }),
          new VectorLayer({
            source: new VectorSource({
              url: "test.url.landsgrenzen",
              format: new GeoJSON({
                dataProjection: "",
                featureProjection: ""
              })
            })
          }),
          new VectorTileLayer({
            source: new VectorTileSource({
              url: "test.url.provincies"
            })
          })
        ]) as Collection<BaseLayer>;
      }
    } as OlMap;
    mapServiceMock.getMap.mockReturnValue(getLayersMock);
    mvtEncoderSpy.encodeMVTLayer.mockReturnValue(Promise.resolve([]));

    const layersArray =
      await mapfishPrintrequestCreateService.createLayers(printProperties);
    expect(mapServiceMock.getMap).toHaveBeenCalled();
    expect(layersArray[0].type).toEqual("image");
    expect(
      (layersArray[0] as ImagePrintLayer).baseURL.startsWith(
        "data:image/png;base64,iVBORw0KGgoAAAAN"
      )
    ).toBe(true);
    expect((layersArray[1] as GeoJSONLayer).geoJson).toBe(
      "test.url.landsgrenzen"
    );
    expect((layersArray[1] as GeoJSONLayer).style).toEqual(basicGeojsonStyle);
    expect((layersArray[2] as WmsLayer).baseURL).toBe(
      "test.url.bagterugmeldingen"
    );
    expect((layersArray[2] as WmsLayer).layers).toEqual(["bagterugmeldingen"]);
    expect((layersArray[2] as WmsLayer).customParams.TRANSPARENT).toEqual(true);
  });

  it(
    "should return an array with different types of layers based on zIndex (high to low, when it is provided)" +
      " from the map when createLayers() is called",
    async () => {
      const getLayersMock = {
        getLayers() {
          return new Collection([
            new ImageLayer({
              zIndex: 10,
              source: new ImageWMS({
                url: "test.url.bagterugmeldingen",
                projection: undefined,
                params: {
                  customParams: {
                    TRANSPARANT: true
                  }
                }
              })
            }),
            new VectorLayer({
              zIndex: 20,
              source: new VectorSource({
                url: "test.url.landsgrenzen",
                format: new GeoJSON({
                  dataProjection: "",
                  featureProjection: ""
                })
              })
            }),
            new VectorTileLayer({
              zIndex: 15,
              source: new VectorTileSource({
                url: "test.url.provincies"
              })
            })
          ]) as Collection<BaseLayer>;
        }
      } as OlMap;
      mapServiceMock.getMap.mockReturnValue(getLayersMock);
      mvtEncoderSpy.encodeMVTLayer.mockReturnValue(Promise.resolve([]));

      const layersArray =
        await mapfishPrintrequestCreateService.createLayers(printProperties);

      expect(mapServiceMock.getMap).toHaveBeenCalledWith(undefined);
      expect((layersArray[2] as WmsLayer).baseURL).toBe(
        "test.url.bagterugmeldingen"
      );
      expect((layersArray[2] as WmsLayer).customParams.TRANSPARENT).toEqual(
        true
      );
      expect(layersArray[1].type).toEqual("image");
      expect((layersArray[0] as GeoJSONLayer).geoJson).toBe(
        "test.url.landsgrenzen"
      );

      expect((layersArray[0] as GeoJSONLayer).style).toEqual(basicGeojsonStyle);
    }
  );

  it("should return an MapfishMap object containing dpi, scale, layersArray, center and projection when createMapfishMap is called", () => {
    const getProjectionMock = {
      getView() {
        return {
          getProjection() {
            return {
              getCode() {
                return "EPSG:28892";
              }
            };
          }
        };
      }
    } as OlMap;

    mapServiceMock.getMap.mockReturnValue(getProjectionMock);

    const layers: WmsLayer[] = [{} as WmsLayer];
    const center: Coordinate = [123, 456];

    const messageMap = mapfishPrintrequestCreateService.createMapfishMap(
      500,
      layers,
      center
    );

    expect(messageMap.dpi).toEqual(180);
    expect(messageMap.layers).toBe(layers);
    expect(messageMap.layers.length).toBe(1);
    expect(messageMap.scale).toBe(500);
    expect(messageMap.center).toEqual([123, 456]);
    expect(messageMap.projection).toEqual("EPSG:28892");
  });

  it(
    "should return an object of layoutWithAttributes containing the MapfishMap" +
      " and dynamic attributes when createAttributes is called",
    () => {
      const messageMap: MapfishMap = {} as MapfishMap;
      const extraAttributes = {
        Perceel: "A2301",
        Kadastrale_gemeente: "KA2000"
      } as object;

      const attributes: Attributes =
        mapfishPrintrequestCreateService.createAttributes(
          messageMap,
          extraAttributes
        );

      expect(attributes["map"]).toEqual(messageMap);
      expect(attributes["Perceel"]).toEqual("A2301");
      expect(attributes["Kadastrale_gemeente"]).toEqual("KA2000");
    }
  );

  it(
    "should return a mapfishPrintRequest containing the layoutWithAttributes and layout" +
      " when createPrintRequest is called",
    async () => {
      const formGroup = getFormGroup();

      const layers: WmsLayer[] = [{} as WmsLayer];
      const messageMap: MapfishMap = {} as MapfishMap;
      const outputFileName = "filename";

      vi.spyOn(mapfishPrintrequestCreateService, "createLayers").mockReturnValue(
        Promise.resolve(layers)
      );
      vi.spyOn(
        mapfishPrintrequestCreateService,
        "createMapfishMap"
      ).mockReturnValue(messageMap);
      vi.spyOn(mapfishPrintrequestCreateService, "createFileName").mockReturnValue(
        outputFileName
      );

      /*formGroup: FormGroup,
        center: Coordinate,
        layerNames: string[],*/

      const mapFishPrintRequest: MapFishPrintRequest =
        await mapfishPrintrequestCreateService.createPrintRequest(
          printProperties
        );

      expect(mapFishPrintRequest.attributes.map).toEqual(messageMap);
      expect(mapFishPrintRequest.layout).toEqual(
        formGroup.getRawValue()["template"].name
      );
      expect(mapFishPrintRequest.outputFilename).toEqual(outputFileName);
    }
  );

  it("when mapIndex is provided, it should getMap by name", async () => {
    printProperties.mapIndex = "print-map";
    const createLayersSpy = vi.spyOn(
      mapfishPrintrequestCreateService,
      "createLayers"
    ).mockReturnValue(Promise.resolve([]));
    const createMapfishMapSpy = vi.spyOn(
      mapfishPrintrequestCreateService,
      "createMapfishMap"
    ).mockReturnValue({} as any);
    const createAttributesSpy = vi.spyOn(
      mapfishPrintrequestCreateService,
      "createAttributes"
    );
    const createFileNameSpy = vi.spyOn(
      mapfishPrintrequestCreateService,
      "createFileName"
    );
    /*    getFormGroup(),
      [1, 2],
      ["test"],
      () => "filename",
      mapIndex*/
    await mapfishPrintrequestCreateService.createPrintRequest(printProperties);

    expect(createLayersSpy).toHaveBeenCalledWith(printProperties);
    expect(createMapfishMapSpy).toHaveBeenCalled();
    expect(createMapfishMapSpy.mock.calls.at(-1)?.[3]).toBe(
      printProperties.mapIndex
    );
    expect(createAttributesSpy).toHaveBeenCalled();
    expect(createFileNameSpy).toHaveBeenCalled();
  });

  it("should return 0.210 when getResolutionForScale is called with 750", () => {
    const resolutionScale750 =
      mapfishPrintrequestCreateService["getResolutionForScale"](750);

    expect(resolutionScale750).toBe(0.21);
  });

  it("should return 1.680 when getResolutionForScale is called with 6000", () => {
    const resolutionScale6000 =
      mapfishPrintrequestCreateService["getResolutionForScale"](6000);

    expect(resolutionScale6000).toBe(1.68);
  });

  it(
    "should return true when isScaleWithinMinMaxResolutionOfLayer is called with a layer that " +
      "does not have min- and maxresolution",
    () => {
      const isWithinResolution = mapfishPrintrequestCreateService[
        "isScaleWithinMinMaxResolutionOfLayer"
      ](new BaseLayer({}), 500);

      expect(isWithinResolution).toBe(true);
    }
  );

  it(
    "should return true when isScaleWithinMinMaxResolutionOfLayer is called with a scale " +
      "that is within the min- and maxresolution of the layer",
    () => {
      const isWithinResolution = mapfishPrintrequestCreateService[
        "isScaleWithinMinMaxResolutionOfLayer"
      ](getBaseLayerMock(), 4500);

      expect(isWithinResolution).toBe(true);
    }
  );

  it(
    "should return true when isScaleWithinMinMaxResolutionOfLayer is called with a scale " +
      "that is equal to the minResolution of the layer",
    () => {
      const isWithinResolution = mapfishPrintrequestCreateService[
        "isScaleWithinMinMaxResolutionOfLayer"
      ](getBaseLayerMock(), 3000);

      expect(isWithinResolution).toBe(true);
    }
  );

  it(
    "should return false when isScaleWithinMinMaxResolutionOfLayer is called with a scale " +
      "that is not within the min- and maxresolution of the layer",
    () => {
      const isWithinResolution = mapfishPrintrequestCreateService[
        "isScaleWithinMinMaxResolutionOfLayer"
      ](getBaseLayerMock(), 2000);

      expect(isWithinResolution).toBe(false);
    }
  );

  it(
    "should return false when isScaleWithinMinMaxResolutionOfLayer is called with a scale " +
      "that is equal to the maxResolution of the layer",
    () => {
      const isWithinResolution = mapfishPrintrequestCreateService[
        "isScaleWithinMinMaxResolutionOfLayer"
      ](getBaseLayerMock(), 6000);

      expect(isWithinResolution).toBe(false);
    }
  );

  it("should return a WMS-layer that can be printed when createWmsLayer is called", () => {
    const wmsLayer: WmsLayer | undefined =
      mapfishPrintrequestCreateService["createWmsLayer"](getWMSLayerMock());
    if (wmsLayer) {
      expect(wmsLayer.baseURL).toBe("test.url.bgtterugmeldingen");
      expect(wmsLayer.layers).toEqual(["bgtterugmeldingen"]);
      expect(wmsLayer.styles).toEqual(["wms-print-style"]);
      expect(wmsLayer.customParams.TRANSPARENT).toEqual(true);
    } else {
      throw new Error("wmsLayer should be defined");
    }
  });

  it("should return a TiledWMS-layer that can be printed when createTiledWmsLayer is called", () => {
    const tiledWmsLayer: TiledWmsLayer | undefined =
      mapfishPrintrequestCreateService["createTiledWmsLayer"](
        getTiledWMSLayerMock()
      );
    if (tiledWmsLayer) {
      expect(tiledWmsLayer.baseURL).toBe("test.url.bgtterugmeldingen");
      expect(tiledWmsLayer.layers).toEqual(["bgtterugmeldingen"]);
      expect(tiledWmsLayer.styles).toEqual(["tiled-wms-print-style"]);
      expect(tiledWmsLayer.customParams.TRANSPARENT).toEqual(true);
      expect(tiledWmsLayer.type).toBe("tiledwms");
    } else {
      throw new Error("tiledWmsLayer should be defined");
    }
  });

  it("should return a GeoJSON-layer with basic styling that can be printed when createGeoJsonLayer is called", () => {
    const geoJsonLayer: GeoJSONLayer | undefined =
      mapfishPrintrequestCreateService["createGeoJSONLayer"](
        getGeoJSONLayerMock()
      );
    if (geoJsonLayer) {
      expect(geoJsonLayer.geoJson).toBe("test.url.landsgrens");
      expect(geoJsonLayer.style).toEqual(basicGeojsonStyle);
    } else {
      throw new Error("geoJsonLayer should be defined");
    }
  });

  it("should return a IMAGE-layer when createImageLayer is called", () => {
    const imageLayer: ImagePrintLayer | undefined =
      mapfishPrintrequestCreateService["createImageLayer"](getImageLayerMock());
    if (imageLayer) {
      expect(imageLayer.baseURL.toString()).toBe("test.image.png");
      expect(imageLayer.extent).toEqual([1, 2, 3, 4]);
    } else {
      throw new Error("imageLayer should be defined");
    }
  });

  it("should return a Draw-layer with basic styling that can be printed when createDrawLayer is called", () => {
    const layer = getDrawLayerMock();
    const features = layer.getSource()?.getFeatures() as Feature<Geometry>[];
    drawServiceMock.isLayerVisible.mockReturnValue(true);
    drawServiceMock.getFeaturesFromLayer.mockReturnValue(features);
    const drawLayer: GeoJSONLayer | undefined =
      mapfishPrintrequestCreateService["createDrawLayer"]("test");
    const geoJson = getLayerAsGeoJson(features);
    const styleObject = basicMeasureStyle;
    if (drawLayer) {
      expect(drawLayer.geoJson).toEqual(geoJson);
      expect(drawLayer.style).toEqual(styleObject);
    } else {
      throw new Error("drawLayer should be defined");
    }
  });

  it("should return a WMTS-layer that can be printed when createWMTSLayers is called", () => {
    crsConfigServiceMock.getRdNewCrsConfig.mockReturnValue(getRdNewCrsConfig());

    const wmtsLayer =
      mapfishPrintrequestCreateService["createWmtsLayer"](getWMTSLayerMock());

    if (wmtsLayer) {
      expect(wmtsLayer.matrices[0]).toEqual(createMatrix());
      expect(wmtsLayer.matrixSet).toEqual("EPSG:28992");
      expect(wmtsLayer.baseURL).toEqual("test.url.wmts.kaartlaag");
      expect(wmtsLayer.layer).toEqual("brt-achtergrondkaartlaag");
      expect(wmtsLayer.requestEncoding).toBe("KVP");
    } else {
      throw new Error("wmtsLayer should be defined");
    }
  });

  it("should return an string array when parseToStringArray is called with a string", () => {
    const stringToStringArray =
      mapfishPrintrequestCreateService["parseToStringArray"]("test-string");

    expect(stringToStringArray).toEqual(["test-string"]);
  });

  it("should let createWmsLayer() return undefined when in doNotPrintLayer() returns true", () => {
    printConfigServiceMock.isLayerPrintDisabled.mockReturnValue(true);

    const wmsLayer: WmsLayer | undefined =
      mapfishPrintrequestCreateService["createWmsLayer"](getWMSLayerMock());

    expect(printConfigServiceMock.isLayerPrintDisabled).toHaveBeenCalled();
    expect(wmsLayer).toBe(undefined);
  });

  it("should let createTiledWmsLayer() return undefined when in doNotPrintLayer() returns true", () => {
    printConfigServiceMock.isLayerPrintDisabled.mockReturnValue(true);

    const tiledWmsLayer: TiledWmsLayer | undefined =
      mapfishPrintrequestCreateService["createTiledWmsLayer"](
        getTiledWMSLayerMock()
      );

    expect(printConfigServiceMock.isLayerPrintDisabled).toHaveBeenCalled();
    expect(tiledWmsLayer).toBe(undefined);
  });

  it("should let createWmtsLayer() return undefined when in the printConfig doNotPrint is true", () => {
    printConfigServiceMock.isLayerPrintDisabled.mockReturnValue(true);

    const wmtsLayer: WmtsLayer | undefined =
      mapfishPrintrequestCreateService["createWmtsLayer"](getWMTSLayerMock());

    expect(printConfigServiceMock.isLayerPrintDisabled).toHaveBeenCalled();
    expect(wmtsLayer).toBe(undefined);
  });

  it("should let createGeoJsonLayer() return undefined when in the printConfig doNotPrint is true", () => {
    printConfigServiceMock.isLayerPrintDisabled.mockReturnValue(true);

    const geoJsonLayer: GeoJSONLayer | undefined =
      mapfishPrintrequestCreateService["createGeoJSONLayer"](
        getGeoJSONLayerMock()
      );

    expect(printConfigServiceMock.isLayerPrintDisabled).toHaveBeenCalled();
    expect(geoJsonLayer).toBe(undefined);
  });

  it("should let createImage() return undefined when in the printConfig doNotPrint is true", () => {
    printConfigServiceMock.isLayerPrintDisabled.mockReturnValue(true);

    const imageLayer: ImagePrintLayer | undefined =
      mapfishPrintrequestCreateService["createImageLayer"](getImageLayerMock());

    expect(printConfigServiceMock.isLayerPrintDisabled).toHaveBeenCalled();
    expect(imageLayer).toBe(undefined);
  });

  it("should use the printUrl and printStyles from printConfig if those are available when you're printing a WMS-Layer", () => {
    printConfigServiceMock.extractConfig.mockReturnValue(
      new PrintConfig({
        layerId: "layerTest",
        printUrl: "otherUrl",
        printStyles: ["otherStyle"]
      })
    );
    const wmsLayer: WmsLayer | undefined =
      mapfishPrintrequestCreateService["createWmsLayer"](getWMSLayerMock());

    expect(printConfigServiceMock.extractConfig).toHaveBeenCalled();
    expect(wmsLayer).toBeDefined();
    expect(wmsLayer?.baseURL).toBe("otherUrl");
    expect(wmsLayer?.styles).toEqual(["otherStyle"]);
  });

  it("should use the printUrl and printStyles from printConfig if those are available when you're printing a Tiled-WMS-Layer", () => {
    printConfigServiceMock.extractConfig.mockReturnValue(
      new PrintConfig({
        layerId: "layerTest",
        printUrl: "otherUrl",
        printStyles: ["otherStyle"]
      })
    );

    const tiledWmsLayer: TiledWmsLayer | undefined =
      mapfishPrintrequestCreateService["createTiledWmsLayer"](
        getTiledWMSLayerMock()
      );

    expect(printConfigServiceMock.extractConfig).toHaveBeenCalled();
    expect(tiledWmsLayer).toBeDefined();
    expect(tiledWmsLayer?.baseURL).toBe("otherUrl");
    expect(tiledWmsLayer?.styles).toEqual(["otherStyle"]);
  });

  it("should return an outputFilename based on the map of values and the outputFilenameFunction when createFileName is called", () => {
    const outputFileNameFunction = (value: Map<string, string>) => {
      return (
        value.get("layout") +
        "_" +
        value.get("Referentie") +
        "_" +
        value.get("KadastraleGemeente")
      );
    };
    printProperties.outputFilenameFunction = outputFileNameFunction;
    printProperties.layout = "a4";
    printProperties.scale = 1000;
    printProperties.attributes = {
      Referentie: "Kadaster",
      KadastraleGemeente: "Apeldoorn"
    };
    const outputFilename =
      mapfishPrintrequestCreateService.createFileName(printProperties);

    expect(outputFilename).toEqual("a4_Kadaster_Apeldoorn");
  });

  it("should return an outputFilename based on the map of values and the outputFilenameFunction when createFileName is called", () => {
    const outputFileNameFunction = (value: Map<string, string>) => {
      return (
        (value.get("Referentie") as string) +
        (value.get("KadastraleGemeente") as string)
      );
    };
    printProperties.outputFilenameFunction = outputFileNameFunction;
    printProperties.scale = 1000;
    printProperties.layout = "a4";
    printProperties.attributes = { Referentie: "", KadastraleGemeente: "" };

    const outputFilename =
      mapfishPrintrequestCreateService.createFileName(printProperties);

    expect(outputFilename).toBeUndefined();
  });

  it(
    "should return an undefined value so the printserver should used the default outputFilename when createFileName " +
      "is called without a function",
    () => {
      printProperties.layout = "a4";
      printProperties.scale = 1000;
      printProperties.attributes = {
        Referentie: "Kadaster",
        KadastraleGemeente: "Apeldoorn"
      };

      const outputFilename =
        mapfishPrintrequestCreateService.createFileName(printProperties);

      expect(outputFilename).toBeUndefined();
    }
  );

  function getFormGroup(): FormGroup {
    const formBuilder = new FormBuilder();
    formBuilder.array([]);
    const formGroup: FormGroup = formBuilder.group({
      scale: [],
      template: []
    });
    formGroup.patchValue({
      scale: 500,
      template: {
        name: "test",
        mapAreaSize: { width: 100, height: 200 }
      }
    });
    return formGroup;
  }

  function getRdNewCrsConfig(): CrsConfig {
    return {
      projectionCode: "EPSG:28992",
      extent: [-285401.92, 22598.08, 595401.92, 903401.92],
      resolutions: [3440.64, 1720.32],
      matrixSet: "EPSG:28992",
      matrixIds: ["0", "1"],
      matrixSizes: [1, 2],
      units: "m"
    };
  }

  function getBaseLayerMock(): BaseLayer {
    return new BaseLayer({
      minResolution: 0.84, // scale 3.000
      maxResolution: 1.68 // scale 6.000
    });
  }

  function getWMSLayerMock(): ImageLayer<ImageSource> {
    return new ImageLayer({
      source: new ImageWMS({
        url: "test.url.bgtterugmeldingen",
        projection: undefined,
        params: {
          LAYERS: ["bgtterugmeldingen"],
          STYLES: ["wms-print-style"],
          customParams: {
            TRANSPARANT: true
          }
        }
      })
    });
  }

  function getTiledWMSLayerMock(): TileLayer<TileWmsSource> {
    return new TileLayer({
      source: new TileWmsSource({
        url: "test.url.bgtterugmeldingen",
        projection: undefined,
        params: {
          LAYERS: ["bgtterugmeldingen"],
          STYLES: ["tiled-wms-print-style"],
          customParams: {
            TRANSPARANT: true
          }
        }
      })
    });
  }

  function getWMTSLayerMock(): TileLayer<TileSource> {
    return new TileLayer({
      source: new WMTS({
        urls: ["test.url.wmts.kaartlaag"],
        layer: "brt-achtergrondkaartlaag",
        matrixSet: "EPSG:28992",
        requestEncoding: "KVP",
        projection: "EPSG:28992",
        style: "default",
        tileGrid: new WMTSTileGrid({
          origin: [123, 456],
          tileSize: 256,
          matrixIds: [
            "0",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10",
            "11",
            "12",
            "13",
            "14",
            "15",
            "16"
          ],
          resolutions: [
            3440.64, 1720.32, 860.16, 430.08, 215.04, 107.52, 53.76, 26.88,
            13.44, 6.72, 3.36, 1.68, 0.84, 0.42, 0.21, 0.105, 0.0525
          ]
        })
      })
    });
  }

  function getGeoJSONLayerMock(): VectorLayer<VectorSource<Feature<Geometry>>> {
    return new VectorLayer({
      source: new VectorSource({
        url: "test.url.landsgrens",
        format: new GeoJSON({
          dataProjection: "",
          featureProjection: ""
        })
      })
    });
  }

  function getImageLayerMock(): ImageLayer<ImageStatic> {
    return new ImageLayer({
      source: new ImageStatic({
        url: "test.image.png",
        imageExtent: [1, 2, 3, 4]
      })
    });
  }

  function getDrawLayerMock(): VectorLayer<VectorSource<Feature<Geometry>>> {
    const features: Feature<Geometry>[] = [];
    return new VectorLayer({
      source: new VectorSource({
        features
      })
    });
  }

  function getLayerAsGeoJson(
    features: Feature<Geometry>[]
  ): FeatureCollection<GeoJsonGeometry, GeoJsonProperties> {
    return new GeoJSON().writeFeaturesObject(features);
  }

  function createMatrix() {
    return new Matrix({
      identifier: "0",
      topLeftCorner: [123, 456],
      tileSize: [256, 256],
      scaleDenominator: 12288000,
      matrixSize: [1, 1]
    });
  }
});
