import { Component, inject, ViewEncapsulation } from "@angular/core";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GgcControlsComponent,
  GgcViewerComponent,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-cesium";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-example-3d-layer-wmts",
  templateUrl: "./example3d-layer-wmts.component.html",
  styleUrl: "./example3d-layer-wmts.component.scss",
  imports: [GgcViewerComponent, GgcControlsComponent, ExampleFormatComponent],
  encapsulation: ViewEncapsulation.None
})
export class Example3dLayerWmtsComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-layer-wmts",
    title: "(WIP) Kaartlaag toevoegen: WMTS",
    introduction: "Voeg een WMTS laag toe aan de 3D kaart.",
    components: [Components.GGC_3D],
    theme: [Themes.DRIED],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-3d/example-3d-layer-wmts/example-3d-layer-wmts.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-layer-wmts/example3d-layer-wmts.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected hideLogo = false;
  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-layer-wmts",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };
  protected kaartConfig =
    "code/examples/example-3d/example-3d-layer-wmts/kaartconfig.json";

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
