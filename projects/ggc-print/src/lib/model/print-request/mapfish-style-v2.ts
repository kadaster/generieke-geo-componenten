export interface MapfishStyleV2 {
  [propName: string]: string | number | undefined | MapfishStyleRule;
  version: "2";
}

export interface MapfishStyleRule {
  [propName: string]: string | number | MapfishSymbolizer[] | undefined;
  minScale?: number;
  maxScale?: number;
  symbolizers: MapfishSymbolizer[];
}

export interface MapfishSymbolizer {
  [propName: string]: string | number | undefined;
  type: "point" | "line" | "polygon" | "text";
}
