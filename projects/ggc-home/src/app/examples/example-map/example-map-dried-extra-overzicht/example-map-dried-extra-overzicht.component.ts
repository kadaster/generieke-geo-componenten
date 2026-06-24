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
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  CameraValues,
  GgcLocationService,
  GgcViewerComponent,
  GgcViewerService,
  ViewerOptions
} from "@kadaster/ggc-cesium";
import { CoreCameraService } from "../../../../../../ggc-cesium/src/lib/service/core-camera.service";
import { CoreViewerService } from "../../../../../../ggc-cesium/src/lib/service/core-viewer.service";
import { Cartesian2, Cartographic, Viewer } from "@cesium/engine";
import proj4 from "proj4";
import { Point, Polygon } from "ol/geom";
import { defs } from "@kadaster/ggc-models";
import { getCenter } from "ol/extent";
import { Icon } from "ol/style";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

@Component({
  selector: "app-example-search-location",
  imports: [GgcMapComponent, ExampleFormatComponent, GgcViewerComponent],
  templateUrl: "./example-map-dried-extra-overzicht.component.html",
  styleUrl: "./example-map-dried-extra-overzicht.component.scss"
})
export class ExampleMapDriedExtraOverzichtComponent
  extends ExampleFormatComponent
  implements OnInit, AfterViewInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/map-dried-extra-overzicht",
    title: "Experiment Innovation day 3D",
    introduction:
      "Voeg een afbeelding als laag toe aan de kaart met Web Map Tile Service (WMTS).",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation:
      "code/examples/example-layer/example-map-dried-extra-overzicht/example-map-dried-extra-overzicht.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-map/example-map-dried-extra-overzicht/example-map-dried-extra-overzicht.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/interfaces/ggc-map_src_public-api.WmtsLayerOptions.html`;
  // DOCS-SKIP:END
  protected mapConfig: any;
  protected mapConfigOverzicht: Webservice[];
  protected mapIndex = "index-kaart";
  protected mapIndexOverzicht = "index-kaart-overzicht";

  protected cameraOptions: CameraOptions;
  protected viewerOptions: ViewerOptions = {
    elementId: "cesium-basic",
    terrainModelUrl:
      "https://api.pdok.nl/kadaster/3d-basisvoorziening/ogc/v1/collections/digitaalterreinmodel/quantized-mesh",
    directionalLightOptions: {
      direction: "cameraDirection",
      intensity: 2.5
    }
  };

  private readonly mapService: GgcMapService = inject(GgcMapService);
  private readonly mapEventService = inject(GgcMapEventsService);
  private readonly map3dCameraService = inject(CoreCameraService);
  private readonly map3dViewerService = inject(GgcViewerService);
  private readonly viewerService = inject(CoreViewerService);
  private readonly ggcLocationService = inject(GgcLocationService);

  private onverzichtKaartZoomFactor = 12;
  private overzichtKaartRotates = false;
  private roosFeature: any;
  private vectorSource: any;

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-map/example-map-dried-extra-overzicht/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data;
      });
    this.httpClient
      .get(
        "code/examples/example-map/example-map-dried-extra-overzicht/kaartconfig-overzicht.json"
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

    this.addSvgFeatureLayer();

    void this.mapService.zoomToCoordinate([155000, 463000], this.mapIndex, 2);
  }

  public onCesiumReady() {
    setTimeout(() => {
      this.cameraOptions = cameraOptionsTorentjeDenHaag;
    });
  }

  private connectOverzichtKaart() {
    this.map3dCameraService.getCameraValuesObservable().subscribe((values) => {
      this.handleMapEvent(values);
    });
  }

  private addSvgFeatureLayer() {
    const map = this.mapService.getMap(this.mapIndexOverzicht);

    if (!map) return;

    const coordinate: [number, number] = [155000, 463000];

    this.roosFeature = new Feature({
      geometry: new Point(coordinate)
    });

    const svgUrl = "./assets/overzicht-roos.svg";

    const style = new Style({
      image: new Icon({
        src: svgUrl,
        scale: 0.5,
        anchor: [0.5, 0.5],
        rotateWithView: false
      })
    });

    this.roosFeature.setStyle(style);

    this.vectorSource = new VectorSource({
      features: [this.roosFeature]
    });

    const vectorLayer = new VectorLayer({
      source: this.vectorSource,
      zIndex: 1,
      updateWhileInteracting: true,
      updateWhileAnimating: true
    });

    map.addLayer(vectorLayer);
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

  private handleMapEvent(values: CameraValues) {
    const viewer = this.viewerService.getViewer();
    if (viewer) {
      const corners = this.getVisibleCorners(viewer);
      const invalidIndex = corners.findIndex((corner) => {
        return corner == null;
      });

      if (invalidIndex != -1) {
        return;
      }

      const rdCorners = corners.map((corner) => {
        return this.wgs84ToRd(corner!.longitude, corner!.latitude);
      });

      const bboxFeature = new Feature({
        geometry: new Polygon([rdCorners])
      });

      this.mapService.clearSelectionLayer(this.mapIndexOverzicht);
      this.mapService.addFeaturesToSelectionLayer(
        [bboxFeature],
        this.mapIndexOverzicht
      );

      const geo = bboxFeature.getGeometry()!.clone();
      geo.scale(2.5);
      const polyExtent = geo.getExtent();
      this.mapService.zoomToExtent(polyExtent, {
        mapIndex: this.mapIndexOverzicht
      });

      const extentCenter = getCenter(bboxFeature.getGeometry()!.getExtent());
      this.roosFeature.getGeometry().setCoordinates(extentCenter);

      if (this.overzichtKaartRotates) {
        const rotationDegree = values.orientation.heading;
        if (rotationDegree !== undefined) {
          const rotationRadius = (rotationDegree * Math.PI) / 180;
          this.mapService
            .getMap(this.mapIndexOverzicht)!
            .getView()
            .setRotation(rotationRadius);
        }
      }

      const rotationDegree = values.orientation.heading;
      const rotationRadius = 1.5 * Math.PI + (rotationDegree! * Math.PI) / 180;
      const style = this.roosFeature.getStyle() as Style;
      const image = style.getImage() as Icon;
      image.setRotation(rotationRadius);
      this.roosFeature.changed();
    }
  }

  private wgs84ToRd(lon: number, lat: number): [number, number] {
    return proj4("EPSG:4326", defs, [lon, lat]);
  }

  private getVisibleCorners(viewer: Viewer) {
    const scene = viewer.scene;
    const camera = scene.camera;
    const canvas = scene.canvas;

    const corners = [
      new Cartesian2(0, 0),
      new Cartesian2(canvas.clientWidth, 0),
      new Cartesian2(canvas.clientWidth, canvas.clientHeight),
      new Cartesian2(0, canvas.clientHeight)
    ];

    const result = corners.map((corner) => {
      const ray = camera.getPickRay(corner);
      const cartesian = scene.globe.pick(ray!, scene);

      if (!cartesian) return null;

      const cartographic = Cartographic.fromCartesian(cartesian);

      return {
        longitude: (cartographic.longitude * 180) / Math.PI,
        latitude: (cartographic.latitude * 180) / Math.PI,
        height: cartographic.height
      };
    });
    return result;
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
