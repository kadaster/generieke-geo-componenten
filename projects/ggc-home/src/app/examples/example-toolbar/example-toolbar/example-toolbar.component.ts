import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import {
  GgcDrawService,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import {
  GgcToolbarComponent,
  GgcToolbarItemComponent,
  GgcToolbarItemDrawComponent,
  GgcToolbarItemMeasureComponent,
  ToolbarItemComponentEvent
} from "@kadaster/ggc-toolbar";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { RouterLink } from "@angular/router";

@Component({
  selector: "ggc-home-example-toolbar",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    ExampleFormatComponent,
    GgcToolbarComponent,
    GgcToolbarItemComponent,
    GgcToolbarItemMeasureComponent,
    GgcToolbarItemDrawComponent,
    RouterLink
  ],
  templateUrl: "./example-toolbar.component.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./example-toolbar.component.scss"
})
export class ExampleToolbar extends ExampleFormatComponent {
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/toolbar",
    title: "Toolbar",
    introduction:
      "Toolbar met knoppen voor tekenen, bewerken en locatie kopiëren.",
    components: [Components.GGC_TOOLBAR],
    theme: [Themes.WERKBALK],
    tags: [Tags.TOOLBAR, Tags.CONTROLS],
    imageLocation:
      "code/examples/example-toolbar/example-toolbar/example-toolbar.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-toolbar/example-toolbar/example-toolbar.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-toolbar_src_public-api.GgcToolbarComponent.html`;
  // DOCS-SKIP:END
  protected measureActive = false;
  protected drawActive = false;

  private readonly mapService = inject(GgcMapService);
  private readonly drawService = inject(GgcDrawService);

  constructor() {
    super();
  }

  changeMeasureState(event: ToolbarItemComponentEvent) {
    this.measureActive = event.active;
    this.drawActive = false;
    this.drawService.stopDraw(DEFAULT_MAPINDEX);
  }

  copyLocation() {
    alert(this.mapService.getMap(DEFAULT_MAPINDEX).getView().getCenter());
  }

  changeDrawState(event: ToolbarItemComponentEvent) {
    this.drawActive = event.active;
    this.measureActive = false;
    this.drawService.stopDraw(DEFAULT_MAPINDEX);
  }
}
