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
import * as polygonExamples from "./ExamplePolygons.json";
import { HttpClient } from "@angular/common/http";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";

@Component({
  selector: "app-example-draw-center-edit-basic",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-draw-center-edit-basic.component.html",
  styleUrl: "./example-draw-center-edit-basic.component.scss"
})
export class ExampleDrawCenterEditBasicComponent
  extends ExampleFormatComponent
  implements OnInit
{
  readonly componentInfo: ComponentInfo = {
    route: "/draw-center-edit-basic",
    title: "Verplaatsen en bewerken met het toetsenbord",
    introduction:
      "Verplaats en bewerk lijnen, polygonen, punten en rechthoeken met het toetsenbord.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.MODIFY],
    imageLocation:
      "code/examples/example-draw/example-draw-center-edit-basic/example-draw-center-edit-basic.png"
  } as ComponentInfo;

  mapConfig: Webservice[];

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
  }

  ngOnInit() {
    this.drawService.stopDraw();
    setTimeout(() => this.startCenterModify(), 100);
  }

  startCenterModify() {
    this.drawService.startCenterModify(this.editLayer);
  }

  startCenterModifyCurrentPoint() {
    this.drawService.startCenterModifyCurrentPoint();
  }

  removeCenterModifyCurrentPoint() {
    this.drawService.removeCenterModifyCurrentPoint();
  }

  stopCenterModifyCurrentPoint() {
    this.drawService.stopCenterModifyCurrentPoint();
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
