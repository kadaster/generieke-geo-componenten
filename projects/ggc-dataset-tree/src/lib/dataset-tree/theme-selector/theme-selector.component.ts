import { Component, inject, Input, OnInit, TemplateRef } from "@angular/core";
import { Theme } from "../../model/theme/theme.model";
import { LayerSelectorComponent } from "../layer-selector/layer-selector.component";
import { CommonModule } from "@angular/common";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { ViewerType } from "@kadaster/ggc-models";
import { LayerEnabledCallback } from "../../model/layer-enabled-callback.model";

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
export class ThemeSelectorComponent implements OnInit {
  /**
   * Unieke index die gelijk is aan de themeIndex binnen de boomstructuur van de json. Wordt gebruikt om child themes te indexeren.
   */
  @Input() themeNameIndex = "";
  /**
   * Wanneer `true`, worden active/all counters toont bij elke dataset (wordt doorgegeven aan alle datasets).
   */
  @Input() showActiveCounters = true;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset ingeklapt is (wordt doorgegeven aan alle datasets).
   */
  @Input() iconCollapsed: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset opengeklapt is (wordt doorgegeven aan alle datasets).
   */
  @Input() iconExpanded: string;
  /**
   * Geeft aan of het inklap/uitklap icon rechts uitgelijnd moet worden. Default is true (wordt doorgegeven aan alle datasets).
   */
  @Input() iconAlignRight: boolean;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer disabled is (wordt doorgegeven aan alle datasets).
   */
  @Input() iconDisabled: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer zichtbaar is (wordt doorgegeven aan alle datasets).
   */
  @Input() iconChecked: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer niet zichtbaar is (wordt doorgegeven aan alle datasets).
   */
  @Input() iconUnchecked: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt voor de info url, indien opgegeven (wordt doorgegeven aan alle datasets).
   */
  @Input() iconInfoUrl: string;
  /**
   * Wanneer true, dan wordt de dataset-tree als 1 lange lijst van layers weergegeven zonder theme/datasetnamen (wordt doorgegeven aan alle datasets)
   */
  @Input() hideTree: boolean;
  /**
   * Optioneel Angular template waarmee het standaard layer‑label kan worden overschreven (wordt doorgegeven aan alle datasets).
   */
  @Input() layerLabelComponent?: TemplateRef<any>;
  /**
   * Optioneel Angular template waarmee het standaard dataset‑label kan worden overschreven (wordt doorgegeven aan alle datasets).
   */
  @Input() datasetLabelComponent?: TemplateRef<any>;
  /**
   * Wanneer true, dan wordt de dataset-tree bij initialisatie uitgeklapt weergegeven (wordt doorgegeven aan alle datasets).
   */
  @Input() expandTreeOnInit: boolean;
  /**
   * Wanneer true, dan worden alle theme namen weggelaten in de tree en worden alleen datasets weergegeven
   */
  @Input() showOnlyDatasets: boolean;
  /**
   * Marker voor child‑themes binnen de recursieve boomstructuur.
   */
  @Input() child = false;
  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   */
  @Input() layerEnabledCallback: LayerEnabledCallback;
  /**
   * Index van de kaart waarop deze layer wordt bijgehouden (wordt doorgegeven aan alle datasets).
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   */
  @Input() mapIndex: string;

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  @Input() viewerType = ViewerType.TWEE_D;

  private _themes: Theme[];

  private readonly coreDatasetTreeService = inject(CoreDatasetTreeService);
  private readonly datasetTreeMapConnectService = inject(
    DatasetTreeMapConnectService
  );

  private readonly totalLayerCount: Map<Theme, number> = new Map();
  private readonly activeLayerCount: Map<Theme, number> = new Map();

  /**
   * Geeft de huidige lijst van themes terug.
   */
  get themes(): Theme[] {
    return this._themes;
  }

  /**
   * Setter voor themes.
   */
  @Input()
  set themes(themes: Theme[]) {
    this._themes = themes;
    if (this.expandTreeOnInit) {
      this.expandThemes();
    }
    this.updateAllLayerCounts();
  }

  /**
   * Genereert een nieuw indexpad voor child themes.
   * @param themeIndex - de index van de theme
   */
  createNewIndex(themeIndex: number): string {
    return `${this.themeNameIndex}-${themeIndex}`;
  }

  /**
   * Angular lifecycle hook — initialiseert open‑states:
   * - Wanneer `expandTreeOnInit === true`, worden alle themes geopend.
   */
  async ngOnInit() {
    (
      await this.datasetTreeMapConnectService.getLayerChangedObservable(
        this.viewerType
      )
    ).subscribe((event) => {
      if (event.mapIndex == this.mapIndex) {
        this.handleLayerChanged(event.layerId);
      }
    });
  }

  protected getActiveLayerCount(theme: Theme) {
    return this.activeLayerCount.get(theme) ?? 0;
  }

  protected generateCountString(theme: Theme) {
    const activeCount = this.activeLayerCount.get(theme) ?? 0;
    const totalCount = this.totalLayerCount.get(theme) ?? 0;
    const activeCountersString =
      this.showActiveCounters && activeCount > 0 ? activeCount + "/" : "";
    return "(" + activeCountersString + totalCount + ")";
  }

  private expandThemes() {
    this._themes.forEach((theme) => (theme.open = true));
  }

  private async handleLayerChanged(layerId: string) {
    for (const theme of this._themes) {
      if (theme.containsLayerId(layerId)) {
        await this.updateLayerCountOfTheme(theme);
      }
    }
  }

  private async updateAllLayerCounts() {
    for (const theme of this._themes) {
      await this.updateLayerCountOfTheme(theme);
    }
  }

  private async updateLayerCountOfTheme(theme: Theme) {
    this.activeLayerCount.set(
      theme,
      await this.coreDatasetTreeService.countActiveDatasetsOfTheme(
        theme,
        this.mapIndex,
        this.viewerType
      )
    );
    this.totalLayerCount.set(
      theme,
      this.coreDatasetTreeService.countAllDatasetsOfTheme(theme)
    );
  }
}
