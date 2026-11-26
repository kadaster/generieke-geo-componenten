import { AfterViewInit, Component, inject } from "@angular/core";
import { httpResource } from "@angular/common/http";
import {
  GgcMapComponent,
  GgcMapService,
  resolutionToZoomlevel,
  Webservice
} from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import { fromExtent } from "ol/geom/Polygon";
import Feature from "ol/Feature";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";

@Component({
  selector: "ggc-home-example-map-extra-overzicht",
  imports: [GgcMapComponent, ExampleFormatComponent],
  templateUrl: "./example-map-extra-overzicht.component.html",
  styleUrl: "./example-map-extra-overzicht.component.scss"
})
export class ExampleMapExtraOverzichtComponent
  extends ExampleFormatComponent
  implements AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-extra-overzicht",
    title: "Overzichtskaart toevoegen",
    introduction:
      "Voeg een kleine overzichtskaart toe aan de kaart om de positie op de kaart te tonen.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-map/example-map-extra-overzicht/example-map-extra-overzicht.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-extra-overzicht/example-map-extra-overzicht.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.WmtsLayerOptions.html`;
  // DOCS-SKIP:END
  protected readonly mapConfig = httpResource<Webservice[]>(
    () =>
      "code/examples/example-map/example-map-extra-overzicht/kaartconfig.json"
  );
  protected readonly mapConfigOverzichtkaart = httpResource<Webservice[]>(
    () =>
      "code/examples/example-map/example-map-extra-overzicht/kaartconfig-overzicht.json"
  );
  protected mapIndex = "index-kaart";
  protected mapIndexOverzichtkaart = "index-kaart-overzicht";

  private readonly mapService: GgcMapService = inject(GgcMapService);
  private overzichtKaartZoomFactor = 12;

  ngAfterViewInit() {
    this.connectOverzichtKaart();
    this.setBoxStyle();

    void this.mapService.zoomToCoordinate([155000, 463000], this.mapIndex, 2);
  }

  private connectOverzichtKaart() {
    this.mapService
      .getMap(this.mapIndex)
      .getView()
      .on(["change:resolution", "change:center"], () => {
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
      this.mapIndexOverzichtkaart
    );
  }

  private handleMapEventFromView() {
    const map = this.mapService.getMap(this.mapIndex);
    const view = map.getView();

    const center = view.getCenter()!;
    const resolution = view.getResolution()!;
    const extent = view.calculateExtent(map.getSize());

    const zoomLevelOverzichtkaart = Math.max(
      resolutionToZoomlevel(resolution * this.overzichtKaartZoomFactor),
      1
    );

    void this.mapService.zoomToCoordinate(
      center,
      this.mapIndexOverzichtkaart,
      zoomLevelOverzichtkaart
    );

    const polygon = fromExtent(extent);
    const bboxFeature = new Feature({
      geometry: polygon
    });

    this.mapService.clearSelectionLayer(this.mapIndexOverzichtkaart);
    this.mapService.addFeaturesToSelectionLayer(
      [bboxFeature],
      this.mapIndexOverzichtkaart
    );
  }
}
