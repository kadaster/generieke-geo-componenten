import { Component, inject, ViewEncapsulation } from "@angular/core";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import {
  CameraOptions,
  GeoJsonConfig,
  GgcControlsComponent,
  GgcViewerComponent,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-map-3d";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { HttpClient } from "@angular/common/http";
import {
  BillboardGraphics,
  Entity,
  HeightReference,
  VerticalOrigin
} from "@cesium/engine";

@Component({
  selector: "app-example-3d-layer-geojson",
  templateUrl: "./example3d-layer-geojson.component.html",
  styleUrl: "./example3d-layer-geojson.component.scss",
  imports: [GgcViewerComponent, GgcControlsComponent, ExampleFormatComponent],
  encapsulation: ViewEncapsulation.None
})
export class Example3dLayerGeojsonComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-3d-layer-geojson",
    title: "Kaartlaag toevoegen: JSON-format (GeoJSON, 3D)",
    introduction: "Voeg een GeoJSON laag toe aan de 3D-kaart.",
    components: [Components.GGC_3D],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.DRIED],
    imageLocation:
      "code/examples/example-3d/example-3d-layer-geojson/example-3d-layer-geojson.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-3d/example-3d-layer-geojson/example3d-layer-geojson.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected hideLogo = false;
  protected cameraOptions: CameraOptions;
  protected webService: Webservice[];
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-layer-geojson",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };
  protected kaartConfig =
    "code/examples/example-3d/example-3d-layer-geojson/kaartconfig.json";

  protected geoJsonConfigs: GeoJsonConfig[] = [
    {
      layerId: "terugmeldingen-bgt",
      entitiesFunction: (entity: Entity) => {
        entity.billboard = new BillboardGraphics({
          image:
            "code/examples/example-3d/example-3d-layer-geojson/pointer-pin.svg",
          scale: 0.05,
          heightReference: HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
      }
    }
  ];

  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient.get(this.kaartConfig).subscribe((data) => {
      this.webService = data as Webservice[];
    });
  }

  public onCesiumReady() {
    // zoom to Torentje
    setTimeout(() => {
      this.cameraOptions = {
        cameraPosition: { lat: 52.38277, lon: 4.64038, alt: 12776.57232 },
        orientation: { heading: 2, pitch: -90, roll: 0 }
      };
    });
  }
}
