import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  signal
} from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcDrawService,
  GgcMapComponent,
  MapComponentEventTypes,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import GeoJSON from "ol/format/GeoJSON";
import * as polygonExamples from "./example-polygons.json";
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
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/draw-center-edit-basic",
    title: "Bewerken met markering op de kaart",
    introduction:
      "Bewerk lijnen, punten, vlakken en rechthoeken met vingers (mobiele device) of toetsenbord.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.DRAW, Tags.MODIFY],
    imageLocation:
      "code/examples/example-draw/example-draw-center-edit-basic/example-draw-center-edit-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-draw/example-draw-center-edit-basic/example-draw-center-edit-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  editActive = signal<boolean>(false);
  mapConfig: Webservice[];

  protected readonly httpClient = inject(HttpClient);
  private readonly drawService = inject(GgcDrawService);
  private readonly editLayer = "edit";

  constructor() {
    super();
  }

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-draw/kaartconfig.json")
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
  }
  ngAfterViewInit() {
    this.startCenterModify();
  }

  startCenterModify() {
    this.drawService.startCenterModify(this.editLayer);
  }

  startCenterModifyCurrentPoint() {
    this.drawService.startCenterModifyCurrentPoint();
    this.editActive.set(true);
  }

  removeCenterModifyCurrentPoint() {
    this.drawService.removeCenterModifyCurrentPoint();
  }

  stopCenterModifyCurrentPoint() {
    this.drawService.stopCenterModifyCurrentPoint();
    this.editActive.set(false);
  }

  // Toevoegen van tekeningen bij het openen van de kaart
  onMapEvent(mapComponentEvent: any) {
    if (mapComponentEvent.type === MapComponentEventTypes.MAPINITIALIZED) {
      const features = new GeoJSON().readFeatures(polygonExamples).slice(0, 5);
      for (const feature of features) {
        this.drawService.addFeatureToLayer(this.editLayer, feature);
      }
    }
  }
}
