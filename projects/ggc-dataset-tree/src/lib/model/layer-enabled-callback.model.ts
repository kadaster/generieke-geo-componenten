import { DatasetTreeLayer } from "./theme/dataset-tree-webservice.model";
import { ViewerType } from "@kadaster/ggc-models";

export type LayerEnabledCallback = (args: {
  layer: DatasetTreeLayer;
  mapIndex: string;
  viewerType: ViewerType;
  isEnabled: boolean;
}) => boolean | void | Promise<boolean | void>;
