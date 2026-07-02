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
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";
import { ViewerType } from "@kadaster/ggc-models";
import { Tags } from "../../tags.enum";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-example-3d-feature-info-auto-connect",
  templateUrl: "./example3d-feature-info-auto-connect.component.html",
  styleUrl: "./example3d-feature-info-auto-connect.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    GgcFeatureInfoComponent,
    RouterLink
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dFeatureInfoAutoConnectComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-feature-info-auto-connect",
    title: "Objectinformatie weergeven (3D)",
    introduction:
      "Toon informatie over geografische objecten op de 3D kaart (feature info).",
    components: [Components.GGC_FEATURE_INFO],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRIED, Tags.OBJECTINFO],
    imageLocation:
      "code/examples/example-3d/example-3d-feature-info-auto-connect/example-3d-feature-info-auto-connect.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-feature-info-auto-connect/example3d-feature-info-auto-connect.component.ts";
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
    "code/examples/example-3d/example-3d-feature-info-auto-connect/kaartconfig.json";

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
