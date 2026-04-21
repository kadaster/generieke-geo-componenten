import { Component, computed, signal } from "@angular/core";
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
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Tags } from "../../tags.enum";

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
  templateUrl: "./example-search-location-adv.component.html",
  styleUrl: "./example-search-location-adv.component.scss"
})
export class ExampleSearchLocationAdvComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/search-location-adv",
    title: "Locatie zoeken (uitgebreid)",
    introduction: "Zoek een adres, woonplaats of locatie.",
    components: [Components.GGC_SEARCH_LOCATION],
    tags: [Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location/example-search-location.png"
  } as ComponentInfo;

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

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
