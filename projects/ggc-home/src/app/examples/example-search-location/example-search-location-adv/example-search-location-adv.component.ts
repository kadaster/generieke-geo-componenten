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
  SearchCurrentLocation,
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
  selector: "app-example-search-location-adv",
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
    tags: [Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location/example-search-location-only-location.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-search-location/example-search-location-adv/example-search-location-adv.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-search-location_src_public-api.GgcSearchLocationComponent.html`;
  // DOCS-SKIP:END

  readonly searchLocationOptions = computed(() => {
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
      } as SearchCurrentLocation,
      zoomToResult: this.zoomToResult(),
      markResult: this.markResult()
    } as SearchLocationOptions;
  });

  protected zoomToResult = signal(true);
  protected markResult = signal(true);

  private readonly pdokLocationApiService = inject(PdokLocationApiService);

  constructor() {
    super();
  }

  ngOnInit() {
    this.pdokLocationApiService.collectionsLoaded$
      .pipe(take(1))
      .subscribe((collectionsResult) => {
        const kvnlCollections = new Map<string, number>([
          ["adres", 0.1],
          ["gemeentegebied", 1],
          ["provinciegebied", 1],
          ["woonplaats", 0.5]
        ]);
        this.pdokLocationApiService.setCustomCollections(
          collectionsResult.collections
            .filter((collection) =>
              Array.from(kvnlCollections.keys()).includes(collection.id)
            )
            .map(
              (collection) =>
                ({
                  id: collection.id,
                  version: collection.version,
                  relevance: kvnlCollections.get(collection.id) ?? 0.5
                }) as SearchCollection
            )
        );
      });
  }

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
