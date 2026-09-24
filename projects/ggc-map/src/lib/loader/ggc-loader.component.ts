import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  signal
} from "@angular/core";
import { Subscription } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * Component die een loader toont op basis van laadstatus
 * van een specifieke kaart.
 *
 * De loader luistert naar loading-events van {@link CoreMapEventsService}
 * en wordt automatisch bijgewerkt zodra de kaart start of stopt
 * met laden. De laadindicator wacht tot alle kaartlagen op de kaart geladen zijn.
 *
 * @example
 * <ggc-loader [mapIndex]="'default'"></ggc-loader>
 */
@Component({
  selector: "ggc-loader",
  templateUrl: "./ggc-loader.component.html",
  styleUrls: ["./ggc-loader.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GgcLoaderComponent implements OnDestroy {
  /**
   * Index van de kaart waarvoor laad-events worden gevolgd.
   *
   * Bij wijziging wordt de bestaande subscription gestopt
   * en een nieuwe subscription opgezet voor de opgegeven kaart.
   */

  mapIndex = input<string>(DEFAULT_MAPINDEX);
  /**
   * Geeft aan of de kaart momenteel aan het laden is.
   * Wordt gebruikt door de template om de loader te tonen of verbergen.
   */
  isLoading = signal(false);
  private readonly mapEventsService = inject(CoreMapEventsService);
  private loadEvents$: Subscription;

  constructor() {
    effect(() => {
      this.subscribe();
    });
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
      .getLoadingObservableForMap(this.mapIndex())
      .subscribe((isLoading) => this.isLoading.set(isLoading));
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
