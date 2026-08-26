export interface LayerOptions {
  opacity?: number;
  type: string;
}

export abstract class Layer {
  type: string;
  opacity?: number;
  failOnError: boolean;

  protected constructor(layerOptions: LayerOptions) {
    this.type = layerOptions.type;
    this.opacity = layerOptions.opacity;
    this.failOnError = true;
  }
}
