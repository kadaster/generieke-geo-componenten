export interface MatrixOptions {
  identifier: string;
  matrixSize: number[];
  scaleDenominator: number;
  tileSize: number[];
  topLeftCorner: number[];
}

export class Matrix {
  identifier: string;
  matrixSize: number[];
  scaleDenominator: number;
  tileSize: number[];
  topLeftCorner: number[];

  constructor(matrixOptions: MatrixOptions) {
    this.identifier = matrixOptions.identifier;
    this.matrixSize = matrixOptions.matrixSize;
    this.scaleDenominator = matrixOptions.scaleDenominator;
    this.tileSize = matrixOptions.tileSize;
    this.topLeftCorner = matrixOptions.topLeftCorner;
  }
}
