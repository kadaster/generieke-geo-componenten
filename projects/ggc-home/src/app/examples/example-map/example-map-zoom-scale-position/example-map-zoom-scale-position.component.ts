import { Component, inject, OnInit } from "@angular/core";
import {
  GgcMapComponent,
  GgcMapDetailsContainerComponent,
  GgcMapService,
  GgcMousePositionComponent,
  GgcScaleDenominatorComponent,
  GgcScaleLineComponent,
  GgcZoomLevelComponent
} from "@kadaster/ggc-map";
import { Webservice } from "../../../../../../ggc-cesium/src/lib/model/interfaces";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-search-location",
  imports: [
    GgcMapComponent,
    GgcScaleLineComponent,
    GgcScaleDenominatorComponent,
    GgcMapDetailsContainerComponent,
    GgcMousePositionComponent,
    ExampleFormatComponent,
    GgcScaleDenominatorComponent,
    GgcZoomLevelComponent,
    GgcMousePositionComponent,
    GgcMousePositionComponent
  ],
  templateUrl: "./example-map-zoom-scale-position.component.html",
  styleUrl: "./example-map-zoom-scale-position.component.scss"
})
export class ExampleMapZoomScalePositionComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/example-map-zoom-scale-position",
    title: "Kaart eigenschappen tonen (schaal, zoom niveau en muis positie)",
    introduction: "",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTBEDIENING],
    tags: [Tags.SCALE, Tags.ZOOM, Tags.LOCATION],
    imageLocation:
      "code/examples/example-map/example-map-zoom-scale-position/example-map-zoom-scale-position.png"
  } as ComponentInfo;

  urlComponentModule =
    "example-map/example-map-zoom-scale-position/example-map-zoom-scale-position.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/modules/ggc-map_src_public-api.html`;
  // DOCS-SKIP:END

  protected mapConfig: Webservice[];
  private readonly mapService = inject(GgcMapService);

  constructor() {
    super();
  }
  ngOnInit() {
    this.mapService.getMap().getView().setConstrainResolution(true);
    this.httpClient
      .get(
        "code/examples/example-map/example-map-zoom-scale-position/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
}
