import { LayerLegend, ViewerType } from "@kadaster/ggc-models";

export type LayerLegendEnabledCallback = (args: {
  layerLegend: LayerLegend;
  mapIndex: string;
  viewerType: ViewerType;
}) => boolean | void | Promise<boolean | void>;
