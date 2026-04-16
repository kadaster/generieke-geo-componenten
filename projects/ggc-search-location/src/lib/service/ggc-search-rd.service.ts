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
  /**
   * Analyseert een zoekterm om te bepalen of het een geldig RD-coördinatenpaar is.
   *
   * De methode voert opschoning uit op de input (zoals het verwijderen van prefixen en het
   * normaliseren van scheidingstekens) voordat de validatie plaatsvindt.
   *
   * @param input - De tekst die gecontroleerd moet worden op coördinaten.
   * @returns Een Observable met een {@link AdditionalSuggestion} als een geldig paar is gevonden, anders een lege array.
   */
  search(input: string): Observable<AdditionalSuggestion[]> {
    const cleaned = (input ?? "").replace(/^RD-coördinaten:\s*/i, "").trim();
    const match = cleaned.match(
      /^\s*(\d{1,6}(?:[.,]\d{1,3})?)\s*(?:[;,]|\s)\s*(\d{1,6}(?:[.,]\d{1,3})?)\s*$/
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
