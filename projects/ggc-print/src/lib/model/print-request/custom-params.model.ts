export interface CustomParamsOptions {
  TRANSPARENT?: boolean;
  CRS?: string;
}

export class CustomParams {
  TRANSPARENT?: boolean;
  CRS?: string;

  constructor(customParamsOptions: CustomParamsOptions) {
    this.TRANSPARENT = customParamsOptions.TRANSPARENT;
    this.CRS = customParamsOptions.CRS;
  }
}
