import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from "@angular/core";
import { Theme } from "../model/theme/theme.model";
import { DatasetSwitcherButton } from "./model/dataset-switcher-button.model";
import { DatasetSwitcherEvent } from "./model/dataset-switcher-event.model";
import { GgcDatasetTreeConnectService } from "../dataset-tree/service/connect.service";
import { Dataset } from "../model/theme/dataset.model";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../model/theme/dataset-tree-webservice.model";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

type GgcOlLayerServiceLike = {
  setVisibilityLayers(
    layerIds: string[],
    visible: boolean,
    mapIndex: string
  ): void;
  isVisible(layerId: string, mapIndex: string): boolean;
};

/**
 * Dataset-switcher component.
 *
 * Dit component rendert een set radio buttons (op basis van {@link DatasetSwitcherButton})
 * waarmee de gebruiker tussen {@link Theme}'s kan wisselen.
 *
 * Wanneer een theme actief wordt:
 * - wordt een {@link DatasetSwitcherEvent} ge-emit (via {@link events});
 * - worden de onderliggende kaartlagen van het theme zichtbaar gemaakt via de OL layer service.
 *
 * ## Initialisatiegedrag
 * Zodra {@link themes} “beschikbaar wordt” (van leeg → gevuld), bepaalt het component automatisch
 * een initiële actieve theme:
 * - als er al lagen zichtbaar zijn op de kaart, wordt het theme gekozen dat daarbij hoort;
 * - anders wordt het theme gekozen dat overeenkomt met de eerste knop in {@link datasetSwitcherButtons}.
 *
 * Let op: deze initiële selectie gebeurt asynchroon (via `setTimeout`) om input-bindingen eerst te laten stabiliseren.
 */
@Component({
  selector: "ggc-dataset-switcher",
  templateUrl: "./ggc-dataset-switcher.component.html",
  styleUrls: ["./ggc-dataset-switcher.component.css"]
})
export class GgcDatasetSwitcherComponent implements OnChanges {
  /**
   * Beschikbare themes waaruit gekozen kan worden.
   *
   * Als deze input overgaat van leeg → gevuld, probeert het component automatisch een initiële actieve theme te bepalen.
   */
  @Input() themes: Theme[] = [];

  /**
   * Knoppen die in de UI getoond worden.
   *
   * De `name` van een knop moet overeenkomen met de {@link Theme.themeName} om selectie te laten werken.
   */
  @Input() datasetSwitcherButtons: DatasetSwitcherButton[];

  /**
   * Identificeert de kaart/viewer waarop laag-zichtbaarheid wordt toegepast.
   */
  @Input() mapIndex = DEFAULT_MAPINDEX;

  /**
   * Event-stream voor consumers van dit component.
   *
   * Emit bij theme-wissels (handmatig of via initiële selectie).
   */
  @Output() events = new EventEmitter<DatasetSwitcherEvent>();

  /**
   * Huidig actieve theme. Wordt gebruikt om:
   * - de radio button checked-state te bepalen;
   * - het vorige theme “uit” te zetten bij wissel.
   */
  protected activeTheme?: Theme;

  /**
   * Connectie-service waarmee de OL layer service lazy geladen wordt.
   */
  private readonly datasetTreeConnectService = inject(
    GgcDatasetTreeConnectService
  );

  /**
   * Angular lifecycle hook die wordt aangeroepen bij input changes.
   *
   * Specifiek luistert dit component naar veranderingen in {@link themes}.
   * Als themes “net beschikbaar” zijn geworden (previous leeg/undefined, current gevuld),
   * start het component een asynchrone initiële selectie.
   *
   * @param changes - Angular {@link https://angular.dev/api/core/SimpleChanges SimpleChanges} object met gewijzigde inputs.
   */
  ngOnChanges(changes: SimpleChanges): void {
    const themesChange = changes["themes"];
    if (!themesChange) return;

    const previous: Theme[] = themesChange.previousValue ?? [];
    const current: Theme[] = themesChange.currentValue ?? [];

    const becameAvailable = previous.length === 0 && current.length > 0;
    if (!becameAvailable) return;

    setTimeout(() => void this.setInitialActiveTheme(current), 100);
  }

  /**
   * Handler voor `(change)` events vanaf de radio buttons.
   *
   * Haalt de theme-naam uit `event.target.id`, zoekt het bijbehorende {@link Theme}
   * en voert vervolgens twee acties uit:
   * 1) emit een {@link DatasetSwitcherEvent};
   * 2) pas kaartlaag-zichtbaarheid aan via `processMap`.
   *
   * @param changeEvent - DOM event afkomstig van de radio input.
   */
  handleChangeEvent(changeEvent: Event): void {
    const target = changeEvent.target as HTMLInputElement | null;
    const themeName = target?.id;
    if (!themeName) return;

    const theme = this.getThemeFromName(themeName);
    if (!theme) return;

    this.sendChangeEvent(theme);
    void this.processMap(theme);
  }

  /**
   * Emit het switch-event voor consumers van dit component.
   *
   * @param theme - Het theme dat actief is geworden.
   */
  private sendChangeEvent(theme: Theme): void {
    this.events.emit(
      new DatasetSwitcherEvent(
        `${theme.themeName} geactiveerd in ggc-dataset-switcher`,
        theme
      )
    );
  }

  /**
   * Past de zichtbaarheid van lagen op de kaart aan op basis van de gekozen theme.
   *
   * Dit doet:
   * - laadt de OL layer service (lazy);
   * - zet de lagen van de vorige {@link activeTheme} uit (indien aanwezig);
   * - zet de lagen van de nieuwe theme aan;
   * - update {@link activeTheme}.
   *
   * @param theme - The theme dat geactiveerd moet worden.
   */
  private async processMap(theme: Theme): Promise<void> {
    await this.datasetTreeConnectService.loadGgcOLLayerService();
    const ggcOLLayerService =
      this.datasetTreeConnectService.getGgcOLLayerService() as
        | GgcOlLayerServiceLike
        | undefined;

    if (!ggcOLLayerService) return;

    if (this.activeTheme) {
      this.setVisibilityTheme(ggcOLLayerService, this.activeTheme, false);
    }

    this.setVisibilityTheme(ggcOLLayerService, theme, true);
    this.activeTheme = theme;
  }

  /**
   * Zoekt een theme op naam in {@link themes}.
   *
   * @param name - De te zoeken theme-naam (verwacht match met {@link Theme.themeName}).
   * @returns Het gevonden {@link Theme}, of `undefined` als er geen match is.
   */
  private getThemeFromName(name: string): Theme | undefined {
    return this.themes.find((theme) => theme.themeName === name);
  }

  /**
   * Zet alle lagen die onder een theme vallen aan of uit.
   *
   * Het component loopt over `theme.datasets -> dataset.services -> service.layers`
   * en roept `setVisibilityLayers` aan met de verzamelde `layerId`s.
   *
   * @param ggcOLLayerService - Service die kaartlagen kan (de)activeren.
   * @param theme - Theme waarvan de lagen aangepast moeten worden.
   * @param visible - Gewenste zichtbaarheid.
   */
  private setVisibilityTheme(
    ggcOLLayerService: any,
    theme: Theme,
    visible: boolean
  ): void {
    theme.datasets.forEach((dataset: Dataset) =>
      dataset.services.forEach((service: DatasetTreeWebservice) =>
        ggcOLLayerService.setVisibilityLayers(
          service.layers.map((layer: DatasetTreeLayer) => layer.layerId),
          visible,
          this.mapIndex
        )
      )
    );
  }

  /**
   * Bepaalt en activeert een initiële theme-selectie.
   *
   * Strategie:
   * 1) Als de kaartservice beschikbaar is, zoek een theme met minimaal één zichtbare laag;
   * 2) Zo niet gevonden: probeer de eerste knop uit {@link datasetSwitcherButtons} te matchen naar een theme
   *    en maak die (optioneel) zichtbaar op de kaart.
   *
   * Als er een theme gevonden is:
   * - update {@link activeTheme};
   * - emit een {@link DatasetSwitcherEvent}.
   *
   * @param themes - De themes die net beschikbaar zijn gekomen.
   */
  private async setInitialActiveTheme(themes: Theme[]): Promise<void> {
    if (!themes.length) return;

    await this.datasetTreeConnectService.loadGgcOLLayerService();
    const ggcOLLayerService =
      this.datasetTreeConnectService.getGgcOLLayerService() as
        | GgcOlLayerServiceLike
        | undefined;

    let activeTheme: Theme | undefined;

    if (ggcOLLayerService) {
      activeTheme = themes.find((theme) =>
        theme.datasets.some((dataset: Dataset) =>
          dataset.services.some((service: DatasetTreeWebservice) =>
            service.layers.some((layer: DatasetTreeLayer) =>
              ggcOLLayerService.isVisible(layer.layerId, this.mapIndex)
            )
          )
        )
      );
    }

    if (!activeTheme) {
      const firstButtonName = this.datasetSwitcherButtons?.[0]?.name;
      if (firstButtonName) {
        activeTheme = this.getThemeFromName(firstButtonName);
        if (ggcOLLayerService && activeTheme) {
          this.setVisibilityTheme(ggcOLLayerService, activeTheme, true);
        }
      }
    }

    if (!activeTheme) return;

    this.activeTheme = activeTheme;
    this.sendChangeEvent(activeTheme);
  }
}
