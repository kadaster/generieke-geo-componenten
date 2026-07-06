import { Component, inject, ViewEncapsulation } from "@angular/core";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GgcControlsComponent,
  GgcViewerComponent,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-map-3d";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";
import { ViewerType } from "@kadaster/ggc-models";
import {
  GgcSearchLocationComponent,
  SearchCurrentLocationType,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-3d-search",
  templateUrl: "./example3d-search.component.html",
  styleUrl: "./example3d-search.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    GgcSearchLocationComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dSearchComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-search",
    title: "Locatie zoeken (3D)",
    introduction:
      "Zoek een adres, woonplaats of huidige locatie in een 3D kaart.",
    components: [Components.GGC_SEARCH_LOCATION],
    theme: [Themes.ZOEKEN],
    tags: [Tags.DRIED, Tags.SEARCH, Tags.LOCATION],
    imageLocation:
      "code/examples/example-3d/example-3d-search/example-3d-search.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-search/example3d-search.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected cameraOptions: CameraOptions;
  protected viewerType = ViewerType.DRIE_D;
  protected webService: Webservice[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-feature-info",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };
  protected kaartConfig =
    "code/examples/example-3d/example-3d-search/kaartconfig.json";
  protected searchLocationOptions = {
    viewerType: ViewerType.DRIE_D,
    zoomToResult: true,
    markResult: true,
    searchCurrentLocation: {
      type: SearchCurrentLocationType.SELECT
    }
  } as SearchLocationOptions;

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient.get(this.kaartConfig).subscribe((data) => {
      this.webService = data as Webservice[];
    });
  }

  public onCesiumReady() {
    // zoom to Torentje
    setTimeout(() => {
      this.cameraOptions = cameraOptionsTorentjeDenHaag;
    });
  }
}
