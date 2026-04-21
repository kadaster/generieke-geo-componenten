import { Component, inject, signal } from "@angular/core";
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
import * as polygonExamples from "./ExamplePolygons.json";
import { always } from "ol/events/condition";
import { HttpClient } from "@angular/common/http";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

export enum EditType {
  MOVE = "move",
  MODIFY = "modify"
}

@Component({
  selector: "app-example-draw-edit-basic",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-draw-edit-basic.component.html",
  styleUrl: "./example-draw-edit-basic.component.scss"
})
export class ExampleDrawEditBasicComponent extends ExampleFormatComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/draw-edit-basic",
    title: "Verplaatsen en bewerken met de muis",
    introduction:
      "Verplaats en bewerk lijnen, polygonen, punten en rechthoeken met de muis.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.MODIFY],
    imageLocation:
      "code/examples/example-draw/example-draw-edit-basic/example-draw-edit-basic.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  activeEditType = signal<EditType>(EditType.MOVE);

  protected readonly editType = EditType;
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;
  private readonly httpClient = inject(HttpClient);
  private readonly drawService = inject(GgcDrawService);
  private readonly editLayer = "edit";

  constructor() {
    super();
    this.httpClient
      .get("code/examples/example-draw/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.drawService.stopDraw();
    this.drawService.startMove(this.editLayer);
  }

  // In dit voorbeeld worden alleen de editLayer en de voorwaarde voor het toevoegen
  // van punten aan een geometrie meegegeven aan de startModify().
  startModify() {
    this.activeEditType.set(EditType.MODIFY);
    this.drawService.startModify(
      this.editLayer,
      undefined,
      {},
      undefined,
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
