import { Component, ChangeDetectionStrategy } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import {
  GgcSearchLocationComponent,
  SearchComponentEvent,
  SearchCurrentLocation,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-search-location-only-location",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    GgcSearchLocationComponent,
    ExampleFormatComponent
  ],
  templateUrl: "./example-search-location-only-location.component.html"
})
export class ExampleSearchLocationOnlyLocationComponent extends ExampleFormatComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/search-location-only-location",
    title: "Huidige locatie",
    introduction:
      "Hier wordt alleen de huidige locatie knop getoond. Het zoeken zelf is niet enabled. Ga naar je huidige locatie door op de locatie knop te drukken.",
    components: [Components.GGC_SEARCH_LOCATION],
    theme: [Themes.ZOEKEN],
    tags: [Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location-only-location/example-search-location-only-location.png"
  };
  urlComponentModule =
    "example-search-location/example-search-location-only-location/example-search-location-only-location.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-search-location_src_public-api.GgcSearchLocationComponent.html`;
  // DOCS-SKIP:END
  searchLocationOptions = {
    searchCurrentLocation: {
      icon: "fas fa-map-marker-alt",
      loadIcon: "fa-spin fas fa-spinner",
      label: "Gebruik mijn locatie"
    } as SearchCurrentLocation,
    zoomToResult: true,
    markResult: true,
    hideSearch: true
  } as SearchLocationOptions;

  constructor() {
    super();
  }

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
