import { TestBed } from "@angular/core/testing";
import { DownloadDialogComponent } from "./download-dialog.component";
import { defer, Subscription } from "rxjs";
import { GgcMapfishInteractionService } from "../core/mapfish-interaction/ggc-mapfish-interaction.service";
import { GgcPrintErrorTypes } from "../model/print-error.model";
import {
  StatusResponse,
  StatusResponseStatus
} from "../model/result/StatusRepsonse";
import { GgcMapfishPrintrequestCreateService } from "../core/print-request/ggc-mapfish-printrequest-create.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import {
  provideHttpClient,
  withInterceptorsFromDi
} from "@angular/common/http";

describe("DownloadDialogComponent", () => {
  let mapfishInteractionService: GgcMapfishInteractionService;
  let component: DownloadDialogComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: GgcMapfishPrintrequestCreateService,
          useValue: { setCustomStyle: vi.fn(), createPrintRequest: vi.fn() }
        },
        GgcMapfishInteractionService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    mapfishInteractionService = TestBed.inject(GgcMapfishInteractionService);
    TestBed.inject(GgcMapfishPrintrequestCreateService);

    component = TestBed.runInInjectionContext(
      () => new DownloadDialogComponent()
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should set the correct downloadURL when procesStatusResponse is called with a statusResponse of status FINISHED", () => {
    // preparing
    component["getResultSubscription"] = new Subscription();
    const printServer = component["mapFishInteraction"].getPrintserver();

    const statusResponse = new StatusResponse();
    statusResponse.status = StatusResponseStatus.FINISHED;
    const eenUrl = "/eenUrl";
    statusResponse.downloadURL = eenUrl;

    component.procesStatusResponse(statusResponse);

    expect(component["downloadURL"]).toBe(printServer + eenUrl);
  });

  it("when procesStatusResponse is called with status cancelled, it should set error on the component", () => {
    // preparing
    component["getResultSubscription"] = new Subscription();
    const statusResponse = new StatusResponse();
    statusResponse.status = StatusResponseStatus.CANCELLED;
    statusResponse.error = "request-is-cancelled";

    component.procesStatusResponse(statusResponse);

    const error = component["internalError"]();
    if (error) {
      expect(error.type).toBe(GgcPrintErrorTypes.PRINTSTATUSCANCELLED);
      expect(error.foutmelding).toBe(
        "Printopdracht duurde te lang en is geannuleerd, probeer het later nog een keer"
      );
      expect(error.technischeFout).toBe("request-is-cancelled");
    } else {
      throw new Error("error should be defined");
    }
  });

  it("when procesStatusResponse is called with status error, it should set error on the component", () => {
    // preparing
    component["getResultSubscription"] = new Subscription();
    const statusResponse = new StatusResponse();
    statusResponse.status = StatusResponseStatus.ERROR;
    statusResponse.error = "error-from-mapfish";

    component.procesStatusResponse(statusResponse);

    const error = component["internalError"]();
    if (error) {
      expect(error.type).toBe(GgcPrintErrorTypes.MAPFISHERROR);
      expect(error.foutmelding).toBe(
        "Er is iets misgegaan bij het uitvoeren van de printopdracht door de printserver, " +
          "probeer het later nog een keer"
      );
      expect(error.technischeFout).toBe("error-from-mapfish");
    } else {
      throw new Error("error should be defined");
    }
  });

  it("onCancel should call a running print request", () => {
    // preparing
    component["printId"] = "print-test";
    component["getResultSubscription"] = {
      unsubscribe: () => undefined
    } as Subscription;

    const getResultSubscriptionSpy = vi.spyOn(
      component["getResultSubscription"],
      "unsubscribe"
    );
    const mapfishInteractionServiceSpy = vi
      .spyOn(mapfishInteractionService, "cancel")
      .mockImplementation(() => {
        return defer(() => Promise.resolve("OK"));
      });

    component.closeModal();

    expect(getResultSubscriptionSpy).toHaveBeenCalled();
    expect(mapfishInteractionServiceSpy).toHaveBeenCalledWith("print-test");
  });
});
