import { Layer } from "./layer.model";
import { Matrix } from "./matrix.model";

export interface WmtsLayerOptions {
  layer: string;
  baseURL: string;
  matrices: Matrix[];
  matrixSet: string;
  requestEncoding: string;
  style?: string;
}

export class WmtsLayer extends Layer {
  layer: string;
  baseURL: string;
  matrices: Matrix[];
  matrixSet: string;
  requestEncoding: string;
  style?: string;

  constructor(wmtsLayerOptions: WmtsLayerOptions) {
    super({ type: "WMTS", opacity: 1 });
    this.layer = wmtsLayerOptions.layer;
    this.baseURL = wmtsLayerOptions.baseURL;
    this.matrices = wmtsLayerOptions.matrices;
    this.matrixSet = wmtsLayerOptions.matrixSet;
    this.requestEncoding = wmtsLayerOptions.requestEncoding;
    this.style = wmtsLayerOptions.style;
  }
}
