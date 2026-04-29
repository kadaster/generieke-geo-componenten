import { Component, inject, OnInit } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-example-search-location",
  imports: [
    GgcMapComponent,
    ExampleFormatComponent,
    GgcLayerBrtAchtergrondkaartComponent
  ],
  templateUrl: "./example-layer-geojson.component.html",
  styleUrl: "./example-layer-geojson.component.scss"
})
export class ExampleLayerGeojsonComponent extends ExampleFormatComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/layer-geojson",
    title: "Kaartlaag toevoegen: JSON-format (GeoJSON)",
    introduction: "Voeg een GeoJSON laag toe aan de kaart.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-layer-geojson/example-layer-geojson.png"
  } as ComponentInfo;
  urlComponentModule = import.meta.url;
  // DOCS-SKIP:END

  protected mapConfig: Webservice[];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-layer/example-layer-geojson/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
