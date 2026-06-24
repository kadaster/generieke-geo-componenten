import { AfterViewInit, Component, inject, OnInit } from "@angular/core";
import {
  GgcMapComponent,
  GgcMapEventsService,
  GgcMapService,
  resolutionToZoomlevel,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { MapEvent } from "ol";
import { fromExtent } from "ol/geom/Polygon";
import Feature from "ol/Feature";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-map-extra-overzicht.component.html",
  styleUrl: "./example-map-extra-overzicht.component.scss"
})
export class ExampleMapExtraOverzichtComponent
  extends ExampleFormatComponent
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-extra-overzicht",
    title: "Experiment Innovation day",
    introduction:
      "Voeg een afbeelding als laag toe aan de kaart met Web Map Tile Service (WMTS).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-map-extra-overzicht/example-map-extra-overzicht.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-extra-overzicht/example-map-extra-overzicht.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.WmtsLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: Webservice[];
  protected mapConfigOverzicht: Webservice[];
  protected mapIndex = "index-kaart";
  protected mapIndexOverzicht = "index-kaart-overzicht";

  private readonly mapService: GgcMapService = inject(GgcMapService);
  private readonly mapEventService = inject(GgcMapEventsService);

  private onverzichtKaartZoomFactor = 12;

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-map-extra-overzicht/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });
    this.httpClient
      .get(
        "code/examples/example-map/example-map-extra-overzicht/kaartconfig-overzicht.json"
      )
      .subscribe((data) => {
        this.mapConfigOverzicht = data as Webservice[];
      });
  }

  ngAfterViewInit() {
    this.removeZoomInteractions(this.mapIndexOverzicht);
    this.removeZoomButtons(this.mapIndexOverzicht);

    this.connectOverzichtKaart();
    this.setBoxStyle();

    void this.mapService.zoomToCoordinate([155000, 463000], this.mapIndex, 2);
  }

  private connectOverzichtKaart() {
    this.mapService
      .getMap(this.mapIndex)
      .getView()
      .on("change:resolution", () => {
        this.handleMapEventFromView();
      });
    this.mapService
      .getMap(this.mapIndex)
      .getView()
      .on("change:center", () => {
        this.handleMapEventFromView();
      });
  }

  private setBoxStyle() {
    const stroke = new Stroke({
      color: "#0093be",
      width: 3
    });
    const selectionStyle = new Style({
      stroke
    });
    this.mapService.changeSelectionLayerStyle(
      selectionStyle,
      this.mapIndexOverzicht
    );
  }

  private handleMapEventFromView() {
    const map = this.mapService.getMap(this.mapIndex);
    const view = map.getView();

    const center = view.getCenter()!;
    const resolution = view.getResolution()!;
    const extent = view.calculateExtent(map.getSize());

    const newZoomLevel = Math.max(
      resolutionToZoomlevel(resolution * this.onverzichtKaartZoomFactor),
      1
    );

    void this.mapService.zoomToCoordinate(
      center,
      this.mapIndexOverzicht,
      newZoomLevel
    );

    const polygon = fromExtent(extent);
    const bboxFeature = new Feature({
      geometry: polygon
    });

    this.mapService.clearSelectionLayer(this.mapIndexOverzicht);
    this.mapService.addFeaturesToSelectionLayer(
      [bboxFeature],
      this.mapIndexOverzicht
    );
  }

  private removeZoomButtons(mapIndex: string) {
    const map = this.mapService.getMap(mapIndex);
    const controls = map.getControls();
    controls.clear();
  }

  private removeZoomInteractions(mapIndex: string) {
    const mapOverzicht = this.mapService.getMap(mapIndex);
    const interactions = mapOverzicht.getInteractions();
    interactions.clear();
  }
}
