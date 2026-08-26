import { Attributes } from "./attributes.model";

export interface MapFishPrintRequestOptions {
  layout: string;
  attributes: Attributes;
  outputFilename: string;
}

export class MapFishPrintRequest {
  layout: string;
  outputFilename: string;
  attributes: Attributes;

  constructor(layout: string, attributes: Attributes, outputFilename?: string) {
    this.layout = layout;
    this.attributes = attributes;
    if (outputFilename) {
      this.outputFilename = outputFilename;
    }
  }
}
