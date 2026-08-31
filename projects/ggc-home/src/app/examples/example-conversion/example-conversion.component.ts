import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../example-format/example-format.component";
import { GgcMapComponent, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { ComponentInfo } from "../component-info.model";
import { Components } from "../components.enum";
import { Themes } from "../themes.enum";
import { Tags } from "../tags.enum";
import * as polygonExamples from "./example-polygons.json";
import { GgcConversionService } from "@kadaster/ggc-conversion";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import {
  MapComponentDrawTypes,
  MapComponentEventTypes
} from "@kadaster/ggc-models";

@Component({
  selector: "ggc-home-example-conversion",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-conversion.component.html"
})
export class ExampleConversionComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/conversion",
    title: "Bestandsconversies",
    introduction: "Converteer geometrieën van of naar een bestand.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER],
    imageLocation: "code/examples/example-conversion/example-conversion.png"
  } as ComponentInfo;
  urlComponentModule = "example-conversion/example-conversion.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-conversion_src_public-api.GgcConversionService.html`;
  // DOCS-SKIP:END
  mapConfig: Webservice[];
  protected readonly mapComponentDrawTypes = MapComponentDrawTypes;
  private readonly mapService = inject(GgcMapService);
  private readonly conversionService = inject(GgcConversionService);

  ngOnInit() {
    this.httpClient
      .get("code/examples/example-conversion/kaartconfig.json")
      .subscribe((data) => (this.mapConfig = data as Webservice[]));
  }

  onFileInput($event: InputEvent): void {
    const files: FileList = ($event.target as HTMLInputElement)
      .files as FileList;
    Array.from(files).forEach((file) => {
      (async () => {
        const features = await this.conversionService.convertToFeatures(file);
        const event = this.mapService.addFeaturesToHighlightLayer(features);
        console.log(event);
      })();
    });
  }

  downloadGML() {
    const layer = this.mapService.getExtraLayer("highlight") as VectorLayer<
      VectorSource<Feature<Geometry>>
    >;
    const file = this.conversionService.convertFeaturesToGML(
      layer.getSource()?.getFeatures() as Feature[],
      "features.gml"
    );
    const fileUrl = URL.createObjectURL(file);
    const linkTag = document.createElement("a");
    linkTag.download = "feature.gml";
    linkTag.href = fileUrl;
    linkTag.click();
  }

  downloadGeoJson() {
    const layer = this.mapService.getExtraLayer("highlight") as VectorLayer<
      VectorSource<Feature<Geometry>>
    >;
    const file = this.conversionService.convertFeaturesToGeoJson(
      layer.getSource()?.getFeatures() as Feature[],
      "features.geojson"
    );
    const fileUrl = URL.createObjectURL(file);
    const linkTag = document.createElement("a");
    linkTag.download = "feature.geojson";
    linkTag.href = fileUrl;
    linkTag.click();
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
    this.mapService.addFeaturesToHighlightLayer(features);
  }
}
