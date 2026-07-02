import { Component } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import {
  GgcSearchLocationComponent,
  SearchComponentEvent,
  SearchCurrentLocation,
  SearchCurrentLocationType,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-search-location",
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
    introduction: "Zoek een adres, woonplaats of huidige locatie.",
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
  searchLocationOptions = {
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
    zoomToResult: true,
    markResult: true
  } as SearchLocationOptions;

  constructor() {
    super();
  }

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
