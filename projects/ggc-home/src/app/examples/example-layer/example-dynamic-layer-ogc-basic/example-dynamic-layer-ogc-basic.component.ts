import { Component, inject, OnInit } from "@angular/core";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import {
  GgcLayerService,
  GgcMapComponent,
  GgcMapService,
  Webservice
} from "@kadaster/ggc-map";
import { ComponentInfo } from "../../component-info.model";
import { Components } from "../../components.enum";
import { Themes } from "../../themes.enum";
import { Tags } from "../../tags.enum";
import {
  LayerChangedEvent,
  LayerChangedEventTrigger
} from "@kadaster/ggc-models";

@Component({
  selector: "ggc-home-example-dynamic-layer-ogc-basic",
  imports: [ExampleFormatComponent, GgcMapComponent],
  templateUrl: "./example-dynamic-layer-ogc-basic.component.html"
})
export class ExampleDynamicLayerOgcBasicComponent
  extends ExampleFormatComponent
  implements OnInit
{
  // DOCS-SKIP:START
  readonly componentInfo: ComponentInfo = {
    route: "/dynamic-layer-ogc-basic",
    title: "OGC feature toevoegen aan kaartlaag (dynamisch)",
    introduction: "Voeg een OGC feature toe aan een GeoJSON kaartlaag.",
    components: [Components.GGC_MAP],
    theme: [Themes.KAARTLAGEN],
    tags: [Tags.LAYER, Tags.OGC_API],
    imageLocation:
      "code/examples/example-layer/example-dynamic-layer-ogc-basic/example-dynamic-layer-ogc-basic.png"
  } as ComponentInfo;
  urlComponentModule =
    "example-layer/example-dynamic-layer-ogc-basic/example-dynamic-layer-ogc-basic.component.ts";
  tsDocsUrl = `${document.baseURI}tsdocs/classes/ggc-map_src_public-api.GgcLayerService.html`;
  // DOCS-SKIP:END

  protected mapConfig: Webservice[];
  protected activeLocation: "grift" | "brug" | "arnhem" | "zwolle" = "brug";
  protected readonly mapIndex = "mapName";

  private layerService: GgcLayerService = inject(GgcLayerService);
  private mapService: GgcMapService = inject(GgcMapService);

  ngOnInit() {
    this.httpClient
      .get(
        "code/examples/example-layer/example-dynamic-layer-ogc-basic/kaartconfig.json"
      )
      .subscribe((data) => {
        this.mapConfig = data as Webservice[];
      });

    this.layerService.getLayerChangedObservable().subscribe((change) => {
      this.zoomToExtent(change);
    });

    this.goToDeBrug();
  }

  goToDeGrift() {
    this.activeLocation = "grift";
    this.addFeatureToGeoJsonLayer("Apeldoorn&perceelnummer=9833&sectie=U");
  }

  goToDeBrug() {
    this.activeLocation = "brug";
    this.addFeatureToGeoJsonLayer("Apeldoorn&perceelnummer=4095&sectie=AD");
  }

  goToLocatieArnhem() {
    this.activeLocation = "arnhem";
    this.addFeatureToGeoJsonLayer("Arnhem&perceelnummer=9288&sectie=AC");
  }

  goToLocatieZwolle() {
    this.activeLocation = "zwolle";
    this.addFeatureToGeoJsonLayer("Zwolle&perceelnummer=3244&sectie=P");
  }

  private addFeatureToGeoJsonLayer(kadastraleGemeenteWaarde: string) {
    this.layerService.removeLayer(this.mapIndex, "perceel");
    this.layerService.addGeojsonLayer({
      url: `https://api.pdok.nl/kadaster/brk-kadastrale-kaart/ogc/v1/collections/perceel/items?crs=http://www.opengis.net/def/crs/EPSG/0/28992&f=json&limit=100&filter-lang=cql2-text&kadastrale_gemeente_waarde=${kadastraleGemeenteWaarde}`,
      layerId: "perceel",
      title: "Perceel",
      zIndex: 20,
      mapIndex: this.mapIndex
    });
  }

  private zoomToExtent(change: LayerChangedEvent) {
    if (
      change.layerId === "perceel" &&
      change.eventTrigger === LayerChangedEventTrigger.LAYER_LOADED
    ) {
      const layer: any = this.mapService.getLayer("perceel", this.mapIndex);
      const source = layer?.getSource();
      const features = source?.getFeatures();

      if (source && features?.length) {
        const map = this.mapService.getMap(this.mapIndex);
        const view = map.getView();
        const extent = source.getExtent();
        const zoomOutLevel = 5; // pas het aantal niveaus aan naar smaak

        // Stap 1: eerst uitzoomen, zodat tiles op tussenliggende niveaus tijd hebben te laden
        view.animate(
          {
            zoom: zoomOutLevel,
            duration: 800
          },
          () => {
            // Stap 2: pas daarna pannen + inzoomen naar de nieuwe extent
            view.fit(extent, {
              padding: [20, 20, 20, 20],
              maxZoom: 19,
              duration: 2000
            });
          }
        );
      }
    }
  }
}
