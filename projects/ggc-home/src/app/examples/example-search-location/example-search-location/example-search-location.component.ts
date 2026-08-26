import { Component } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import {
  GgcSearchLocationComponent,
  SearchComponentEvent,
  SearchCurrentLocationType,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-search-location",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    GgcSearchLocationComponent,
    ExampleFormatComponent
  ],
  templateUrl: "./example-search-location.component.html"
})
export class ExampleSearchLocationComponent extends ExampleFormatComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/search-location",
    title: "Locatie zoeken",
    introduction:
      "Zoek een adres, woonplaats of huidige locatie met de PDOK Locatie API.",
    components: [Components.GGC_SEARCH_LOCATION],
    theme: [Themes.ZOEKEN],
    tags: [Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location/example-search-location.png"
  };
  urlComponentModule =
    "example-search-location/example-search-location/example-search-location.component.ts";
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

  constructor() {
    super();
  }

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
