import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { interval, Observable, throwError } from "rxjs";
import { catchError, filter, map, startWith, switchMap } from "rxjs/operators";
import { Capabilities } from "../../model/capabilities/capabilities";
import {
  GgcPrintError,
  GgcPrintErrorTypes
} from "../../model/print-error.model";
import { MapFishPrintRequest } from "../../model/print-request/mapfish-printrequest.model";
import { PrintRequestResponse } from "../../model/print-request/print-request-response";
import { Print } from "../../model/result/Print";
import { StatusResponse } from "../../model/result/StatusRepsonse";

@Injectable({
  providedIn: "root"
})
export class GgcMapfishInteractionService {
  private httpClient = inject(HttpClient);
  private baseUrl = "https://print-services";
  private headers: HttpHeaders;

  constructor() {
    this.headers = new HttpHeaders();
  }

  getConfigCapabilities(configurationName: string) {
    return this.httpClient
      .get<Capabilities>(
        this.baseUrl + `/${configurationName}/capabilities.json`,
        { headers: this.headers }
      )
      .pipe(
        map((antwoord) => {
          if (Capabilities.isCapabilities(antwoord)) {
            return antwoord;
          }
          throw new GgcPrintError(
            GgcPrintErrorTypes.NOVALIDRESPONSE,
            "Geen geldige Capabilities ontvangen van de server"
          );
        }),
        catchError(this.handleError)
      );
  }

  sendPrintRequest(
    configurationName: string,
    mapfishPrintRequest: MapFishPrintRequest
  ) {
    return this.httpClient
      .post<PrintRequestResponse>(
        this.baseUrl + `/${configurationName}/report.pdf`,
        mapfishPrintRequest,
        { headers: this.headers }
      )
      .pipe(
        map((response) => {
          if (PrintRequestResponse.isPrintRequestResponse(response)) {
            return response;
          }
          throw new GgcPrintError(
            GgcPrintErrorTypes.NOVALIDRESPONSE,
            "Geen geldige PrintRequestResponse ontvangen van de server"
          );
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse | GgcPrintError) {
    if (error instanceof HttpErrorResponse) {
      error = new GgcPrintError(
        GgcPrintErrorTypes.HTTPERROR,
        "Error: " + error.status + " " + error.statusText
      );
    }
    return throwError(error);
  }

  getResult(printId: string): Observable<StatusResponse> {
    return interval(1400).pipe(
      startWith(0),
      switchMap(() => this.poll(printId)),
      filter((statusResponse) => statusResponse.done)
    );
  }

  private poll(printId: string): Observable<StatusResponse> {
    return this.httpClient
      .get<StatusResponse>(this.baseUrl + `/status/${printId}.json`, {
        headers: this.headers
      })
      .pipe(
        map((response) => {
          if (StatusResponse.isStatusResponse(response)) {
            return response;
          }
          throw new GgcPrintError(
            GgcPrintErrorTypes.NOVALIDRESPONSE,
            "Geen geldige StatusResponse ontvangen van de server"
          );
        }),
        catchError(this.handleError)
      );
  }

  cancel(printId: string): Observable<string> {
    return this.httpClient
      .delete(this.baseUrl + `/cancel/${printId}`, { headers: this.headers })
      .pipe(
        // the mapfish response is null, so we return an OK
        map(() => "OK"),
        catchError(this.handleError)
      );
  }

  setPrintserver(printserverName: string) {
    this.baseUrl = printserverName;
  }

  getPrintserver(): string {
    return this.baseUrl;
  }

  getPrint(downloadUrl: string): Observable<Print> {
    const headers = this.headers.append("Content-Type", "application/pdf");
    return this.httpClient
      .get(downloadUrl, { headers, observe: "response", responseType: "blob" })
      .pipe(
        map((value) => {
          const contentDisposition = value.headers.get("Content-Disposition");
          let filename = "print.pdf";
          if (contentDisposition) {
            //Content-Disposition attachment; filename=09-17-02_30-08-2022.pdf
            // Match anything but whitespace or ';'
            const parts = contentDisposition.match(/filename=([^\s;]+)/);
            filename = parts?.pop() || "print.pdf";
          }
          return { filename, file: value.body as Blob };
        })
      );
  }

  provideApiKey(apiKey: string) {
    // set the CA-potal APIKey to the headers
    // headers.set(..) returns a clone with the new value added
    this.headers = this.headers.set("apikey", apiKey);
  }
}
