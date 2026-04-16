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
  private singleclick: Subscription;

  ngOnInit(): void {
    super.ngOnInit();

    if (this.options?.getFeatureInfoOnSingleclick === true) {
      this.singleclick = this.mapEventsService
        .getSingleclickObservableForMap(this.mapIndex)
        .subscribe((evt) => {
          this.getFeatureInfo(evt);
        });
    }
    if (this.options?.maxFeaturesOnSingleclick !== undefined) {
      this.maxFeaturesOnSingleclick = this.options?.maxFeaturesOnSingleclick;
    }
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();

    // unsubscribe on singleclick
    if (this.singleclick !== undefined) {
      this.singleclick.unsubscribe();
    }

    if (this.options?.getFeatureInfoOnSingleclick === true && this.layerName) {
      this.coreSelectionService.clearFeatureInfoForLayer(
        this.mapIndex,
        this.layerName
      );
    }
  }

  protected getFeatureInfo(_event: MapBrowserEvent): void {
    // stubbed method
  }
}
