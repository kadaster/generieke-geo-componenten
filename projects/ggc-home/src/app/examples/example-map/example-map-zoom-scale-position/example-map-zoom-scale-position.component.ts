import { Component, inject, OnInit } from "@angular/core";
import {
  GgcMapComponent,
  GgcMapDetailsContainerComponent,
  GgcMapService,
  GgcMousePositionComponent,
  GgcScaleDenominatorComponent,
  GgcScaleLineComponent,
  GgcZoomLevelComponent,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "ggc-home-example-map-zoom-scale-position",
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
  templateUrl: "./example-map-zoom-scale-position.component.html"
})
export class ExampleMapZoomScalePositionComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-zoom-scale-position",
    title: "Kaart eigenschappen tonen",
    introduction:
      "Toon kaartinformatie zoals schaal, zoom niveau en muispositie.",
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
