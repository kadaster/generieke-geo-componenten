import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";

/**
 * Service voor het herkennen en valideren van Rijksdriehoekscoördinaten (RD) in zoekvragen.
 *
 * Deze service ondersteunt diverse formaten (met/zonder decimalen, gescheiden door spaties of komma's)
 * en normaliseert deze naar een standaard formaat voor gebruik in de zoekcomponent.
 */
@Injectable({
  providedIn: "root"
})
export class GgcSearchRdService {
  search(input: string): Observable<AdditionalSuggestion[]> {
    const cleaned = (input ?? "").replace(/^RD-coördinaten:\s*/i, "").trim();
    const match =
      /^\s*(\d{1,6}(?:[.,]\d{1,3})?)\D+(\d{1,6}(?:[.,]\d{1,3})?)\s*$/.exec(
        cleaned
      );

    if (!match) return of([]);

    const xToken = match[1].replace(",", ".");
    const yToken = match[2].replace(",", ".");

    const x = Number(xToken);
    const y = Number(yToken);

    if (!Number.isFinite(x) || !Number.isFinite(y)) return of([]);

    const xValid = x >= 0 && x <= 300000;
    const yValid = y >= 300000 && y <= 600000;
    if (!xValid || !yValid) return of([]);

    const normalizedId = `${xToken}, ${yToken}`;
    const display = `RD-coördinaten: ${xToken} ${yToken}`;

    return of([
      {
        id: normalizedId,
        display_name: display,
        type: "rd",
        collection: "coordinate"
      }
    ]);
  }
}
