import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output
} from "@angular/core";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { AbstractBaseLayerComponent } from "../abstract-base-layer/abstract-base-layer.component";
import { AbstractConfigurableLayerOptions } from "../model/abstract-layer.model";

@Component({
  selector: "ggc-abstract-configurable-layer",
  template: ""
})
export class AbstractConfigurableLayerComponent<T>
  extends AbstractBaseLayerComponent<any>
  implements OnInit, OnDestroy
{
  @Output() events: EventEmitter<MapComponentEvent> =
    new EventEmitter<MapComponentEvent>();

  protected attributions: string | undefined;
  protected layerName: string | undefined;
  protected options?: AbstractConfigurableLayerOptions;

  ngOnInit(): void {
    super.ngOnInit();

    this.layerName = this.options?.layerName;
    this.attributions = this.options?.attributions;

    this.layerOptions = {
      ...(this.options?.minResolution && {
        minResolution: this.options?.minResolution
      }),
      ...(this.options?.maxResolution && {
        maxResolution: this.options?.maxResolution
      }),
      ...(this.options?.zIndex && { zIndex: this.options?.zIndex }),
      ...(this.options?.opacity && { opacity: this.options?.opacity })
    };
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected setLayer(layer: any) {
    super.setLayer(layer);

    const attributions = this.options?.attributions;
    if (attributions !== undefined) {
      this.olLayer.getSource().setAttributions(attributions);
    }
  }
}
