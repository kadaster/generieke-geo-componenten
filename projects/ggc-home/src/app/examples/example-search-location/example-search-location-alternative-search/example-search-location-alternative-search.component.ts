import { Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import {
  GgcAdditionalSuggestionSourceService,
  GgcSearchLocationComponent,
  PdokLocationApiService,
  SearchComponentEvent,
  SearchComponentEventTypes,
  SearchCurrentLocationType,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { AlternativeSuggestService } from "./alternative-suggest.service";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";

@Component({
  selector: "app-ggc-home-example-search-location-alternative-search",
  imports: [
    GgcMapComponent,
    GgcSearchLocationComponent,
    GgcFeatureInfoComponent
  ],
  providers: [
    PdokLocationApiService,
    {
      provide: GgcAdditionalSuggestionSourceService,
      useClass: AlternativeSuggestService
    }
  ],
  templateUrl: "./example-search-location-alternative-search.component.html"
})
export class ExampleSearchLocationAlternativeSearchComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  mapIndex = "mapIndex-alternative-search";
  readonly componentInfo: ComponentInfo = {
    route: "/search-location-alternative-search",
    title: "In eigen collectie zoeken",
    introduction: "Zoek een in een eigen collectie naast de PDOK collecties.",
    components: [Components.GGC_SEARCH_LOCATION],
    theme: [Themes.ZOEKEN],
    tags: [Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location-alternative-search/example-search-location-alternative-search.png"
  };
  urlComponentModule =
    "example-search-location/example-search-location-alternative-search/example-search-location-alternative-search.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-search-location_src_public-api.GgcSearchLocationComponent.html`;
  // DOCS-SKIP:END
  searchLocationOptions: SearchLocationOptions = {
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
    zoomToResult: true,
    markResult: true,
    mapIndex: this.mapIndex,
    numberOfSuggestions: 5,
    customCollections: [
      {
        id: "adres",
        version: 1,
        relevance: 0.1
      },
      {
        id: "gemeentegebied",
        version: 1,
        relevance: 1
      },
      {
        id: "provinciegebied",
        version: 1,
        relevance: 0.9
      },
      {
        id: "woonplaats",
        version: 1,
        relevance: 0.5
      }
    ]
  };

  protected mapConfig: Webservice[] = [];

  private readonly alternativeSuggestService = inject(
    AlternativeSuggestService
  );
  private readonly mapService = inject(GgcMapService);

  constructor() {
    super();
  }

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-search-location/example-search-location-alternative-search/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }

  async handleSearchComponentEvent(event: SearchComponentEvent) {
    if (
      event.type === SearchComponentEventTypes.SEARCH_RESULT &&
      event.value.type === "terugmelding" &&
      event.value.id !== undefined
    ) {
      const coordinate =
        this.alternativeSuggestService.getCoordinateOfTerugmelding(
          event.value.id
        );

      if (!coordinate) {
        return;
      }

      await this.mapService.zoomToCoordinate(coordinate, this.mapIndex, 12);
    }
  }
}
