import { Layer } from "./layer.model";

export interface ImageLayerOptions {
  baseURL: string;
  extent: number[];
}

export class ImageLayer extends Layer {
  baseURL: string;
  extent: number[];

  constructor(imageLayerOptions: ImageLayerOptions) {
    super({ type: "image", opacity: 1 });
    this.baseURL = imageLayerOptions.baseURL;
    this.extent = imageLayerOptions.extent;
  }
}
