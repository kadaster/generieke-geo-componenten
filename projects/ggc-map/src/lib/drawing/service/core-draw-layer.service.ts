import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { StyleLike } from "ol/style/Style";
import { CoreMapService } from "../../map/service/core-map.service";
import { inject, Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class CoreDrawLayerService {
  private coreMapService = inject(CoreMapService);
  private drawLayers: Map<
    string,
    VectorLayer<VectorSource<Feature<Geometry>>>
  > = new Map();

  getDrawLayer(
    layerName: string,
    mapIndex: string,
    style?: StyleLike
  ): VectorLayer<VectorSource<Feature<Geometry>>> {
    const key = `${mapIndex}-${layerName}`;
    if (!this.drawLayers.has(key)) {
      const vectorLayer = this.coreMapService.createLayerAndAddToMap(
        mapIndex,
        style
      );
      this.drawLayers.set(key, vectorLayer);
    }

    return this.drawLayers.get(key) as VectorLayer<
      VectorSource<Feature<Geometry>>
    >;
  }

  getDrawLayers() {
    return this.drawLayers;
  }
}
