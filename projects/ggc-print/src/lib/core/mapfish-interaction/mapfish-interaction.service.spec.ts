import {
  HttpClient,
  HttpHeaders,
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Capabilities } from "../../model/capabilities/capabilities";
import { GgcPrintError } from "../../model/print-error.model";
import { MapFishPrintRequest } from "../../model/print-request/mapfish-printrequest.model";
import { PrintRequestResponse } from "../../model/print-request/print-request-response";
import { WmsLayer } from "../../model/print-request/wms-layer.model";
import { Print } from "../../model/result/Print";
import { StatusResponse } from "../../model/result/StatusRepsonse";

import { GgcMapfishInteractionService } from "./ggc-mapfish-interaction.service";

describe("MapfishInteractionService", () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let service: GgcMapfishInteractionService;

  const capabilitiesUrl =
    "https://print-services/DKK/capabilities.json";
  const reportUrl =
    "https://print-services/DKK/report.pdf";
  const statusUrl =
    "https://print-services/status/printId.json";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(GgcMapfishInteractionService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should be able to getCapabilities and receive Capabilities using HttpClient.get", () => {
    const testData: Capabilities = {
      app: "Test Data",
      layouts: [{ name: "print-template", attributes: [] }],
      formats: ["PDF"]
    };

    // Make an HTTP GET request
    httpClient
      .get<Capabilities>("/print/print-template/capabilities.json")
      .subscribe((data: Capabilities) => expect(data).toEqual(testData));

    // The following `expectOne()` will match the request's URL.
    // If no requests or multiple requests matched that URL
    // `expectOne()` would throw.
    const req = httpTestingController.expectOne(
      "/print/print-template/capabilities.json"
    );

    // Assert that the request is a GET.
    expect(req.request.method).toEqual("GET");

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    req.flush(testData);
  });

  it("should be able to handle an invalid response when trying to GET capabilities", () => {
    service.getConfigCapabilities("DKK").subscribe(
      () => undefined,
      (error: GgcPrintError) => {
        expect(error.type).toEqual("noValidResponse");
        expect(error.foutmelding).toEqual(
          "Er ging iets mis bij het verwerken van gegevens, probeer het later nog eens"
        );
        expect(error.technischeFout).toEqual(
          "Geen geldige Capabilities ontvangen van de server"
        );
      }
    );

    const req = httpTestingController.expectOne(capabilitiesUrl);
    expect(req.request.method).toEqual("GET");

    req.flush("{invalide: json}}");
  });

  it("should be able to handle a HTTP error when trying to GET capabilities", () => {
    service.getConfigCapabilities("DKK").subscribe(
      () => {
        throw new Error("");
      },
      (error: GgcPrintError) => {
        expect(error.foutmelding).toEqual(
          "Het ophalen van gegevens is mislukt, probeer het later nog een keer"
        );
        expect(error.technischeFout).toEqual("Error: 404 Not Found!");
        expect(error.type).toEqual("httpError");
      }
    );

    httpTestingController.expectOne(capabilitiesUrl).error(new ErrorEvent(""), {
      status: 404,
      statusText: "Not Found!"
    });
  });

  it("should be able to sendPrintRequest and receive a PrintRequestResponse using HttpClient.post", () => {
    const testData: PrintRequestResponse = {
      downloadURL: "/print/report/uuid",
      ref: "uuid",
      statusURL: "print/status/uuid.json"
    };

    const mapfishPrintRequest: MapFishPrintRequest =
      createMapFishTestPrintRequest();
    const apiTestKey = "Dit is een test Key";

    service.provideApiKey(apiTestKey);
    service
      .sendPrintRequest("DKK", mapfishPrintRequest)
      .subscribe((response) => {
        expect(response.statusURL).toEqual("print/status/uuid.json");
        expect(response.ref).toEqual("uuid");
        expect(response.downloadURL).toEqual("/print/report/uuid");
      });

    const req = httpTestingController.expectOne(reportUrl);
    expect(req.request.method).toEqual("POST");
    expect(req.request.headers.get("apikey")).toEqual(apiTestKey);

    req.flush(testData);
  });

  it("should be able to handle an invalid response error when sending a POST request", () => {
    const mapfishPrintRequest: MapFishPrintRequest =
      createMapFishTestPrintRequest();

    service.sendPrintRequest("DKK", mapfishPrintRequest).subscribe(
      () => undefined,
      (error: GgcPrintError) => {
        expect(error.foutmelding).toEqual(
          "Er ging iets mis bij het verwerken van gegevens, probeer het later nog eens"
        );
        expect(error.type).toEqual("noValidResponse");
        expect(error.technischeFout).toEqual(
          "Geen geldige PrintRequestResponse ontvangen van de server"
        );
      }
    );

    const req = httpTestingController.expectOne(reportUrl);
    expect(req.request.method).toEqual("POST");

    req.flush("{invalide: json}}");
  });

  it("should be able to handle a HTTP error when sending a POST request", () => {
    const mapfishPrintRequest: MapFishPrintRequest =
      createMapFishTestPrintRequest();
    mapfishPrintRequest.layout = "A404 landscape";

    service.sendPrintRequest("DKK", mapfishPrintRequest).subscribe(
      () => {
        throw new Error("");
      },
      (error: GgcPrintError) => {
        expect(error.technischeFout).toEqual("Error: 418 Dit hoort niet!");
        expect(error.foutmelding).toEqual(
          "Het ophalen van gegevens is mislukt, probeer het later nog een keer"
        );
        expect(error.type).toEqual("httpError");
      }
    );

    httpTestingController.expectOne(reportUrl).error(new ErrorEvent(""), {
      status: 418,
      statusText: "Dit hoort niet!"
    });
  });

  it("can test getResult() when done", () => {
    expect(service).toBeTruthy();

    service.getResult("printId").subscribe((res) =>
      // check statusResponse
      expect(res.done).toBe(true)
    );

    // The following `'match` will match the request's URL.
    const result = httpTestingController.expectOne({
      url: statusUrl
    });

    // Assert that the request is a GET.
    expect(result.request.method).toEqual("GET");
    expect(result.request.url).toEqual(statusUrl);

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    result.flush(getStatusResponse());
  });

  it("can test getResult() when not done", () => {
    expect(service).toBeTruthy();

    service.getResult("printId").subscribe(() => {
      throw new Error("Should not execute this statement");
    });

    // The following `'match` will match the request's URL.
    const result = httpTestingController.expectOne({
      url: statusUrl
    });

    // Assert that the request is a GET.
    expect(result.request.method).toEqual("GET");
    expect(result.request.url).toEqual(statusUrl);

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    const statusResponse = getStatusResponse();
    statusResponse.done = false;
    result.flush(statusResponse);
  });

  it("getResult() should be able to handle a HTTP error", () => {
    // semaphore to check is the error is handled
    let errorCheck = false;

    service.getResult("printId").subscribe(
      () => undefined,
      (error: GgcPrintError) => {
        expect(error.type).toEqual("noValidResponse");
        expect(error.foutmelding).toEqual(
          "Er ging iets mis bij het verwerken van gegevens, probeer het later nog eens"
        );
        expect(error.technischeFout).toEqual(
          "Geen geldige StatusResponse ontvangen van de server"
        );
        errorCheck = true;
      }
    );

    // The following `'match` will match the request's URL.
    const result = httpTestingController.expectOne({
      url: statusUrl
    });

    // Assert that the request is a GET.
    expect(result.request.method).toEqual("GET");
    expect(result.request.url).toEqual(statusUrl);

    // Respond with mock data, causing Observable to resolve.
    // Subscribe callback asserts that correct data was returned.
    result.flush("{invalide: json}}");

    // errorCheck should be True, when error is handled
    expect(errorCheck).toBe(true);
  });

  it("when setPrintserver() is called, it should change the baseUrl", () => {
    expect(service["baseUrl"]).toEqual(
      "https://print-services"
    );

    service.setPrintserver("https://testPrintserver.nl/");

    expect(service["baseUrl"]).toEqual("https://testPrintserver.nl/");
  });

  function getStatusResponse(): StatusResponse {
    return {
      done: true,
      status: "finished",
      elapsedTime: 18724,
      waitingTime: 0,
      error: "",
      downloadURL:
        "/print/report/62b54832-eb20-44dc-84ed-83c1e8775752@ca6b1b57-c408-4f2e-bec9-49bea62bcce1"
    } as StatusResponse;
  }

  it("cancel(printId) Should return OK", () => {
    // semaphore to check is the succes is handled
    let errorCheck = false;

    const printId = "49bea62bcce1";
    service.cancel(printId).subscribe((response) => {
      expect(response).toBe("OK");
      errorCheck = true;
    });

    // The following `'match` will match the request's URL.
    const req = httpTestingController.expectOne({
      url: "https://print-services/cancel/" + printId
    });

    // Assert that the request is a GET.
    expect(req.request.method).toEqual("DELETE");
    expect(req.request.url).toEqual(
      "https://print-services/cancel/" + printId
    );

    // The mapfish server will return no Data
    req.flush("");

    // errorCheck should be True, when error is handled
    expect(errorCheck).toBe(true);
  });

  it("should initialize a download request", () => {
    service.provideApiKey("test-api-key");
    let receivedPrint: Print | undefined;
    service.getPrint("https://my.print.url").subscribe((print: Print) => {
      receivedPrint = print;
    });

    const req = httpTestingController.expectOne({
      url: "https://my.print.url"
    });
    req.flush(new Blob());

    expect(req.request.headers.get("apikey")).toEqual("test-api-key");
    expect(receivedPrint?.filename).toEqual("print.pdf");
  });

  it("should get the filename from the response headers", () => {
    service.provideApiKey("test-api-key");
    let receivedPrint: Print | undefined;
    service.getPrint("https://my.print.url").subscribe((print: Print) => {
      receivedPrint = print;
    });

    const req = httpTestingController.expectOne({
      url: "https://my.print.url"
    });
    const headers = new HttpHeaders().append(
      "Content-Disposition",
      "attachment; filename=testname.pdf; data=print"
    );
    req.flush(new Blob(), { headers });

    expect(receivedPrint?.filename).toEqual("testname.pdf");
  });

  function createMapFishTestPrintRequest(): MapFishPrintRequest {
    return {
      layout: "A0 landscape",
      outputFilename: "filename",
      attributes: {
        referentie: "Test",
        map: {
          center: [160000, 455000],
          dpi: 180,
          scale: 500,
          projection: "EPSG:28892",
          layers: [
            {
              layers: ["test-layer"],
              baseURL: "https://test.url.nl/test-layer",
              type: "WMS",
              customParams: {
                TRANSPARENT: true
              }
            }
          ] as WmsLayer[]
        }
      }
    };
  }
});
