import { Component, inject, model, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { GgcDrawService, GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { FormsModule } from "@angular/forms";
import { Components } from "../../components.enum";
import { Fill, Style, Text } from "ol/style";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { MapComponentDrawTypes } from "@kadaster/ggc-models";

@Component({
  selector: "app-example-measure-own-style-label",
  imports: [ExampleFormatComponent, GgcMapComponent, FormsModule],
  templateUrl: "./example-measure-own-style-label.component.html"
})
export class ExampleMeasureOwnStyleLabel
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/measure-own-style-label",
    title: "Gebruiken van een eigen stijl op labels met meetwaarden.",
    introduction: "Toepassen van eigen stijl op labels tijdens het meten.",
    components: [Components.GGC_MAP],
    theme: [Themes.INFORMATIE_OP_KAART],
    tags: [Tags.MEASURE, Tags.STYLE],
    imageLocation:
      "code/examples/example-measure/example-measure-own-style-label/example-measure-own-style-label.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-measure/example-measure-own-style-label/example-measure-own-style-label.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcDrawService.html`;
  // DOCS-SKIP:END
  segmentLengthLabelStyle = new Style({
    text: new Text({
      text: "Meten",
      fill: new Fill({
        color: "#000000"
      }),
      backgroundFill: new Fill({
        color: "rgba(244,125,46,0.93)"
      }),
      padding: [5, 6, 5, 6],
      offsetY: -15
    })
  });
  lengthLabelStyle = new Style({
    text: new Text({
      fill: new Fill({ color: "#ffffff" }),
      font: "12px Courier New",
      backgroundFill: new Fill({
        color: "rgba(97,50,19,0.93)"
      }),
      padding: [5, 6, 5, 6],
      offsetY: -15
    })
  });

  mapConfig: Webservice[];
  measuring = model(false);

  private readonly drawService = inject(GgcDrawService);
  private readonly measureLayer = "measure";

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-measure/example-measure-own-style-label/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });

    this.drawService.setDrawStyle(this.measureLayer, {
      segmentLengthLabelStyle: this.segmentLengthLabelStyle,
      lengthLabelStyle: this.lengthLabelStyle
    });

    setTimeout(() => {
      this.measureLine();
    }, 100);
  }

  measureLine() {
    this.measuring.set(true);
    this.drawService.startDraw(
      this.measureLayer,
      MapComponentDrawTypes.LINESTRING,
      { showSegmentLength: true, showTotalLength: true }
    );
  }

  stopMeasureManual() {
    this.drawService.finishCurrentDraw();
  }
}
