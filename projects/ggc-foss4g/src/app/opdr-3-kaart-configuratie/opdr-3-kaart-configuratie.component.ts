import { AfterViewInit, Component, inject, OnInit } from "@angular/core";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { HttpClient } from "@angular/common/http";
import { GgcDatasetTreeComponent, Theme } from "@kadaster/ggc-dataset-tree";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";

@Component({
  selector: "app-opdr-3-kaart-configuratie",
  imports: [GgcMapComponent, GgcDatasetTreeComponent, GgcFeatureInfoComponent],
  templateUrl: "./opdr-3-kaart-configuratie.component.html",
  styleUrl: "./opdr-3-kaart-configuratie.component.scss"
})
export class Opdr3KaartConfiguratieComponent implements OnInit, AfterViewInit {
  protected webService: Webservice[] = [];
  protected datasetTreeThemes: Theme[] = [];

  private readonly http: HttpClient = inject(HttpClient);
  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngOnInit() {
    this.http.get("webServiceConfig_opdr3.json").subscribe((data) => {
      console.log(data);
      this.webService = data as Webservice[];
    });
    this.http.get("dateSetConfig_opdr3.json").subscribe((data) => {
      this.datasetTreeThemes = data as Theme[];
    });
  }

  ngAfterViewInit() {
    this.mapService.zoomToCoordinate([233781.788, 582029.049]);
  }
}
