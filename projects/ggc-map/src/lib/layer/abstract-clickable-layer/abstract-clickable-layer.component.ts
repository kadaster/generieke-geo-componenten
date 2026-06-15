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
  }

  protected getFeatureInfo(_event: MapBrowserEvent): void {
    // stubbed method
  }
}
