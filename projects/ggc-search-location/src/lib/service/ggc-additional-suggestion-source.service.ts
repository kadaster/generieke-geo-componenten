import { Observable, of } from "rxjs";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";
import { Injectable } from "@angular/core";

/**
 * Service die fungeert als bron voor aanvullende zoeksuggesties die niet uit de standaard PDOK Location API komen.
 *
 * Deze service kan worden uitgebreid of vervangen om aangepaste resultaten (zoals eigen kaartlagen of externe bronnen)
 * te integreren in de suggestielijst van de zoekcomponent.
 */
@Injectable({
  providedIn: "root"
})
export class GgcAdditionalSuggestionSourceService {
  /**
   * Zoekt naar aanvullende suggesties op basis van een zoekterm.
   *
   * In de standaardimplementatie geeft deze methode een lege array terug.
   *
   * @param _ - De zoekterm waarop gefilterd moet worden.
   * @returns Een Observable met een array van {@link AdditionalSuggestion} objecten.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  search(_: string): Observable<AdditionalSuggestion[]> {
    return of([]);
  }
}
