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
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-example-3d-layer-3d-tiles",
  templateUrl: "./example3d-layer-3d-tiles.component.html",
  styleUrl: "./example3d-layer-3d-tiles.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    RouterLink
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dLayer3dTilesComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-layer-3d-tiles",
    title: "Kaartlaag toevoegen: OGC API 3D GeoVolumes",
    introduction:
      "Voeg een 3D laag toe aan de kaart met OGC API 3D GeoVolumes.",
    components: [Components.GGC_3D],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.DRIED, Tags.OGC_API],
    imageLocation:
      "code/examples/example-3d/example-3d-layer-3d-tiles/example-3d-layer-3d-tiles.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-layer-3d-tiles/example3d-layer-3d-tiles.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected hideLogo = false;
  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-layer-3d-tiles",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };
  protected kaartConfig =
    "code/examples/example-3d/example-3d-layer-3d-tiles/kaartconfig.json";

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
