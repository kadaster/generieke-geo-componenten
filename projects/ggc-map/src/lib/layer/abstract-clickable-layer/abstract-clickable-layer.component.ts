import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { MapBrowserEvent } from "ol";
import { CoreMapEventsService } from "../../map/service/core-map-events.service";
import { AbstractConfigurableLayerComponent } from "../abstract-configurable-layer/abstract-configurable-layer.component";
import { AbstractClickableLayerOptions } from "../model/abstract-layer.model";
import { Subscription } from "rxjs";

@Component({ template: "" })
export class AbstractClickableLayerComponent<T>
  extends AbstractConfigurableLayerComponent<any>
  implements OnInit, OnDestroy
{
  protected maxFeaturesOnSingleclick = 8;
  protected options?: AbstractClickableLayerOptions;
  protected mapEventsService = inject(CoreMapEventsService);
  protected singleclick: Subscription;

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.unsubscribeOnClickEvent();
  }

  enable() {
    super.enable();
    this.subscribeOnClickEvent();
  }

  disable() {
    super.disable();
    this.unsubscribeOnClickEvent();
  }

  protected setLayer(layer: any) {
    super.setLayer(layer);
    this.olLayer.set(
      "ggc-get-feature-info-on-singleclick",
      this.options?.getFeatureInfoOnSingleclick
    );
  }

  private subscribeOnClickEvent() {
    this.unsubscribeOnClickEvent();
    if (this.options?.getFeatureInfoOnSingleclick === true) {
      this.singleclick = this.mapEventsService
        .getSingleclickObservableForMap(this.mapIndex)
        .subscribe((evt) => {
          this.handleSingleClick(evt);
        });
    }
  }

  private unsubscribeOnClickEvent() {
    if (this.singleclick !== undefined) {
      this.singleclick.unsubscribe();
    }
  }

  protected handleSingleClick(_event: MapBrowserEvent): void {
    // stubbed method
  }

  protected getFeatureInfo(_event: MapBrowserEvent): void {
    // stubbed method
  }
}
