import { AfterViewInit, Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import {
  GgcSearchLocationComponent,
  SearchComponentEvent,
  SearchCurrentLocation,
  SearchCurrentLocationType,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { HttpClient } from "@angular/common/http";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";
import {
  GgcToolbarComponent,
  GgcToolbarItemDrawComponent
} from "@kadaster/ggc-toolbar";

@Component({
  selector: "app-opdr-2-componenten-configuratie",
  imports: [
    GgcMapComponent,
    GgcSearchLocationComponent,
    GgcDatasetTreeComponent,
    GgcFeatureInfoComponent,
    GgcToolbarComponent,
    GgcToolbarItemDrawComponent
  ],
  templateUrl: "./opdr-2-componenten-configuratie.component.html",
  styleUrl: "./opdr-2-componenten-configuratie.component.scss"
})
export class Opdr2ComponentenConfiguratieComponent
  implements OnInit, AfterViewInit
{
  // Search location opties voor configuratie van zoeken op de kaart
  protected searchLocationOptions = {
    alternativeSuggestionsFirst: true,
    collectionIdTranslations: new Map<string, string>([
      ["functioneel_gebied", "andere tekst voor functioneel gebied"]
    ]),
    searchCurrentLocation: {
      type: SearchCurrentLocationType.BUTTON,
      icon: "fas fa-map-marker-alt",
      loadIcon: "fa-spin fas fa-spinner",
      label: "Gebruik mijn locatie"
    } as SearchCurrentLocation,
    zoomToResult: true,
    markResult: true
  } as SearchLocationOptions;

  // Webservice is de configuratie die je meegeeft aan de kaart
  protected webServices: Webservice[] = [];
  protected datasetTreeThemes: Theme[] = [];

  private http: HttpClient = inject(HttpClient);
  private mapService: GgcMapService = inject(GgcMapService);

  ngOnInit() {
    this.http.get("webServiceConfig_opdr2.json").subscribe((data) => {
      console.log(data);
      this.webServices = data as Webservice[];
    });

    this.http.get("dateSetConfig_opdr2.json").subscribe((data) => {
      this.datasetTreeThemes = data as Theme[];
    });
  }

  ngAfterViewInit() {
    this.mapService.zoomToExtent([
      226868.864, 569545.989, 247393.6, 592677.992
    ]);
  }

  protected logSearchComponentEvents($event: SearchComponentEvent) {
    console.log("search event", $event);
  }
}
