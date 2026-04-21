/*
 * Public API Surface of ggc-feature-info
 */

export {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "./lib/model/feature-info-component-event";
export { FeatureInfoCollection } from "./lib/model/feature-info-collection.model";
export { CustomFeatureInfo } from "./lib/model/custom-feature-info.model";
export {
  SortFilterConfig,
  SortFilterConfigOptions
} from "./lib/model/sort-filter-config.model";
export { FeatureInfoDisplayType } from "./lib/feature-info-display/feature-info-display-type";
export {
  ValueTemplateDirective,
  ValueTemplateDirectiveType
} from "./lib/directive/value-template.directive";
export * from "./lib/service/ggc-feature-info-config.service";
export * from "./lib/feature-info/ggc-feature-info.component";
export * from "./lib/feature-info-tabs/ggc-feature-info-tabs.component";
