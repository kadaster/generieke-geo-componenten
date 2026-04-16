import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewEncapsulation
} from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SearchComponentElementIds } from "../model/search-component-element-ids.model";
import {
  SearchComponentEvent,
  SearchComponentEventTypes
} from "../model/search-component-event.model";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";

import {
  CdkListbox,
  CdkOption,
  ListboxValueChangeEvent
} from "@angular/cdk/listbox";
import { NgClass } from "@angular/common";
import { SearchCurrentLocationType } from "../model/search-current-location.model";
import { GgcSearchLocationService } from "../service/ggc-location.service";
import { first, take } from "rxjs/operators";
import {
  PdokLocationApiCollectionFeature,
  PdokLocationApiSearchFeature,
  PdokLocationApiSearchResponse
} from "../model/pdok-location-api-collection.model";
import { PdokLocationApiService } from "../service/pdok-location-api.service";
import { SearchLocationOptions } from "../model/search-location-options.model";
import { GgcSearchLocationConnectService } from "../service/connect.service";
import { FormatType } from "@kadaster/ggc-map";

const BTN_SUFFIX = "btn-form-icon";

/**
 * Component voor het zoeken naar locaties en adressen met behulp van de PDOK Location API.
 *
 * Dit component biedt een zoekveld met automatische suggesties, ondersteuning voor
 * Rijksdriehoekscoördinaten (RD) en integratie met de eigen browserlocatie.
 * Geselecteerde resultaten kunnen automatisch worden getoond en gemarkeerd op een gekoppelde kaart.
 */
@Component({
  selector: "ggc-search-location",
  templateUrl: "./ggc-search-location.component.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./ggc-search-location.component.scss"],
  imports: [NgClass, CdkListbox, CdkOption]
})
export class GgcSearchLocationComponent implements OnInit {
  /** Configuratieopties voor de zoekfunctionaliteit, zoals zoomniveaus en PDOK-collecties. */
  @Input() searchLocationOptions: SearchLocationOptions;

  /** EventEmitter die events verzendt bij zoekresultaten, fouten of statuswijzigingen. */
  @Output() events: EventEmitter<SearchComponentEvent> =
    new EventEmitter<any>();

  protected elementIds: SearchComponentElementIds;
  protected inputValue = "";
  protected clsSearchButton: string;
  protected clsClearButton: string;
  protected suggestions: Array<PdokLocationApiSearchFeature> = [];
  protected showSuggestions = false;
  protected showCurrentLocation = false;
  protected loadCurrentLocation = false;
  protected inputCurrentLocation = false;
  protected noSuggestionsFound = false;
  protected collectionIdTranslations: Map<string, string>;
  protected readonly searchCurrentLocationTypes = SearchCurrentLocationType;

  @ViewChildren(CdkOption, {})
  private readonly listOptions: QueryList<
    CdkOption<PdokLocationApiSearchFeature | AdditionalSuggestion>
  >;

  @ViewChild("input", { static: true })
  private readonly input: ElementRef<HTMLInputElement>;

  private readonly pdokLocationApiService = inject(PdokLocationApiService);
  private readonly searchLocationService = inject(GgcSearchLocationService);
  private readonly connectService = inject(GgcSearchLocationConnectService);
  private readonly elRef = inject(ElementRef);
  private _searchTerm: string;
  private _classSearchButton = "fas fa-search";
  private _classClearButton = "fas fa-times";
  private hasInitialSearchterm = false;
  private result?: PdokLocationApiSearchFeature | SearchComponentEventTypes;
  private readonly searchTerm$ = new BehaviorSubject<string>("");

  /** De CSS-klasse voor de 'verwijder' knop in het zoekveld. */
  get classClearButton(): string {
    return this._classClearButton;
  }

  @Input()
  set classClearButton(value: string) {
    this._classClearButton = value;
    this.clsClearButton = value + " " + BTN_SUFFIX;
  }

  /** De huidige zoekterm in het inputveld. */
  get searchTerm(): string {
    return this._searchTerm;
  }

  @Input()
  set searchTerm(value: string) {
    this._searchTerm = this.inputValue = value.trim();
  }

  /** De CSS-klasse voor de zoek-icoon/knop. */
  get classSearchButton(): string {
    return this._classSearchButton;
  }

  @Input()
  set classSearchButton(value: string) {
    this._classSearchButton = value;
    this.clsSearchButton = value + " " + BTN_SUFFIX;
  }

  constructor() {
    this.clsSearchButton = `${this._classSearchButton} ${BTN_SUFFIX}`;
    this.clsClearButton = `${this._classClearButton} ${BTN_SUFFIX}`;
  }

  /**
   * Initialiseert de component, configureert de PDOK-service en start de zoekterm-subscriber.
   */
  ngOnInit() {
    if (this.searchLocationOptions?.minQueryLength > 0) {
      this.pdokLocationApiService.setMinQueryLength(
        this.searchLocationOptions.minQueryLength
      );
    }

    if (this.searchLocationOptions?.numberOfSuggestions > 0) {
      this.pdokLocationApiService.setNumberOfSuggestions(
        this.searchLocationOptions.numberOfSuggestions
      );
    }

    if (this.searchLocationOptions?.elementIds) {
      this.elementIds = this.searchLocationOptions.elementIds;
    } else {
      this.elementIds = new SearchComponentElementIds({});
    }

    // Subscribe to searchSuggestionService.search
    this.pdokLocationApiService
      .searchOnTermChange(
        this.searchTerm$
        //this.searchLocationOptions?.alternativeSuggestionsFirst  todo TMS-10796
      )
      .subscribe({
        next: (results: PdokLocationApiSearchResponse | null) => {
          this.processSuggestionsResult(results);
        },
        error: (error: any) => {
          this.processError(
            error,
            SearchComponentEventTypes.SEARCH_SUGGESTION_ERROR
          );
        }
      });

    if (this.searchLocationOptions?.initialResult) {
      this.searchLocationOptions.initialResult.subscribe(
        (value: PdokLocationApiSearchFeature) => {
          if (value.properties.display_name) {
            this.inputValue = value.properties.display_name;
            this.result = value;
          }
        }
      );
    }

    if (this.searchLocationOptions?.initialSearchTerm) {
      const trimmed = this.searchLocationOptions.initialSearchTerm.trim();
      if (trimmed) {
        this.hasInitialSearchterm = true;
        this.inputValue = trimmed;
        this.searchTerm$.next(trimmed);
      }
    }

    if (
      this.searchTerm &&
      (this.searchLocationOptions?.triggerSearch === undefined ||
        this.searchLocationOptions.triggerSearch)
    ) {
      this.hasInitialSearchterm = true;
      this.searchTerm$.next(this._searchTerm);
    }

    if (this.searchLocationOptions?.hideCollectionId !== true) {
      this.collectionIdTranslations = new Map<string, string>([]);
      if (this.searchLocationOptions?.collectionIdTranslations) {
        this.collectionIdTranslations = new Map([
          ...this.collectionIdTranslations,
          ...this.searchLocationOptions.collectionIdTranslations
        ]);
      }
    }

    this.clsSearchButton = this._classSearchButton + " " + BTN_SUFFIX;
    this.clsClearButton = this._classClearButton + " " + BTN_SUFFIX;
  }

  /**
   * Maakt het zoekveld leeg en verwijdert eventuele highlights van de kaart.
   */
  async clearSearchTerm() {
    this.inputValue = "";
    this.inputCurrentLocation = false;
    this.searchTerm$.next(this.inputValue);
    this.resetSuggestionsAndResult();
    if (this.searchLocationOptions?.markResult) {
      await this.connectService.loadMapService();
      const mapService = this.connectService.getMapService();
      if (mapService) {
        mapService.clearHighlightLayer(this.searchLocationOptions?.mapIndex);
      }
    }
  }

  /**
   * Handelt toetsenbord-events in het inputveld af, zoals navigatie naar suggesties of wissen (Esc).
   * @param $event De KeyboardEvent vanuit het inputveld.
   */
  onInputUp($event: KeyboardEvent): void {
    switch ($event.key) {
      case "Esc":
      case "Escape":
        this.input.nativeElement.value = "";
        this.clearSearchTerm();
        break;
      case "ArrowDown":
        // Go from the text box to the top list option
        if (
          this.suggestions.length > 0 ||
          (this.showCurrentLocation &&
            this.searchLocationOptions?.searchCurrentLocation?.type ===
              SearchCurrentLocationType.SELECT)
        ) {
          if (this.listOptions && this.listOptions.get(0)) {
            this.setFocusOnTopSuggestion();
          }
        }
        break;
      default:
        this.searchForSuggestions(($event.target as HTMLInputElement).value);
    }
  }

  /**
   * Handelt navigatie binnen de lijst met suggesties af.
   * @param $event De KeyboardEvent vanuit de suggestielijst.
   */
  onListKeydown($event: KeyboardEvent): void {
    switch ($event.key) {
      case "ArrowUp":
        // Go from the top list option to the text box
        // If the last element has the focus, the focus went from the top to the bottom, therefore the text box should get focus
        if (this.listOptions && this.listOptions.last!.isActive()) {
          this.setFocusOnInputTextbox();
        }
        break;
      case "ArrowDown":
      case "Home":
      case "End":
        // Prevent scrolling
        $event.preventDefault();
        break;
    }
  }

  /**
   * Handelt selecties en interacties binnen de suggestielijst af via het toetsenbord.
   */
  onListKeyup($event: KeyboardEvent): void {
    if (
      $event.isComposing ||
      $event.altKey ||
      $event.ctrlKey ||
      $event.metaKey
    ) {
      return;
    }
    let preventDefault = true;
    switch ($event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "End":
      case "Home":
      case "Enter":
        break;
      case "Esc":
      case "Escape":
        this.resetSuggestionsAndResult();
        this.setFocusOnInputTextbox();
        break;
      default:
        if ($event.key.length === 1) {
          // Single character
          this.input.nativeElement.value += $event.key;
          this.setFocusOnInputTextbox();
          this.searchForSuggestions(this.input.nativeElement.value);
        }
        preventDefault = false;
    }

    if (preventDefault) {
      $event.preventDefault();
      this.scrollIntoViewIfNeeded(this.input.nativeElement);
    }
  }

  private setFocusOnTopSuggestion() {
    this.listOptions.get(0)!.focus();
  }

  private setFocusOnInputTextbox() {
    this.input.nativeElement.focus();
  }

  /**
   * Verwerkt de resultaten die terugkomen van de PDOK Location API.
   * @param response De API-response met gevonden features.
   */
  processSuggestionsResult(
    response: PdokLocationApiSearchResponse | null
  ): void {
    this.resetSuggestionsAndResult(false);
    if (response && response.numberReturned > -1) {
      this.showSuggestions = true;
      this.onInputFocus();
      this.suggestions = response.features;
      if (response.numberReturned > 0) {
        this.noSuggestionsFound = false;
        this.checkAndSearchInitialSearchterm();
      } else {
        this.noSuggestionsFound = true;
      }
      if (this.hasInitialSearchterm) {
        this.hasInitialSearchterm = false;
      }
    }
  }

  /**
   * Reset de huidige locatie-weergave en verwijdert het huidige resultaat.
   * @param resetLocation Of ook de huidige locatie-weergave gereset moet worden.
   */
  resetSuggestionsAndResult(resetLocation = true) {
    if (this.result) {
      this.events.emit(
        new SearchComponentEvent(
          SearchComponentEventTypes.RESULT_INVALIDATED,
          "Het vorige zoekresultaat is niet meer geldig"
        )
      );
    }
    this.suggestions = [];
    this.noSuggestionsFound = false;
    this.result = undefined;
    this.showSuggestions = false;
    if (resetLocation) {
      this.showCurrentLocation = false;
    }
  }

  /**
   * Trigget een nieuwe zoekopdracht voor suggesties.
   * @param value De zoekterm.
   */
  searchForSuggestions(value: string) {
    this.searchTerm$.next(value);
    this.inputValue = value;
  }

  /**
   * Voert de definitieve zoekopdracht uit wanneer op Enter wordt gedrukt.
   */
  searchOnEnter() {
    if (this.inputCurrentLocation) {
      this.processCurrentLocation();
    } else if (this.result) {
      this.events.emit(
        new SearchComponentEvent(
          SearchComponentEventTypes.SEARCH_RESULT,
          "Er is een nieuw zoekresultaat",
          this.result
        )
      );
    } else if (this.suggestions.length > 0) {
      this.processPdokLocationApiSearchFeatureResult(this.suggestions[0]);
    } else {
      this.events.emit(
        new SearchComponentEvent(
          SearchComponentEventTypes.NO_SUGGESTIONS,
          "Er is geen zoeksuggestie gevonden"
        )
      );
    }
  }

  private checkAndSearchInitialSearchterm() {
    if (this.hasInitialSearchterm && this.suggestions.length === 1) {
      this.processPdokLocationApiSearchFeatureResult(this.suggestions[0]);
    }
  }

  /**
   * Verwerkt de selectie van een specifiek zoekresultaat.
   * @param feature Het geselecteerde PDOK-object.
   */
  private async processPdokLocationApiSearchFeatureResult(
    feature: PdokLocationApiSearchFeature
  ): Promise<void> {
    this.inputValue = feature.properties.display_name;
    this.inputCurrentLocation = false;
    this.result = { ...feature };
    this.events.emit(
      new SearchComponentEvent(
        SearchComponentEventTypes.SEARCH_RESULT,
        "Er is een nieuw zoekresultaat",
        this.result
      )
    );
    this.showSuggestions = false;
    this.showCurrentLocation = false;
    this.processZoomToResult(feature);
    this.processMarkResult(feature);
  }

  /**
   * Zoomt de kaart naar de locatie van het geselecteerde resultaat.
   * @param feature De coördinaten of het feature-object waarnaar gezoomd moet worden.
   */
  private async processZoomToResult(
    feature: PdokLocationApiSearchFeature | number[]
  ): Promise<void> {
    if (this.searchLocationOptions?.zoomToResult) {
      await this.connectService.loadMapService();
      const mapService = this.connectService.getMapService();
      if (mapService) {
        if (Array.isArray(feature)) {
          mapService.zoomToGeometryWithZoomOptions(
            JSON.stringify({ type: "Point", coordinates: feature }),
            {
              mapIndex: this.searchLocationOptions?.mapIndex,
              fitOptions: { padding: [50, 50, 50, 50] }
            },
            FormatType.GEOJSON
          );
        } else if (feature.bbox) {
          mapService.zoomToExtent(feature.bbox, {
            mapIndex: this.searchLocationOptions?.mapIndex,
            fitOptions: { padding: [50, 50, 50, 50] }
          });
        } else if (feature.geometry) {
          mapService.zoomToGeometryWithZoomOptions(
            JSON.stringify(feature.geometry),
            {
              mapIndex: this.searchLocationOptions?.mapIndex,
              fitOptions: { padding: [50, 50, 50, 50] }
            },
            FormatType.GEOJSON
          );
        }
      }
    }
  }

  /**
   * Plaatst een marker op de kaart voor het geselecteerde resultaat.
   * @param feature Het object dat gemarkeerd moet worden.
   */
  private async processMarkResult(
    feature: PdokLocationApiSearchFeature | number[]
  ): Promise<void> {
    if (this.searchLocationOptions?.markResult) {
      await this.connectService.loadMapService();
      const mapService = this.connectService.getMapService();
      if (mapService) {
        if (Array.isArray(feature)) {
          mapService.markFeature(
            JSON.stringify({ type: "Point", coordinates: feature }),
            this.searchLocationOptions?.mapIndex,
            FormatType.GEOJSON
          );
        } else if (feature?.properties?.href) {
          this.pdokLocationApiService
            .item(feature)
            .pipe(take(1))
            .subscribe((item: PdokLocationApiCollectionFeature | null) => {
              if (item?.geometry) {
                mapService.markFeature(
                  JSON.stringify(item.geometry),
                  this.searchLocationOptions?.mapIndex,
                  FormatType.GEOJSON
                );
              }
            });
        }
      }
    }
  }

  /**
   * Handelt fouten vanuit de API af en verstuurt een error-event.
   */
  private processError(
    error: HttpErrorResponse,
    type: SearchComponentEventTypes
  ) {
    let errorMessage: string;
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.message ? error.message : error.toString();
    } else {
      errorMessage = `${error.status} - ${error.statusText || ""} - ${
        error.message
      }`;
    }
    this.events.emit(
      new SearchComponentEvent(
        type,
        "Er is een fout opgetreden bij het benaderen van de locatieserver: " +
          errorMessage +
          ". Herlaad de pagina om het opnieuw te proberen.",
        error
      )
    );
  }

  private scrollIntoViewIfNeeded(target: HTMLElement) {
    if (target.getBoundingClientRect().bottom > window.innerHeight) {
      target.scrollIntoView(false);
    }

    if (target.getBoundingClientRect().top < 0) {
      target.scrollIntoView();
    }
  }

  /**
   * Reageert op selectie-events vanuit de CDK Listbox.
   */
  handleCdkListboxEvent(
    $event: ListboxValueChangeEvent<PdokLocationApiSearchFeature>
  ) {
    if ($event.value[0].id === "current-location") {
      this.processCurrentLocation();
    } else {
      this.processPdokLocationApiSearchFeatureResult($event.value[0]);
    }
  }

  /**
   * Toont suggesties zodra het inputveld de focus krijgt.
   */
  onInputFocus() {
    this.showSuggestions = true;
    if (this.searchLocationOptions?.searchCurrentLocation) {
      this.showCurrentLocation = true;
    }
  }

  /**
   * Sluit de suggestielijst wanneer buiten de component wordt geklikt.
   */
  @HostListener("document:click", ["$event"])
  closeShowCurrentLocationOnPageClickEvent(event: Event) {
    if (
      !this.elRef.nativeElement.contains(event.target) &&
      (this.showSuggestions || this.showCurrentLocation)
    ) {
      this.showSuggestions = false;
      this.showCurrentLocation = false;
    }
  }

  /**
   * Start het proces om de huidige geografische locatie van de gebruiker te bepalen.
   */
  processCurrentLocation(): void {
    this.showCurrentLocation = false;
    this.showSuggestions = false;
    this.noSuggestionsFound = false;
    this.result = SearchComponentEventTypes.SEARCH_LOCATION_RESULT;
    this.searchLocationService
      .getLocationEventsObservable()
      .pipe(first())
      .subscribe((event: number[]) => {
        this.inputValue = "Uw locatie";
        this.inputCurrentLocation = true;
        this.loadCurrentLocation = false;
        this.showCurrentLocation = false;
        this.events.emit(
          new SearchComponentEvent(
            SearchComponentEventTypes.SEARCH_LOCATION_RESULT,
            "Er is een nieuw locatie zoekresultaat",
            event
          )
        );
        this.processZoomToResult(event);
        this.processMarkResult(event);
      });
    this.searchLocationService
      .getGeolocationPositionErrorSubject()
      .pipe(first())
      .subscribe((error: GeolocationPositionError) => {
        this.events.emit(
          new SearchComponentEvent(
            SearchComponentEventTypes.SEARCH_LOCATION_RESULT_ERROR,
            "Er is iets fout gegaan bij het ophalen van de locatie",
            error
          )
        );
      });

    this.loadCurrentLocation = true;
    this.searchLocationService.getLocation(false);
  }
}
