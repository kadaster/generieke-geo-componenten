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
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-3d-basic",
  templateUrl: "./example-3d-basic.component.html",
  styleUrl: "./example-3d-basic.component.scss",
  imports: [GgcViewerComponent, GgcControlsComponent, ExampleFormatComponent],
  encapsulation: ViewEncapsulation.None
})
export class Example3dBasicComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-basic",
    title: "3D kaart tonen",
    introduction: "Toon een 3D kaart.",
    components: [Components.GGC_3D],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.DRIED],
    imageLocation:
      "code/examples/example-3d/example-3d-basic/example-3d-basic.png"
  };

  urlComponentModule =
    "example-3d/example-3d-basic/example-3d-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected hideLogo = false;
  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-basic",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };
  protected kaartConfig =
    "code/examples/example-3d/example-3d-basic/kaartconfig.json";

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

  protected toggleHideLogo() {
    this.hideLogo = !this.hideLogo;
  }
}
