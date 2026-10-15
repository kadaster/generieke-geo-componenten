import {
  Directive,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  signal
} from "@angular/core";
import { AbstractBaseLayer } from "../abstract-base-layer/abstract-base-layer.directive";
import { AbstractConfigurableLayerOptions } from "../model/abstract-layer.model";
import { zoomlevelToResolution } from "../../utils/epsg28992";
import { MapComponentEvent } from "@kadaster/ggc-models";

@Directive()
export abstract class AbstractConfigurableLayer<T>
  extends AbstractBaseLayer<any>
  implements OnInit, OnDestroy
{
  @Output() events: EventEmitter<MapComponentEvent> =
    new EventEmitter<MapComponentEvent>();

  protected attributions: string | undefined;
  protected layerName: string | undefined;
  protected options = signal<AbstractConfigurableLayerOptions | undefined>(
    undefined
  );

  ngOnInit(): void {
    super.ngOnInit();

    this.layerName = this.options()?.layerName;
    this.attributions = this.options()?.attributions;

    this.layerOptions = {
      ...(this.options()?.minResolution && {
        minResolution: this.options()?.minResolution
      }),
      ...(this.options()?.maxResolution && {
        maxResolution: this.options()?.maxResolution
      }),
      ...(this.options()?.zIndex && { zIndex: this.options()?.zIndex }),
      ...(this.options()?.opacity && { opacity: this.options()?.opacity })
    };

    if (
      this.options()?.minZoomLevel !== undefined &&
      this.options()?.maxResolution == undefined
    ) {
      this.layerOptions = {
        ...this.layerOptions,
        maxResolution: zoomlevelToResolution(this.options()!.minZoomLevel!)
      };
    }

    if (
      this.options()?.maxZoomLevel !== undefined &&
      this.options()?.minResolution == undefined
    ) {
      this.layerOptions = {
        ...this.layerOptions,
        minResolution: zoomlevelToResolution(this.options()!.maxZoomLevel!)
      };
    }

    this.applyActiveStyle();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Past de actieve stijl uit de laagopties toe op deze kaartlaag.
   *
   * De actieve stijl is de stijl binnen [styles] met de technische naam uit [activeStyle];
   * is die er niet, dan geldt de eerste stijl als actieve stijl. De stijl wordt toegepast
   * voordat de kaartlaag zijn source opbouwt, zodat de laag direct in de juiste stijl wordt
   * weergegeven.
   */
  protected applyActiveStyle(): void {
    const styles = this.options()?.styles;
    if (!styles?.length) {
      return;
    }
    const activeStyle =
      styles.find((style) => style.name === this.options()?.activeStyle) ??
      styles[0];
    this.applyStyle(activeStyle);
  }

  protected setLayer(layer: any) {
    super.setLayer(layer);

    const attributions = this.options()?.attributions;
    if (attributions !== undefined) {
      this.olLayer.getSource().setAttributions(attributions);
    }
  }
}
