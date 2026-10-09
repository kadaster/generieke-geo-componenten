import { HttpErrorResponse } from "@angular/common/http";
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  Signal,
  SimpleChanges,
  viewChild,
  viewChildren,
  ViewEncapsulation
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject } from "rxjs";
import { SearchComponentElementIds } from "../model/search-component-element-ids.model";
import {
  SearchComponentEvent,
  SearchComponentEventTypes
} from "../model/search-component-event.model";
import { AdditionalSuggestion } from "../model/additional-suggestion.model";
import * as proj4x from "proj4";

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
import { ViewerType } from "@kadaster/ggc-models";

const BTN_SUFFIX = "btn-form-icon";
const proj4 = (proj4x as any).default;

/**
 * Component voor het zoeken naar locaties en adressen met behulp van de PDOK Location API.
 *
 * Dit component biedt een zoekveld met automatische suggesties, ondersteuning voor
 * Rijksdriehoekscoördinaten (RD) en integratie met de eigen browserlocatie.
 * Geselecteerde resultaten kunnen automatisch worden getoond en gemarkeerd op een gekoppelde kaart.
 *
 * @remarks
 * Het component ondersteunt twee modi:
 * 1. **Zoeken met huidige locatie**: de zoekbalk met optioneel een huidige-locatie knop/optie.
 * 2. **Alleen huidige locatie**: de huidige-locatie knop zonder zoekbalk (met `hideSearch = true`).
 */
@Component({
  selector: "ggc-search-location",
  templateUrl: "./ggc-search-location.component.html",
  host: {
    "(document:click)": "closeShowCurrentLocationOnPageClickEvent($event)"
  },
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./ggc-search-location.component.scss"],
  imports: [NgClass, CdkListbox, CdkOption]
})
export class GgcSearchLocationComponent implements OnChanges, OnInit {
  /** Configuratieopties voor de zoekfunctionaliteit, zoals zoomniveaus en PDOK-collecties. */
  searchLocationOptions = input<SearchLocationOptions>();
  classClearButton = input("fas fa-times");
  searchTerm = input("");
  classSearchButton = input("fas fa-search");

  /** Output die events verzendt bij zoekresultaten, fouten of statuswijzigingen. */
  readonly events = output<SearchComponentEvent>();

  protected elementIds = signal(new SearchComponentElementIds({}));
  protected inputValue = signal("");
  protected readonly clsSearchButton = computed(
    () => `${this.classSearchButton()} ${BTN_SUFFIX}`
  );
  protected readonly clsClearButton = computed(
    () => `${this.classClearButton()} ${BTN_SUFFIX}`
  );
  protected suggestions = signal<Array<PdokLocationApiSearchFeature>>([]);
  protected showSuggestions = signal(false);
  protected showCurrentLocation = signal(false);
  protected loadCurrentLocation = signal(false);
  protected inputCurrentLocation = signal(false);
  protected noSuggestionsFound = signal(false);
  protected collectionIdTranslations = signal(new Map<string, string>());
  protected readonly searchCurrentLocationTypes = SearchCurrentLocationType;

  protected readonly hasSearch: Signal<boolean> = computed(
    () => !this.searchLocationOptions()?.hideSearch
  );
  protected readonly hasLocation: Signal<boolean> = computed(
    () => this.searchLocationOptions()?.searchCurrentLocation !== undefined
  );
  protected readonly suggestionsLength: Signal<number> = computed(
    () => this.suggestions().length
  );
  protected readonly hasFocusableSuggestions: Signal<boolean> = computed(() => {
    return (
      this.showSuggestions() &&
      (this.suggestionsLength() > 0 ||
        (this.showCurrentLocation() &&
          this.searchLocationOptions()?.searchCurrentLocation?.type ===
            SearchCurrentLocationType.SELECT) ||
        this.noSuggestionsFound())
    );
  });

  private readonly listOptions =
    viewChildren<
      CdkOption<PdokLocationApiSearchFeature | AdditionalSuggestion>
    >(CdkOption);

  private readonly input = viewChild<ElementRef<HTMLInputElement>>("input");

  private readonly pdokLocationApiService = inject(PdokLocationApiService);
  private readonly searchLocationService = inject(GgcSearchLocationService);
  private readonly connectService = inject(GgcSearchLocationConnectService);
  private readonly elRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private hasInitialSearchterm = false;
  private result?: PdokLocationApiSearchFeature | SearchComponentEventTypes;
  private readonly searchTerm$ = new BehaviorSubject<string>("");
  private formatTypeCache: any;
  private readonly viewerType: Signal<ViewerType> = computed(
    () => this.searchLocationOptions()?.viewerType ?? ViewerType.TWEE_D
  );

  /**
   * Past de PDOK-serviceconfiguratie aan wanneer searchLocationOptions verandert.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["searchTerm"]) {
      this.inputValue.set(this.searchTerm().trim());
    }
    if (!changes["searchLocationOptions"]) {
      return;
    }

    const searchLocationOptions = this.searchLocationOptions();
    if (
      searchLocationOptions?.minQueryLength !== undefined &&
      searchLocationOptions.minQueryLength > 0
    ) {
      this.pdokLocationApiService.setMinQueryLength(
        searchLocationOptions.minQueryLength
      );
    }

    if (
      searchLocationOptions?.numberOfSuggestions !== undefined &&
      searchLocationOptions.numberOfSuggestions > 0
    ) {
      this.pdokLocationApiService.setNumberOfSuggestions(
        searchLocationOptions.numberOfSuggestions
      );
    }

    if (searchLocationOptions?.customCollections) {
      this.pdokLocationApiService.setCustomCollections(
        searchLocationOptions.customCollections
      );
    }
  }

  /**
   * Initialiseert de component en start de zoekterm-subscriber.
   */
  ngOnInit() {
    if (this.searchLocationOptions()?.elementIds) {
      this.elementIds.set(this.searchLocationOptions()!.elementIds!);
    } else {
      this.elementIds.set(new SearchComponentElementIds({}));
    }

    // Subscribe to searchSuggestionService.search
    this.pdokLocationApiService
      .searchOnTermChange(
        this.searchTerm$,
        this.searchLocationOptions()?.alternativeSuggestionsFirst
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
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

    const initialResult = this.searchLocationOptions()?.initialResult;
    if (initialResult) {
      initialResult
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value: PdokLocationApiSearchFeature) => {
          if (value.properties.display_name) {
            this.inputValue.set(value.properties.display_name);
            this.result = value;
          }
        });
    }

    if (this.searchLocationOptions()?.initialSearchTerm) {
      const trimmed = this.searchLocationOptions()!.initialSearchTerm!.trim();
      if (trimmed) {
        this.hasInitialSearchterm = true;
        this.inputValue.set(trimmed);
        this.searchTerm$.next(trimmed);
      }
    }

    if (
      this.searchTerm() &&
      (this.searchLocationOptions()?.triggerSearch === undefined ||
        this.searchLocationOptions()?.triggerSearch)
    ) {
      this.hasInitialSearchterm = true;
      this.searchTerm$.next(this.inputValue());
    }

    const collectionIdTranslations = new Map<string, string>();
    if (this.searchLocationOptions()?.hideCollectionId !== true) {
      if (this.searchLocationOptions()?.collectionIdTranslations) {
        this.searchLocationOptions()!.collectionIdTranslations!.forEach(
          (translation, collectionId) =>
            collectionIdTranslations.set(collectionId, translation)
        );
      }
    }
    this.collectionIdTranslations.set(collectionIdTranslations);
  }

  /**
   * Maakt het zoekveld leeg en verwijdert eventuele highlights van de kaart.
   */
  async clearSearchTerm() {
    this.inputValue.set("");
    this.inputCurrentLocation.set(false);
    this.searchTerm$.next(this.inputValue());
    this.resetSuggestionsAndResult();
    if (this.searchLocationOptions()?.markResult) {
      if (this.viewerType() === ViewerType.TWEE_D) {
        (
          (await this.connectService.getMapService()) as any
        )?.clearHighlightLayer(this.searchLocationOptions()?.mapIndex);
      } else {
        (
          (await this.connectService.getGgcLocationService()) as any
        )?.removeLocationMark();
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
      case "Escape": {
        const inputElement = this.input()?.nativeElement;
        if (inputElement) {
          inputElement.value = "";
        }
        this.clearSearchTerm();
        break;
      }
      case "ArrowDown":
        // Go from the text box to the top list option
        if (
          this.suggestions().length > 0 ||
          (this.showCurrentLocation() &&
            this.searchLocationOptions()?.searchCurrentLocation?.type ===
              SearchCurrentLocationType.SELECT)
        ) {
          if (this.listOptions().length > 0) {
            this.setFocusOnTopSuggestion();
          }
        }
        break;
      default:
        this.searchForSuggestions(($event.target as HTMLInputElement).value);
    }
  }

  /**
   * Handelt paste-events in het inputveld af.
   * @param $event De ClipboardEvent vanuit het inputveld.
   */
  onPaste($event: ClipboardEvent) {
    const text = $event.clipboardData?.getData("text");
    if (text) {
      setTimeout(() => {
        this.searchForSuggestions(text);
      }, 100);
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
        if (this.listOptions().at(-1)?.isActive()) {
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
    const inputElement = this.input()?.nativeElement;
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
        if ($event.key.length === 1 && inputElement) {
          // Single character
          inputElement.value += $event.key;
          this.setFocusOnInputTextbox();
          this.searchForSuggestions(inputElement.value);
        }
        preventDefault = false;
    }

    if (preventDefault) {
      $event.preventDefault();
      if (inputElement) {
        this.scrollIntoViewIfNeeded(inputElement);
      }
    }
  }

  private setFocusOnTopSuggestion() {
    this.listOptions().at(0)?.focus();
  }

  private setFocusOnInputTextbox() {
    this.input()?.nativeElement.focus();
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
      this.showSuggestions.set(true);
      this.onInputFocus();
      if (this.searchLocationOptions()?.numberOfSuggestions === undefined) {
        this.suggestions.set(response.features);
      } else {
        this.suggestions.set(
          response.features.slice(
            0,
            this.searchLocationOptions()!.numberOfSuggestions!
          )
        );
      }
      if (response.numberReturned > 0) {
        this.noSuggestionsFound.set(false);
        this.checkAndSearchInitialSearchterm();
      } else {
        this.noSuggestionsFound.set(true);
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
    this.suggestions.set([]);
    this.noSuggestionsFound.set(false);
    this.result = undefined;
    this.showSuggestions.set(false);
    if (resetLocation) {
      this.showCurrentLocation.set(false);
    }
  }

  /**
   * Trigget een nieuwe zoekopdracht voor suggesties.
   * @param value De zoekterm.
   */
  searchForSuggestions(value: string) {
    this.searchTerm$.next(value);
    this.inputValue.set(value);
  }

  /**
   * Voert de definitieve zoekopdracht uit wanneer op Enter wordt gedrukt.
   */
  searchOnEnter() {
    if (this.inputCurrentLocation()) {
      this.processCurrentLocation();
    } else if (this.result) {
      this.events.emit(
        new SearchComponentEvent(
          SearchComponentEventTypes.SEARCH_RESULT,
          "Er is een nieuw zoekresultaat",
          this.result
        )
      );
    } else if (this.suggestionsLength() > 0) {
      this.processPdokLocationApiSearchFeatureResult(this.suggestions()[0]);
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
    if (this.hasInitialSearchterm && this.suggestionsLength() === 1) {
      this.processPdokLocationApiSearchFeatureResult(this.suggestions()[0]);
    }
  }

  /**
   * Verwerkt de selectie van een specifiek zoekresultaat.
   * @param feature Het geselecteerde PDOK-object.
   */
  private async processPdokLocationApiSearchFeatureResult(
    feature: PdokLocationApiSearchFeature
  ): Promise<void> {
    this.inputValue.set(feature.properties.display_name);
    this.inputCurrentLocation.set(false);
    this.result = { ...feature };
    this.events.emit(
      new SearchComponentEvent(
        SearchComponentEventTypes.SEARCH_RESULT,
        "Er is een nieuw zoekresultaat",
        this.result
      )
    );
    this.showSuggestions.set(false);
    this.showCurrentLocation.set(false);
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
    if (this.searchLocationOptions()?.zoomToResult) {
      switch (this.viewerType()) {
        case ViewerType.TWEE_D: {
          const mapService = (await this.connectService.getMapService()) as any;
          if (mapService) {
            const formatType = await this.loadFormatType();
            if (Array.isArray(feature)) {
              mapService.zoomToGeometryWithZoomOptions(
                JSON.stringify({ type: "Point", coordinates: feature }),
                {
                  mapIndex: this.searchLocationOptions()?.mapIndex,
                  fitOptions: { padding: [50, 50, 50, 50] }
                },
                formatType.GEOJSON
              );
            } else if (feature.bbox) {
              mapService.zoomToExtent(feature.bbox, {
                mapIndex: this.searchLocationOptions()?.mapIndex,
                fitOptions: { padding: [50, 50, 50, 50] }
              });
            } else if (feature.geometry) {
              mapService.zoomToGeometryWithZoomOptions(
                JSON.stringify(feature.geometry),
                {
                  mapIndex: this.searchLocationOptions()?.mapIndex,
                  fitOptions: { padding: [50, 50, 50, 50] }
                },
                formatType.GEOJSON
              );
            }
          }
          break;
        }
        case ViewerType.DRIE_D: {
          const cesiumLocationService =
            (await this.connectService.getGgcLocationService()) as any;
          if (cesiumLocationService) {
            if (Array.isArray(feature)) {
              const coordinates = proj4("EPSG:28992", "EPSG:4326", feature);
              cesiumLocationService.zoomToCurrentLocation({
                longitude: coordinates[0],
                latitude: coordinates[1]
              } as GeolocationCoordinates);
            } else if (feature.bbox) {
              cesiumLocationService.zoomToBBox(
                this.transformBoundingBox(feature.bbox)
              );
            } else if (feature.geometry) {
              const coordinates = proj4(
                "EPSG:28992",
                "EPSG:4326",
                (feature.geometry as any).coordinates
              );
              cesiumLocationService.zoomToCurrentLocation({
                longitude: coordinates[0],
                latitude: coordinates[1]
              } as GeolocationCoordinates);
            }
          }
          break;
        }
      }
    }
  }

  private transformBoundingBox(bbox: number[]) {
    const [minX, minY, maxX, maxY] = bbox;

    const southwest = proj4("EPSG:28992", "EPSG:4326", [minX, minY]);
    const northeast = proj4("EPSG:28992", "EPSG:4326", [maxX, maxY]);

    return [southwest[0], southwest[1], northeast[0], northeast[1]];
  }

  /**
   * Plaatst een marker op de kaart voor het geselecteerde resultaat.
   * @param feature Het object dat gemarkeerd moet worden.
   */
  private async processMarkResult(
    feature: PdokLocationApiSearchFeature | number[]
  ): Promise<void> {
    if (this.searchLocationOptions()?.markResult) {
      switch (this.viewerType()) {
        case ViewerType.TWEE_D:
          {
            const mapService =
              (await this.connectService.getMapService()) as any;
            if (mapService) {
              const formatType = await this.loadFormatType();
              if (Array.isArray(feature)) {
                mapService.markFeature(
                  JSON.stringify({ type: "Point", coordinates: feature }),
                  this.searchLocationOptions()?.mapIndex,
                  formatType.GEOJSON
                );
              } else if (feature?.properties?.href) {
                this.pdokLocationApiService
                  .item(feature)
                  .pipe(take(1), takeUntilDestroyed(this.destroyRef))
                  .subscribe(
                    (item: PdokLocationApiCollectionFeature | null) => {
                      if (item?.geometry) {
                        mapService.markFeature(
                          JSON.stringify(item.geometry),
                          this.searchLocationOptions()?.mapIndex,
                          formatType.GEOJSON
                        );
                      }
                    }
                  );
              }
            }
          }
          break;
        case ViewerType.DRIE_D: {
          const cesiumLocationService =
            (await this.connectService.getGgcLocationService()) as any;
          if (cesiumLocationService) {
            if (Array.isArray(feature)) {
              const coordinates = proj4("EPSG:28992", "EPSG:4326", feature);
              cesiumLocationService.addLocationMark({
                longitude: coordinates[0],
                latitude: coordinates[1]
              } as GeolocationCoordinates);
            } else if (feature.bbox) {
              const bbox = this.transformBoundingBox(feature.bbox);
              const middleLon = (bbox[0] + bbox[2]) / 2;
              const middleLan = (bbox[1] + bbox[3]) / 2;
              cesiumLocationService.addLocationMark({
                longitude: middleLon,
                latitude: middleLan
              } as GeolocationCoordinates);
            } else if (feature.geometry) {
              const coordinates = proj4(
                "EPSG:28992",
                "EPSG:4326",
                (feature.geometry as any).coordinates
              );
              cesiumLocationService.addLocationMark({
                longitude: coordinates[0],
                latitude: coordinates[1]
              } as GeolocationCoordinates);
            }
          }
          break;
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
  handleCdkListboxEvent($event: ListboxValueChangeEvent<unknown>) {
    const value = $event.value as readonly PdokLocationApiSearchFeature[];
    if (value[0].id === "current-location") {
      this.processCurrentLocation();
    } else {
      this.processPdokLocationApiSearchFeatureResult(value[0]);
    }
  }

  /**
   * Toont suggesties zodra het inputveld de focus krijgt.
   */
  onInputFocus() {
    this.showSuggestions.set(true);
    if (this.searchLocationOptions()?.searchCurrentLocation) {
      this.showCurrentLocation.set(true);
    }
  }

  /**
   * Sluit de suggestielijst wanneer buiten de component wordt geklikt.
   */
  closeShowCurrentLocationOnPageClickEvent(event: Event) {
    if (
      !this.elRef.nativeElement.contains(event.target) &&
      (this.showSuggestions() || this.showCurrentLocation())
    ) {
      this.showSuggestions.set(false);
      this.showCurrentLocation.set(false);
    }
  }

  /**
   * Start het proces om de huidige geografische locatie van de gebruiker te bepalen.
   */
  processCurrentLocation(): void {
    this.showCurrentLocation.set(false);
    this.showSuggestions.set(false);
    this.noSuggestionsFound.set(false);
    this.result = SearchComponentEventTypes.SEARCH_LOCATION_RESULT;
    this.searchLocationService
      .getLocationEventsObservable(this.searchLocationOptions()?.mapIndex)
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe((event: number[]) => {
        this.inputValue.set("Uw locatie");
        this.inputCurrentLocation.set(true);
        this.loadCurrentLocation.set(false);
        this.showCurrentLocation.set(false);
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
      .getGeolocationPositionErrorObservable()
      .pipe(first(), takeUntilDestroyed(this.destroyRef))
      .subscribe((error: GeolocationPositionError) => {
        this.events.emit(
          new SearchComponentEvent(
            SearchComponentEventTypes.SEARCH_LOCATION_RESULT_ERROR,
            "Er is iets fout gegaan bij het ophalen van de locatie",
            error
          )
        );
      });

    this.loadCurrentLocation.set(true);
    this.searchLocationService.getLocation(
      false,
      this.searchLocationOptions()?.mapIndex
    );
  }

  private async loadFormatType() {
    if (!this.formatTypeCache) {
      const module = await import(
        /* webpackMode: "eager" */ "@kadaster/ggc-map"
      );
      this.formatTypeCache = module.FormatType;
    }

    return this.formatTypeCache;
  }
}
