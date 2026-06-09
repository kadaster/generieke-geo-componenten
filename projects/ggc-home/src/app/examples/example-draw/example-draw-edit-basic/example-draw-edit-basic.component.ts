import { Component, inject, OnInit, signal } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcDrawService,
  GgcMapComponent,
  MapComponentDrawTypes,
  MapComponentEventTypes,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import GeoJSON from "ol/format/GeoJSON";
import * as polygonExamples from "./example-polygons.json";
import { altKeyOnly, always, singleClick } from "ol/events/condition";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { MapComponentEventTypes } from "@kadaster/ggc-models";
import { MapComponentDrawTypes } from "@kadaster/ggc-models";

export enum EditType {
  MOVE = "move",
  MODIFY = "modify"
}

@Component({
  selector: "app-example-draw-edit-basic",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-draw-edit-basic.component.html"
})
export class ExampleDrawEditBasicComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/draw-edit-basic",
    title: "Verplaatsen en bewerken met de muis",
    introduction:
      "Verplaats en bewerk lijnen, punten, vlakken en rechthoeken met de muis.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.MODIFY],
    imageLocation:
      "code/examples/example-draw/example-draw-edit-basic/example-draw-edit-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-draw/example-draw-edit-basic/example-draw-edit-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  mapConfig: Webservice[];
  activeEditType = signal<EditType>(EditType.MOVE);

  protected readonly editType = EditType;
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;

  private readonly drawService = inject(GgcDrawService);
  private readonly editLayer = "edit";

  deleteCondition = (mapBrowserEvent: MapBrowserEvent) => {
    return altKeyOnly(mapBrowserEvent) && singleClick(mapBrowserEvent);
  };

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-draw/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.drawService.stopDraw();
    this.drawService.startMove(this.editLayer);
  }

  // In dit voorbeeld worden de editLayer en de voorwaarden voor het verwijderen en toevoegen
  // van punten aan een geometrie meegegeven aan de startModify().
  startModify() {
    this.activeEditType.set(EditType.MODIFY);
    this.drawService.startModify(
      this.editLayer,
      undefined,
      {},
      this.deleteCondition,
      always
    );
  }

  startMove() {
    this.activeEditType.set(EditType.MOVE);
    this.drawService.startMove(this.editLayer);
  }

  // Toevoegen van tekeningen bij het openen van de kaart
  onMapEvent(mapComponentEvent: any) {
    if (mapComponentEvent.type === MapComponentEventTypes.MAPINITIALIZED) {
      this.addGeoJsonToActiveLayer();
    }
  }
  // Ophalen van tekeningen om aan de kaart toe te voegen
  addGeoJsonToActiveLayer() {
    const features = new GeoJSON().readFeatures(polygonExamples).slice(0, 5);
    for (const feature of features) {
      this.drawService.addFeatureToLayer(this.editLayer, feature);
    }
  }
}
