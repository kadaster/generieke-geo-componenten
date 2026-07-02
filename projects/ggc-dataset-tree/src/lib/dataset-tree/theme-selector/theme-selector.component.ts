import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  TemplateRef
} from "@angular/core";
import { Theme } from "../../model/theme/theme.model";
import { LayerSelectorComponent } from "../layer-selector/layer-selector.component";
import { CommonModule } from "@angular/common";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { DEFAULT_MAPINDEX, ViewerType } from "@kadaster/ggc-models";
import { LayerEnabledCallback } from "../../model/layer-enabled-callback.model";

type LayerCounts = {
  active: number;
  total: number;
};

/**
 * Component dat binnen het dataset‑structuurcomponent verantwoordelijk is voor
 * het tonen, groeperen en bedienen van themes inclusief hun
 * onderliggende datasets en kaartlagen.
 *
 *  * Dit component:
 *  * - toont één of meerdere Themes in een boomstructuur;
 *  * - ondersteunt recursieve thema‑structuren (thema’s binnen thema’s);
 *  * - ondersteunt het open‑ en dichtklappen van thema’s;
 */
@Component({
  selector: "ggc-theme-selector",
  templateUrl: "./theme-selector.component.html",
  styleUrls: ["./theme-selector.component.scss"],
  imports: [LayerSelectorComponent, CommonModule]
})
export class ThemeSelectorComponent {
  /**
   * Unieke index die gelijk is aan de themeIndex binnen de boomstructuur van de json. Wordt gebruikt om child themes te indexeren.
   */
  themeNameIndex = input<string>("");
  /**
   * Wanneer `true`, worden active/all counters toont bij elke dataset (wordt doorgegeven aan alle datasets).
   */
  showActiveCounters = input<boolean>(true);
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset ingeklapt is (wordt doorgegeven aan alle datasets).
   */
  iconCollapsed = input<string>("");
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset opengeklapt is (wordt doorgegeven aan alle datasets).
   */
  iconExpanded = input<string>("");
  /**
   * Geeft aan of het inklap/uitklap icon rechts uitgelijnd moet worden. Default is true (wordt doorgegeven aan alle datasets).
   */
  iconAlignRight = input<boolean>(false);
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer disabled is (wordt doorgegeven aan alle datasets).
   */
  iconDisabled = input<string>("");
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer zichtbaar is (wordt doorgegeven aan alle datasets).
   */
  iconChecked = input<string>("");
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer niet zichtbaar is (wordt doorgegeven aan alle datasets).
   */
  iconUnchecked = input<string>("");
  /**
   * CSS‑class naam van het icoon dat getoond wordt voor de info url, indien opgegeven (wordt doorgegeven aan alle datasets).
   */
  iconInfoUrl = input<string>("");
  /**
   * Wanneer true, dan wordt de dataset-tree als 1 lange lijst van layers weergegeven zonder theme/datasetnamen (wordt doorgegeven aan alle datasets)
   */
  hideTree = input<boolean>(false);
  /**
   * Optioneel Angular template waarmee het standaard layer‑label kan worden overschreven (wordt doorgegeven aan alle datasets).
   */
  layerLabelComponent = input<TemplateRef<any> | undefined>(undefined);
  /**
   * Optioneel Angular template waarmee het standaard dataset‑label kan worden overschreven (wordt doorgegeven aan alle datasets).
   */
  datasetLabelComponent = input<TemplateRef<any> | undefined>(undefined);
  /**
   * Wanneer true, dan wordt de dataset-tree bij initialisatie uitgeklapt weergegeven (wordt doorgegeven aan alle datasets).
   */
  expandTreeOnInit = input<boolean>(false);
  /**
   * Wanneer true, dan worden alle theme namen weggelaten in de tree en worden alleen datasets weergegeven
   */
  showOnlyDatasets = input<boolean>(false);
  /**
   * Marker voor child‑themes binnen de recursieve boomstructuur.
   */
  child = input<boolean>(false);
  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   */
  layerEnabledCallback = input<LayerEnabledCallback | null>(null);
  /**
   * Index van de kaart waarop deze layer wordt bijgehouden (wordt doorgegeven aan alle datasets).
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   */
  mapIndex = input<string>(DEFAULT_MAPINDEX);

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  viewerType = input<ViewerType>(ViewerType.TWEE_D);

  /**
   * Wanneer ingesteld op `true`, verwerkt de component de layerChangedEvents vanuit de GgcLayerService zelf als een layer veranderd van dezelfde mapIndex.
   * Dit gaat dan over de weergegeven titel van de laag en de weergegeven status of de laag aangezet, uitgezet of en/disabled is.
   * Bij `false` worden de events niet intern afgehandeld en zal dit zelf geprogrammeerd moeten worden.
   */
  autoConnectLayerStatus = input<boolean>(true);

  /**
   * Wanneer ingesteld op `true`, zal de dataset-tree automatisch lagen aan- of uitzetten in het 2D of 3D map component met dezelfde mapIndex als deze worden getoggled in de dataset-tree.
   * Bij `false` worden de kaartlagen niet automatisch aan- of uitgezet in de kaart en zal dit zelf geprogrammeerd moeten worden.
   * Hiervoor kan dan de output events worden gebruikt.
   */
  autoConnectLayerToggle = input<boolean>(true);

  /**
   * Geeft de huidige lijst van themes terug.
   */
  themes = input<Theme[]>([]);

  private readonly coreDatasetTreeService = inject(CoreDatasetTreeService);
  private readonly datasetTreeMapConnectService = inject(
    DatasetTreeMapConnectService
  );

  readonly layerCounts = signal(new Map<Theme, LayerCounts>());

  constructor() {
    effect(() => {
      if (this.expandTreeOnInit()) {
        this.expandThemes();
      }

      void this.refreshAllLayerCounts();
    });

    effect(async (onCleanup) => {
      const observable =
        await this.datasetTreeMapConnectService.getLayerChangedObservable(
          this.viewerType()
        );

      const subscription = observable?.subscribe(async (event) => {
        if (event.mapIndex !== this.mapIndex()) {
          return;
        }

        await this.refreshThemeContainingLayer(event.layerId);
      });

      onCleanup(() => subscription?.unsubscribe());
    });
  }

  createNewIndex(themeIndex: number): string {
    return `${this.themeNameIndex()}-${themeIndex}`;
  }

  readonly countStrings = computed(() => {
    const counts = this.layerCounts();

    return new Map(
      this.themes().map((theme) => {
        const count = counts.get(theme);

        const active = count?.active ?? 0;
        const total = count?.total ?? 0;

        const text = `(${
          this.showActiveCounters() && active > 0 ? `${active}/` : ""
        }${total})`;

        return [theme, text];
      })
    );
  });

  protected generateCountString(theme: Theme): string {
    return this.countStrings().get(theme) ?? "(0)";
  }

  protected getActiveLayerCount(theme: Theme): number {
    return this.layerCounts().get(theme)?.active ?? 0;
  }

  private expandThemes(): void {
    this.themes().forEach((theme) => (theme.open = true));
  }

  private async refreshThemeContainingLayer(layerId: string): Promise<void> {
    for (const theme of this.themes()) {
      if (theme.containsLayerId(layerId)) {
        await this.refreshTheme(theme);
      }
    }
  }

  private async refreshAllLayerCounts(): Promise<void> {
    const map = new Map<Theme, LayerCounts>();

    for (const theme of this.themes()) {
      map.set(theme, {
        active: await this.coreDatasetTreeService.countActiveDatasetsOfTheme(
          theme,
          this.mapIndex(),
          this.viewerType()
        ),
        total: this.coreDatasetTreeService.countAllDatasetsOfTheme(theme)
      });
    }

    this.layerCounts.set(map);
  }

  private async refreshTheme(theme: Theme): Promise<void> {
    const map = new Map(this.layerCounts());

    map.set(theme, {
      active: await this.coreDatasetTreeService.countActiveDatasetsOfTheme(
        theme,
        this.mapIndex(),
        this.viewerType()
      ),
      total: this.coreDatasetTreeService.countAllDatasetsOfTheme(theme)
    });

    this.layerCounts.set(map);
  }
}
