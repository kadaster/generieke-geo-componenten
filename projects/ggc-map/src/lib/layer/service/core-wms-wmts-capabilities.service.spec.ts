import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { noop, of } from "rxjs";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapService } from "../../map/service/core-map.service";
import { Capabilities } from "../model/capabilities.model";
import { CoreWmsWmtsCapabilitiesService } from "./core-wms-wmts-capabilities.service";
import { provideZoneChangeDetection } from "@angular/core";

describe("CoreWmsWmtsCapabilitiesService", () => {
  const wmsCapabilities = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities xmlns="http://www.opengis.net/wms" xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.3.0" xsi:schemaLocation="http://www.opengis.net/wms http://schemas.opengis.net/wms/1.3.0/capabilities_1_3_0.xsd http://www.opengis.net/sld http://schemas.opengis.net/sld/1.1.0/sld_capabilities.xsd">
</WMS_Capabilities>`;

  let capabilitiesService: CoreWmsWmtsCapabilitiesService;
  let crsConfigService: GgcCrsConfigService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        CoreWmsWmtsCapabilitiesService,
        CoreMapService,
        GgcCrsConfigService,
        HttpClient,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        provideZoneChangeDetection()
      ]
    });

    capabilitiesService = TestBed.inject(CoreWmsWmtsCapabilitiesService);
    crsConfigService = TestBed.inject(GgcCrsConfigService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should be created", () => {
    expect(capabilitiesService).toBeTruthy();
  });

  it("hasFeatureInfoUrl when url is present, it should return true", () => {
    const cap = {
      OperationsMetadata: {
        GetFeatureInfo: { DCP: { HTTP: { Get: [{ href: "abcd" }] } } }
      }
    };
    const capabilities = new Capabilities(cap);

    const hasFeatureInfoUrl =
      capabilitiesService.hasFeatureInfoUrl(capabilities);

    expect(hasFeatureInfoUrl).toBe(true);
  });

  it("hasFeatureInfoUrl when url is not present, it should return false", () => {
    const capabilities = new Capabilities({});

    const hasFeatureInfoUrl =
      capabilitiesService.hasFeatureInfoUrl(capabilities);

    expect(hasFeatureInfoUrl).toBe(false);
  });

  describe("getCapabilitiesForUrl", () => {
    const testUrl = "a.b/c";

    it(
      "when called with url that not has been called before, " +
        "it should call httpclient and add observable to capabilitiesMap",
      () => {
        capabilitiesService
          .getCapabilitiesForUrl(testUrl, "WMTS")
          .subscribe(noop);
        const request = httpTestingController.expectOne(
          testUrl + "?request=getCapabilities&service=WMTS"
        );
        request.flush({});
        expect(capabilitiesService["capabilitiesMap"].size).toBe(1);
      }
    );

    it("when called for a WMS service, it should add the version and withCredentials should be false", () => {
      capabilitiesService.getCapabilitiesForUrl(testUrl, "WMS").subscribe(noop);
      const request = httpTestingController.expectOne(
        testUrl + "?request=getCapabilities&service=WMS&version=1.3.0"
      );
      request.flush(wmsCapabilities);

      expect(capabilitiesService["capabilitiesMap"].size).toBe(1);
      expect(request.request.withCredentials).toBeFalse();
    });

    it("when called for a WMS service with withCredentials is false, it should set withCredentials to false", () => {
      capabilitiesService
        .getCapabilitiesForUrl(testUrl, "WMS", false)
        .subscribe(noop);
      const request = httpTestingController.expectOne(
        testUrl + "?request=getCapabilities&service=WMS&version=1.3.0"
      );
      request.flush(wmsCapabilities);

      expect(request.request.withCredentials).toBeFalse();
    });

    it("when called for a WMS service with withCredentials is true, it should set withCredentials to true", () => {
      capabilitiesService
        .getCapabilitiesForUrl(testUrl, "WMS", true)
        .subscribe(noop);
      const request = httpTestingController.expectOne(
        testUrl + "?request=getCapabilities&service=WMS&version=1.3.0"
      );
      request.flush(wmsCapabilities);

      expect(request.request.withCredentials).toBeTrue();
    });

    it(
      "when called with url that has been called before, " +
        "it should not call httpclient and return observable from capabilitiesMap",
      () => {
        const capabilitiesMapSpy = spyOn(
          capabilitiesService["capabilitiesMap"],
          "get"
        ).and.callThrough();
        const mock = of({});
        capabilitiesService["capabilitiesMap"].set(testUrl, mock);

        capabilitiesService
          .getCapabilitiesForUrl(testUrl, "WMTS")
          .subscribe(noop);

        httpTestingController.expectNone("a.b/c");
        expect(capabilitiesService["capabilitiesMap"].size).toBe(1);
        expect(capabilitiesMapSpy).toHaveBeenCalled();
      }
    );
  });

  it("createGetFeatureInfoUrlObservable it should call constructGetFeatureInfoParams and return an observable", () => {
    const capabilitiesMapSpy = spyOn(
      capabilitiesService as any,
      "constructGetFeatureInfoParams"
    ).and.returnValue({});
    const observable = capabilitiesService
      .createGetFeatureInfoUrlObservable("https://url.test/", {} as WMTS, [], 2)
      .subscribe(noop);
    const request = httpTestingController.expectOne("https://url.test/");

    request.flush({});
    expect(observable).toBeDefined();
    expect(capabilitiesMapSpy).toHaveBeenCalled();
  });

  it("constructGetFeatureInfoParams it should return a params object", () => {
    const rdNewConfig = crsConfigService.getRdNewCrsConfig();
    const wmtsSource = new WMTS({
      url: "",
      layer: "layer",
      matrixSet: rdNewConfig.matrixSet,
      format: "image/png",
      projection: rdNewConfig.projectionCode,
      style: "default",
      crossOrigin: "anonymous",
      tileGrid: new WMTSTileGrid({
        extent: rdNewConfig.extent,
        resolutions: rdNewConfig.resolutions,
        matrixIds: rdNewConfig.matrixIds
      })
    });
    const params = capabilitiesService["constructGetFeatureInfoParams"](
      wmtsSource,
      [155000, 456000],
      2
    );

    expect(params).toEqual({
      SERVICE: "WMTS",
      VERSION: "1.0.0",
      REQUEST: "GetFeatureInfo",
      LAYER: "layer",
      STYLE: "",
      FORMAT: "image/png",
      TileCol: "1024",
      TileRow: "1040",
      TileMatrix: "EPSG:28992:11",
      TileMatrixSet: "EPSG:28992",
      I: "0",
      J: "70",
      infoformat: "application/json",
      info_format: "application/json",
      FEATURE_COUNT: "8"
    });
  });
});
