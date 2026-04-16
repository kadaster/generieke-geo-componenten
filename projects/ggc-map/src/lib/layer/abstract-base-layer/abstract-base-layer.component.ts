import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { Layer } from "ol/layer";
import { Options } from "ol/layer/Base";
import OlMap from "ol/Map";
import { CrsConfig } from "../../core/model/crs-config.model";
import { GgcCrsConfigService } from "../../core/service/ggc-crs-config.service";
import { CoreMapService } from "../../map/service/core-map.service";
import { CoreSelectionService } from "../../service/select/core-selection.service";
import { AbstractBaseLayerOptions } from "../model/abstract-layer.model";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({ template: "" })
export class AbstractBaseLayerComponent<T extends Layer>
  implements OnInit, OnDestroy
{
  protected mapIndex: string = DEFAULT_MAPINDEX;
  protected coreMapService = inject(CoreMapService);
  protected coreSelectionService = inject(CoreSelectionService);
  protected crsConfig = inject(GgcCrsConfigService);
  protected map: OlMap;
  protected olLayer: T;
  protected layerOptions: Options;
  protected rdNewConfig: CrsConfig;
  protected options?: AbstractBaseLayerOptions;

  ngOnInit(): void {
    this.rdNewConfig = this.crsConfig.getRdNewCrsConfig();
    if (!this.options) {
      this.options = {
        mapIndex: this.mapIndex,
        layerId: this.generateLayerId()
      };
    } else if (this.options.layerId == undefined) {
      this.options.layerId = this.generateLayerId();
    }
    if (this.options.mapIndex !== undefined) {
      this.mapIndex = this.options.mapIndex;
    }
  }

  ngOnDestroy(): void {
    // remove the layer if the tag is destroyed.
    if (this.map !== undefined && this.olLayer !== undefined) {
      this.map.removeLayer(this.olLayer);
    }
  }

  public getLayerId(): string {
    return this.options!.layerId!;
  }

  protected setLayer(layer: T): void {
    this.olLayer = layer;
    this.olLayer.set("ggc-layer-id", this.options?.layerId);
    this.olLayer.set("ggc-title", this.options?.title);

    this.map = this.coreMapService.getMap(this.mapIndex);
    this.map.addLayer(this.olLayer);
  }

  private generateLayerId(): string {
    return crypto.randomUUID();
  }
}
