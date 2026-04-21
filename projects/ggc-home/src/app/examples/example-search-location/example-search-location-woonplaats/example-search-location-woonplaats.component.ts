import { Component, inject, OnInit } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import {
  GgcSearchLocationComponent,
  PdokLocationApiService,
  SearchCollection,
  SearchComponentEvent,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { take } from "rxjs/operators";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-search-location-woonplaats",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    GgcSearchLocationComponent,
    ExampleFormatComponent
  ],
  templateUrl: "./example-search-location-woonplaats.component.html",
  styleUrl: "./example-search-location-woonplaats.component.scss"
})
export class ExampleSearchLocationWoonplaatsComponent implements OnInit {
  readonly componentInfo: ComponentInfo = {
    route: "/search-location-woonplaats",
    title: "Locatie zoeken (in collecties)",
    introduction:
      "Zoek naar een adres, woonplaats of locatie in één of meerdere gekozen collections.",
    components: [Components.GGC_SEARCH_LOCATION],
    theme: [Themes.ZOEKEN],
    tags: [Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-search-location/example-search-location-woonplaats/example-search-location-woonplaats.png"
  } as ComponentInfo;

  searchLocationOptions = {
    zoomToResult: true,
    markResult: true
  } as SearchLocationOptions;

  private readonly pdokLocationApiService = inject(PdokLocationApiService);

  ngOnInit() {
    this.pdokLocationApiService.collectionsLoaded$
      .pipe(take(1))
      .subscribe((collectionsResult) => {
        const woonplaatsCollection = collectionsResult.collections?.find(
          (collection) => collection.id === "woonplaats"
        );

        if (woonplaatsCollection) {
          this.pdokLocationApiService.setCustomCollections([
            {
              id: woonplaatsCollection.id,
              version: woonplaatsCollection.version,
              relevance: 1
            } as SearchCollection
          ]);
        }
      });
  }

  logSearchComponentEvents(searchComponentEvent: SearchComponentEvent) {
    console.log(searchComponentEvent);
  }
}
