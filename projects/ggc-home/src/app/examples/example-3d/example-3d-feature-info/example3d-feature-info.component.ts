import { Component, inject, ViewEncapsulation } from "@angular/core";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GgcControlsComponent,
  GgcSelectionService,
  GgcViewerComponent,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-cesium";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";
import { Color, ScreenSpaceEventType } from "@cesium/engine";
import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";
import { ViewerType } from "@kadaster/ggc-models";

@Component({
  selector: "app-example-3d-feature-info",
  templateUrl: "./example3d-feature-info.component.html",
  styleUrl: "./example3d-feature-info.component.scss",
  imports: [
    GgcViewerComponent,
    GgcControlsComponent,
    ExampleFormatComponent,
    GgcFeatureInfoComponent
  ],
  encapsulation: ViewEncapsulation.None
})
export class Example3dFeatureInfoComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-feature-info",
    title: "3D kaart met feature info en meerdere selecties",
    introduction:
      "3D kaart en een feature info weergave met meerdere selecties.",
    components: [Components.GGC_3D, Components.GGC_FEATURE_INFO],
    theme: [Themes.DRIED],
    tags: [],
    imageLocation:
      "code/examples/example-3d/example-3d-feature-info/example-3d-feature-info.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-feature-info/example3d-feature-info.component.ts";
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
    "code/examples/example-3d/example-3d-feature-info/kaartconfig.json";
  protected selectIndexClick = "selectClick";
  protected selectIndexHover = "selectHover";

  private readonly httpClient = inject(HttpClient);
  private readonly selectionService = inject(GgcSelectionService);

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
    this.selectionService.addSelection({
      eventType: ScreenSpaceEventType.LEFT_CLICK,
      highlightColor: Color.BLUE,
      selectIndex: this.selectIndexClick
    });
    this.selectionService.addSelection({
      eventType: ScreenSpaceEventType.MOUSE_MOVE,
      highlightColor: Color.DARKOLIVEGREEN,
      selectIndex: this.selectIndexHover
    });
    this.selectionService
      .getFeatureCollectionForCoordinateObservable(this.selectIndexHover)
      .subscribe(() => {
        // Reageer hier op het hover event
      });
  }
}
