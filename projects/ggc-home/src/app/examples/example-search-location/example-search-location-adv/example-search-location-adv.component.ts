import { Component, computed, inject, OnInit, signal } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import {
  GgcSearchLocationComponent,
  PdokLocationApiService,
  SearchCollection,
  SearchComponentEvent,
  SearchCurrentLocationType,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Tags } from "../../tags.enum";
import { take } from "rxjs/operators";

@Component({
  selector: "ggc-home-example-search-location-adv",
  imports: [
    FormsModule,
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    GgcSearchLocationComponent,
    ExampleFormatComponent,
    ReactiveFormsModule
  ],
  templateUrl: "./example-search-location-adv.component.html"
})
export class ExampleSearchLocationAdvComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/search-location-adv",
    title: "Locatie zoeken (uitgebreid)",
    introduction:
      "Zoek een adres, woonplaats of huidige locatie met de PDOK Locatie API.",
    components: [Components.GGC_SEARCH_LOCATION],
    theme: [],
    tags: [Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location/example-search-location-only-location.png"
  };
  urlComponentModule =
    "example-search-location/example-search-location-adv/example-search-location-adv.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-search-location_src_public-api.GgcSearchLocationComponent.html`;
  // DOCS-SKIP:END

  readonly searchLocationOptions = computed<SearchLocationOptions>(() => {
    const placeFirst = this.collectionRanking() === "place";
    const relevanceByCollection = new Map<string, number>([
      ["adres", 0.1],
      ["gemeentegebied", 0.75],
      ["provinciegebied", placeFirst ? 0.5 : 1],
      ["woonplaats", placeFirst ? 1 : 0.5]
    ]);

    return {
      alternativeSuggestionsFirst: true,
      collectionIdTranslations: new Map<string, string>([
        ["functioneel_gebied", "andere tekst voor functioneel gebied"]
      ]),
      searchCurrentLocation: {
        type: SearchCurrentLocationType.SELECT,
        icon: "fas fa-map-marker-alt",
        loadIcon: "fa-spin fas fa-spinner",
        label: "Gebruik mijn locatie"
      },
      hideCollectionId: !this.showCollectionType(),
      numberOfSuggestions: this.numberOfSuggestions(),
      customCollections: this.availableCollections().map((collection) => ({
        ...collection,
        relevance: relevanceByCollection.get(collection.id) ?? 0.5
      })),
      zoomToResult: this.zoomToResult(),
      markResult: this.markResult()
    };
  });

  protected readonly numberOfSuggestions = signal(10);
  protected readonly showCollectionType = signal(true);
  protected readonly collectionRanking = signal<"province" | "place">(
    "province"
  );
  protected zoomToResult = signal(true);
  protected markResult = signal(true);

  private readonly availableCollections = signal<SearchCollection[]>([]);
  private readonly pdokLocationApiService = inject(PdokLocationApiService);

  constructor() {
    super();
  }

  ngOnInit() {
    this.pdokLocationApiService.collectionsLoaded$
      .pipe(take(1))
      .subscribe((collectionsResult) => {
        this.availableCollections.set(
          collectionsResult.collections
            .filter((collection) =>
              [
                "adres",
                "gemeentegebied",
                "provinciegebied",
                "woonplaats"
              ].includes(collection.id)
            )
            .map((collection) => ({
              id: collection.id,
              version: collection.version,
              relevance: 0.5
            }))
        );
      });
  }

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
