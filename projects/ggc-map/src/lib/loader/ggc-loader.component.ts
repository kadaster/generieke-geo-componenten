import { Component, inject, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";

@Component({
  selector: "ggc-loader",
  templateUrl: "./ggc-loader.component.html",
  styleUrls: ["./ggc-loader.component.css"]
})
export class GgcLoaderComponent implements OnDestroy {
  protected isLoading = false;

  private mapEventsService = inject(CoreMapEventsService);
  private loadEvents$: Subscription;
  private _mapIndex: string;

  @Input()
  set mapIndex(value: string) {
    this._mapIndex = value;
    this.subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  private subscribe(): void {
    this.unsubscribe();
    this.loadEvents$ = this.mapEventsService
      .getLoadingObservableForMap(this._mapIndex)
      .subscribe((isLoading) => (this.isLoading = isLoading));
  }

  private unsubscribe(): void {
    if (this.loadEvents$) {
      this.loadEvents$.unsubscribe();
    }
  }
}
