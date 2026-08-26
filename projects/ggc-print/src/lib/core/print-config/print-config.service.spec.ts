import { TestBed } from "@angular/core/testing";
import { PrintConfig } from "../../model/config/print-config.model";
import { WmsLayerOptions } from "../../model/print-request/wms-layer.model";
import { PrintConfigService } from "./print-config.service";

describe("PrintConfigService", () => {
  let printConfigService: PrintConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PrintConfigService]
    });
    printConfigService = TestBed.inject(PrintConfigService);
  });

  it(
    "should let applyConfigToLayer() replace values in the WmsLayerOptions object with values in a PrintConfig" +
      " if they're available",
    () => {
      const printConfig: PrintConfig = new PrintConfig({
        layerId: "wmsId",
        printUrl: "eenAndereUrl",
        printStyles: ["printStyle Printconfig"],
        disablePrint: false
      });

      const options = {
        baseURL: "test.url",
        styles: undefined
      } as WmsLayerOptions;

      PrintConfigService.applyConfigToLayer(options, printConfig);

      expect(options.baseURL).toBe("eenAndereUrl");
      expect(options.styles).toEqual(["printStyle Printconfig"]);
    }
  );

  it(
    "should let doNotPrintLayer() return true when an printConfig is found by extractPrintConfig() and" +
      " the doNotPrint variable in the config is true",
    () => {
      const printConfigs: PrintConfig[] = [
        {
          layerId: "shouldNotPrint",
          printUrl: undefined,
          printStyles: undefined,
          disablePrint: true
        }
      ];
      printConfigService.addKeysToPrintConfigs(printConfigs);

      const nietPrinten =
        printConfigService.isLayerPrintDisabled("shouldNotPrint");

      expect(nietPrinten).toBe(true);
    }
  );

  it("should let extractConfig() return a PrintConfig for GeoJSON if the key of the config equals the layerId", () => {
    const printConfigs: PrintConfig[] = [
      new PrintConfig({
        layerId: "geojson",
        printUrl: "test.extractJSONConfig"
      })
    ];
    printConfigService.addKeysToPrintConfigs(printConfigs);

    const extractedGeoJSONConfig: PrintConfig | undefined =
      printConfigService.extractConfig("geojson");

    if (extractedGeoJSONConfig) {
      expect(extractedGeoJSONConfig.printUrl).toEqual("test.extractJSONConfig");
    } else {
      throw new Error("extractedGeoJSONConfig should be defined");
    }
  });

  it("should let extractConfig() return a PrintConfig for IMAGE if the key of the config equals the layerId", () => {
    const imageUrl = "path/to/image.png";
    const printConfigs: PrintConfig[] = [
      new PrintConfig({
        layerId: "imageId",
        printUrl: imageUrl
      })
    ];
    printConfigService.addKeysToPrintConfigs(printConfigs);

    const extractedImageConfig: PrintConfig | undefined =
      printConfigService.extractConfig("imageId");

    expect(extractedImageConfig!.printUrl).toEqual(imageUrl);
  });

  it(
    "should let addKeysToPrintConfigs make a map from an array of PrintConfigs and return an array of the types WMS and/or WMTS" +
      " when they're not configured correctly",
    () => {
      const printConfigsArray = [
        new PrintConfig({
          layerId: "layer1",
          printUrl: "alternatieve.printUrl1",
          disablePrint: true
        }),
        new PrintConfig({
          layerId: "layer2",
          printUrl: "alternatieve.printUrl2",
          disablePrint: false
        })
      ];

      printConfigService.addKeysToPrintConfigs(printConfigsArray);

      expect(printConfigService["printConfigsMap"].get("layer1")).toEqual(
        new PrintConfig({
          layerId: "layer1",
          printUrl: "alternatieve.printUrl1",
          disablePrint: true
        })
      );
      expect(printConfigService["printConfigsMap"].get("layer2")).toEqual(
        new PrintConfig({
          layerId: "layer2",
          printUrl: "alternatieve.printUrl2",
          disablePrint: false
        })
      );
    }
  );
});
