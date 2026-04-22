import { Component, inject, Input, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";

/**
 * Component die een loader toont op basis van laadstatus
 * van een specifieke kaart.
 *
 * De loader luistert naar loading-events van {@link CoreMapEventsService}
 * en wordt automatisch bijgewerkt zodra de kaart start of stopt
 * met laden.
 *
 * @example
 * <ggc-loader [mapIndex]="'default'"></ggc-loader>
 */
@Component({
  selector: "ggc-loader",
  templateUrl: "./ggc-loader.component.html",
  styleUrls: ["./ggc-loader.component.css"]
})
export class GgcLoaderComponent implements OnDestroy {
  /**
   * Geeft aan of de kaart momenteel aan het laden is.
   * Wordt gebruikt door de template om de loader te tonen of verbergen.
   */
  protected isLoading = false;

  private mapEventsService = inject(CoreMapEventsService);
  private loadEvents$: Subscription;
  private _mapIndex: string;

  /**
   * Index van de kaart waarvoor laad-events worden gevolgd.
   *
   * Bij wijziging wordt de bestaande subscription gestopt
   * en een nieuwe subscription opgezet voor de opgegeven kaart.
   */
  @Input()
  set mapIndex(value: string) {
    this._mapIndex = value;
    this.subscribe();
  }

  /**
   * Lifecycle hook die wordt aangeroepen wanneer
   * het component wordt vernietigd.
   *
   * Zorgt ervoor dat alle subscriptions correct worden opgeruimd.
   */
  ngOnDestroy(): void {
    this.unsubscribe();
  }

  /**
   * Abonneert zich op laad-events van de opgegeven kaart
   * en actualiseert de loader-status.
   */
  private subscribe(): void {
    this.unsubscribe();
    this.loadEvents$ = this.mapEventsService
      .getLoadingObservableForMap(this._mapIndex)
      .subscribe((isLoading) => (this.isLoading = isLoading));
  }

  /**
   * Beëindigt de actieve subscription op laad-events,
   * indien aanwezig.
   */
  private unsubscribe(): void {
    if (this.loadEvents$) {
      this.loadEvents$.unsubscribe();
    }
  }
}
