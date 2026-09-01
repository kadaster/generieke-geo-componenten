import { CustomParams } from "./custom-params.model";
import { WmsLayerOptions } from "./wms-layer.model";
import { Layer } from "./layer.model";

export interface TiledWmsLayerOptions extends WmsLayerOptions {
  tileSize: [number, number];
  tileBufferSize?: [number, number];
}

export class TiledWmsLayer extends Layer {
  layers: string[];
  baseURL: string;
  styles?: string[];
  imageFormat?: string;
  customParams: CustomParams;
  tileSize: [number, number];
  tileBufferSize?: [number, number];

  constructor(tiledWmsLayerOptions: TiledWmsLayerOptions) {
    super({ type: "tiledwms", opacity: 1 });

    this.layers = tiledWmsLayerOptions.layers;
    this.baseURL = tiledWmsLayerOptions.baseURL;
    this.styles = tiledWmsLayerOptions.styles;
    this.imageFormat = tiledWmsLayerOptions.imageFormat;
    this.customParams = tiledWmsLayerOptions.customParams;
    this.tileSize = tiledWmsLayerOptions.tileSize;
    this.tileBufferSize = tiledWmsLayerOptions.tileBufferSize;
  }
}
