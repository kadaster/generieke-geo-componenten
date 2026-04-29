import { Component, inject, OnInit } from "@angular/core";
import {
  FormatType,
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import {
  GgcToolbarComponent,
  GgcToolbarItemComponent
} from "@kadaster/ggc-toolbar";
import { GgcSearchLocationService } from "@kadaster/ggc-search-location";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-toolbar-location",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    ExampleFormatComponent,
    GgcToolbarComponent,
    GgcToolbarItemComponent
  ],
  templateUrl: "./example-toolbar-location.component.html",
  styleUrl: "./example-toolbar-location.component.scss"
})
export class ExampleToolbarLocation
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/toolbar-location",
    title: "Toolbar uitbreiden",
    introduction:
      "Toolbar uitbreiding om huidige locatie op de kaart te laten zien.",
    components: [Components.GGC_TOOLBAR],
    theme: [Themes.WERKBALK],
    tags: [Tags.TOOLBAR, Tags.LOCATION, Tags.CONTROLS],
    imageLocation:
      "code/examples/example-toolbar/example-toolbar-location/example-toolbar-location.png"
  } as ComponentInfo;
  // DOCS-SKIP:END
  private readonly searchLocationService = inject(GgcSearchLocationService);
  private readonly mapService = inject(GgcMapService);

  ngOnInit(): void {
    this.searchLocationService
      .getLocationEventsObservable()
      .subscribe((location) => {
        this.mapService.zoomToGeometryWithZoomOptions(
          JSON.stringify({ type: "Point", coordinates: location }),
          {
            fitOptions: { padding: [50, 50, 50, 50] }
          },
          FormatType.GEOJSON
        );
        this.mapService.markFeature(
          JSON.stringify({ type: "Point", coordinates: location }),
          DEFAULT_MAPINDEX,
          FormatType.GEOJSON
        );
      });
  }

  goToCurrentLocation() {
    this.searchLocationService.getLocation(false);
  }
}
