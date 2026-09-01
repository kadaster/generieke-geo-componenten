import { CustomParams } from "./custom-params.model";
import { Layer } from "./layer.model";

export interface WmsLayerOptions {
  layers: string[];
  baseURL: string;
  styles?: string[];
  imageFormat?: string;
  customParams: CustomParams;
}

export class WmsLayer extends Layer {
  layers: string[];
  baseURL: string;
  styles?: string[];
  imageFormat?: string;
  customParams: CustomParams;

  constructor(wmsLayerOptions: WmsLayerOptions) {
    super({ type: "wms", opacity: 1 });
    this.layers = wmsLayerOptions.layers;
    this.baseURL = wmsLayerOptions.baseURL;
    this.styles = wmsLayerOptions.styles;
    this.imageFormat = wmsLayerOptions.imageFormat;
    this.customParams = wmsLayerOptions.customParams;
  }
}
