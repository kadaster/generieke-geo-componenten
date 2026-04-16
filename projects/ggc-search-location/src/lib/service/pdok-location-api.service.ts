import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable, of, ReplaySubject, retry, timer } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap
} from "rxjs/operators";
import {
  PdokLocationApiCollectionFeature,
  PdokLocationApiResult,
  PdokLocationApiSearchFeature,
  PdokLocationApiSearchResponse,
  SearchCollection
} from "../model/pdok-location-api-collection.model";
import { GgcAdditionalSuggestionSourceService } from "./ggc-additional-suggestion-source.service";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";

/**
 * Service voor interactie met de PDOK Location API (v1-preprod).
 *
 * Deze service verzorgt het ophalen van beschikbare collecties, het uitvoeren van
 * autocomplete-zoekopdrachten en het ophalen van specifieke objectdetails.
 * Het combineert resultaten van PDOK met aanvullende suggesties uit {@link GgcAdditionalSuggestionSourceService}.
 */
@Injectable({
  providedIn: "root"
})
export class PdokLocationApiService {
  private readonly collectionsLoadedSubject =
    new ReplaySubject<PdokLocationApiResult>(1);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  readonly collectionsLoaded$ = this.collectionsLoadedSubject.asObservable();

  private readonly httpClient = inject(HttpClient);
  private readonly additionalSuggestionSourceService = inject(
    GgcAdditionalSuggestionSourceService
  );

  private readonly baseUrl = "https://api.pdok.nl/kadaster/location-api/v1/";
  private pdokLocationApiResult: PdokLocationApiResult;
  private usedCollections: SearchCollection[];
  private readonly debounceTime = 400;
  private minQueryLength = 2;
  private numberOfSuggestions = 10;

  constructor() {
    this.httpClient
      .get<PdokLocationApiResult>(`${this.baseUrl}collections?f=json`)
      .subscribe((res) => {
        this.pdokLocationApiResult = res;
        this.setDefaultCollections();
        this.collectionsLoadedSubject.next(res);
      });
  }

  /**
   * Initialiseert de standaard collecties voor het zoeken op basis van de beschikbare PDOK-collecties.
   * Elke collectie krijgt standaard een relevantie van 0.5.
   */
  setDefaultCollections(): void {
    if (this.pdokLocationApiResult?.collections?.length > 0) {
      this.usedCollections = this.pdokLocationApiResult.collections.map(
        (collection) => {
          return {
            id: collection.id,
            version: collection.version,
            relevance: 0.5
          };
        }
      );
    }
  }

  /**
   * Geeft de lijst met beschikbare PDOK-collecties terug.
   */
  getCollections() {
    return this.pdokLocationApiResult;
  }

  /**
   * Configureert een specifieke set collecties waarin gezocht moet worden.
   *
   * @param customCollections - Een array van {@link SearchCollection} objecten met id, versie en relevantie.
   */
  setCustomCollections(customCollections: SearchCollection[]) {
    const filteredCollections = customCollections.filter(
      (collection: SearchCollection) =>
        collection.id && collection.version && collection.relevance
    );
    if (filteredCollections.length > 0) {
      this.usedCollections = [...filteredCollections];
    }
  }

  /**
   * Stelt de minimale lengte van de zoekterm in voordat een verzoek naar de API wordt verzonden.
   *
   * @param minQueryLength - Aantal karakters (moet groter zijn dan 0).
   */
  setMinQueryLength(minQueryLength: number): void {
    if (minQueryLength > 0) {
      this.minQueryLength = minQueryLength;
    }
  }

  /**
   * Stelt het maximum aantal gewenste suggesties in.
   *
   * @param numberOfSuggestions - Aantal suggesties tussen 1 en 50.
   */
  setNumberOfSuggestions(numberOfSuggestions: number): void {
    if (numberOfSuggestions >= 1 && numberOfSuggestions <= 50) {
      this.numberOfSuggestions = numberOfSuggestions;
    }
  }

  /**
   * Reageert op wijzigingen in een Observable van zoektermen met een debounce-tijd.
   *
   * @param terms - Een stream van zoekstrings (bijv. vanuit een inputveld).
   * @param alternativeSuggestionsFirst - Bepaalt of extra suggesties bovenaan de lijst komen.
   * @returns Een Observable met de zoekresultaten of `null` als de term te kort is.
   */
  searchOnTermChange(
    terms: Observable<string>,
    alternativeSuggestionsFirst = false
  ): Observable<PdokLocationApiSearchResponse | null> {
    return terms.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      switchMap((term) =>
        term.length >= this.minQueryLength
          ? this.search(term, alternativeSuggestionsFirst)
          : of(null)
      )
    );
  }

  /**
   * Voert een zoekopdracht uit bij zowel PDOK als de aanvullende suggestiebron.
   *
   * Resultaten van beide bronnen worden samengevoegd in één response object.
   * De PDOK aanroep wordt bij falen maximaal 3 keer herhaald.
   *
   * @param term - De zoekterm.
   * @param alternativeSuggestionsFirst - Bepaalt de volgorde van samenvoegen.
   * @returns Een Observable met de gecombineerde {@link PdokLocationApiSearchResponse}.
   */
  search(
    term: string,
    alternativeSuggestionsFirst = false
  ): Observable<PdokLocationApiSearchResponse> {
    return forkJoin([
      this.additionalSuggestionSourceService.search(term),
      this.httpClient
        .get<PdokLocationApiSearchResponse>(
          `${this.baseUrl}search?q=${term}&${this.usedCollections.map((item) => `${item.id}[version]=${item.version ?? 1}&${item.id}[relevance]=${item.relevance ?? 1}`).join("&")}&limit=${this.numberOfSuggestions}&crs=http://www.opengis.net/def/crs/EPSG/0/28992`
        )
        .pipe(
          retry({
            count: 3,
            delay: () => timer(500)
          })
        )
    ]).pipe(
      map(([altSuggestions, pdokResponse]) => {
        const additionalSuggestions = altSuggestions.map(
          (additionalSuggestion: AdditionalSuggestion) =>
            ({
              id: additionalSuggestion.id,
              type: additionalSuggestion.type,
              properties: {
                display_name: additionalSuggestion.display_name,
                highlight: additionalSuggestion.display_name,
                collection_id: additionalSuggestion.collection
              }
            }) as PdokLocationApiSearchFeature
        );

        if (!pdokResponse.features) {
          pdokResponse.features = [];
        }

        pdokResponse.numberReturned += additionalSuggestions.length;
        if (alternativeSuggestionsFirst) {
          pdokResponse.features.unshift(...additionalSuggestions);
        } else {
          pdokResponse.features.push(...additionalSuggestions);
        }
        return pdokResponse;
      })
    );
  }

  /**
   * Haalt de volledige geometrie en details op van een specifiek zoekresultaat.
   *
   * @param pdokLocationApiSearchFeature - Het feature object uit de zoekresultaten.
   * @returns Een Observable met de detailgegevens of `null` als er geen referentie-URL aanwezig is.
   */
  item(
    pdokLocationApiSearchFeature: PdokLocationApiSearchFeature
  ): Observable<PdokLocationApiCollectionFeature | null> {
    if (pdokLocationApiSearchFeature?.properties?.href) {
      return this.httpClient
        .get<PdokLocationApiCollectionFeature>(
          pdokLocationApiSearchFeature.properties.href
        )
        .pipe(
          retry({
            count: 3,
            delay: () => timer(500)
          })
        );
    }
    return of(null);
  }
}
