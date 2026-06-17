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

@Component({
  selector: "app-ggc-map-search",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    GgcSearchLocationComponent
  ],
  templateUrl: "./ggc-map-search.component.html",
  styleUrl: "./ggc-map-search.component.scss"
})
export class GgcMapSearchComponent {
  protected searchLocationOptions = {
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

  protected logSearchComponentEvents($event: SearchComponentEvent) {
    console.log("search event", $event);
  }
}
