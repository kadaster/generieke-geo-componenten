import { Component, inject, input, OnInit, TemplateRef } from "@angular/core";
import { Dataset } from "../../model/theme/dataset.model";

import { NgClass, NgTemplateOutlet } from "@angular/common";
import { LayerToggleComponent } from "../layer-toggle/layer-toggle.component";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { DEFAULT_MAPINDEX, ViewerType } from "@kadaster/ggc-models";
import { LayerEnabledCallback } from "../../model/layer-enabled-callback.model";

/**
 * Component dat binnen het dataset‑structuurcomponent verantwoordelijk is voor
 * het tonen en bedienen van datasets en hun onderliggende kaartlagen.
 *
 * Dit component:
 * - toont een lijst van **datasets** binnen een theme;
 * - ondersteunt **open‑ en dichtklappen** van datasets (collapse/expand);
 * - toont **kaartlagen** via `LayerToggleComponent`;
 * - toont optioneel **tellers** (active/all layers), conform `showActiveCounters`;
 */

@Component({
  selector: "ggc-layer-selector",
  templateUrl: "./layer-selector.component.html",
  styleUrls: ["./layer-selector.component.scss"],
  imports: [NgClass, NgTemplateOutlet, LayerToggleComponent]
})
export class LayerSelectorComponent implements OnInit {
  /**
   * Identifier van het geselecteerde theme waarin deze datasets zich bevinden.
   * Wordt gebruikt voor label‑context, counters of styling op theme‑niveau.
   */
  themeIndex = input<string>("");

  /**
   * Lijst van datasets die onder dit theme vallen
   */
  datasets = input<Dataset[]>([]);

  /**
   * Wanneer `true`, worden active/all counters toont bij elke dataset.
   */
  showActiveCounters = input<boolean>(true);

  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset ingeklapt is.
   */
  iconCollapsed = input<string>("");

  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset opengeklapt is.
   */
  iconExpanded = input<string>("");

  /**
   * Geeft aan of het inklap/uitklap icon rechts uitgelijnd moet worden. Default is true.
   */
  iconAlignRight = input<boolean>(false);

  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer disabled is (wordt doorgegeven aan alle layers).
   */
  iconDisabled = input<string>("");

  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer zichtbaar is (wordt doorgegeven aan alle layers).
   */
  iconChecked = input<string>("");

  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer niet zichtbaar is (wordt doorgegeven aan alle layers).
   */
  iconUnchecked = input<string>("");

  /**
   * CSS‑class naam van het icoon dat getoond wordt voor de info url, indien opgegeven.
   */
  iconInfoUrl = input<string>("");

  /**
   * Wanneer true, dan wordt de dataset-tree als 1 lange lijst van layers weergegeven zonder theme/datasetnamen
   */
  hideTree = input<boolean>(false);

  /**
   * Optioneel Angular template waarmee het standaard layer‑label kan worden overschreven (wordt doorgegeven aan alle layers).
   */
  layerLabelComponent = input<TemplateRef<any> | undefined>(undefined);

  /**
   * Optioneel Angular template waarmee het standaard dataset‑label kan worden overschreven.
   */
  datasetLabelComponent = input<TemplateRef<any> | undefined>(undefined);

  /**
   * Wanneer true, dan wordt de dataset-tree bij initialisatie uitgeklapt weergegeven.
   */
  expandTreeOnInit = input<boolean>(false);

  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   */
  layerEnabledCallback = input<LayerEnabledCallback | null>(null);
  /**
   * Index van de kaart waarop deze layer wordt bijgehouden (wordt doorgegeven aan alle layers).
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   */

  mapIndex = input<string>(DEFAULT_MAPINDEX);
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
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  viewerType = input<ViewerType>(ViewerType.TWEE_D);

  private readonly datasetTreeService = inject(CoreDatasetTreeService);
  private readonly datasetTreeMapConnectService = inject(
    DatasetTreeMapConnectService
  );

  private readonly totalLayerCount: Map<Dataset, number> = new Map();
  private readonly activeLayerCount: Map<Dataset, number> = new Map();

  /**
   * Angular lifecycle hook — initialiseert dataset‑configuraties:
   * - Zorgt dat `datasets` nooit `undefined` is
   * - Wanneer `expandTreeOnInit === true`, worden alle datasets geopend
   */

  async ngOnInit() {
    if (this.expandTreeOnInit()) {
      this.datasets().forEach((dataset) => (dataset.open = true));
    }
    (
      await this.datasetTreeMapConnectService.getLayerChangedObservable(
        this.viewerType()
      )
    )?.subscribe((event) => {
      if (event.mapIndex == this.mapIndex()) {
        this.handleLayerChanged(event.layerId);
      }
    });
    await this.updateAllLayerCounts();
  }

  /**
   * Toggle het open- of dichtklappen van een dataset
   * @param event - event dat binnenkomt
   * @param dataset - de dataset die getoggled is
   */
  toggleCollapse(event: any, dataset: Dataset) {
    if ((event.target as HTMLElement).tagName !== "A") {
      dataset.open = !dataset.open;
    }
  }

  protected getActiveLayerCount(dataset: Dataset) {
    return this.activeLayerCount.get(dataset) ?? 0;
  }

  protected generateCountString(dataset: Dataset) {
    const activeCount = this.activeLayerCount.get(dataset) ?? 0;
    const totalCount = this.totalLayerCount.get(dataset) ?? 0;
    const activeCountersString =
      this.showActiveCounters() && activeCount > 0 ? activeCount + "/" : "";
    return "(" + activeCountersString + totalCount + ")";
  }

  private async handleLayerChanged(layerId: string) {
    for (const dataset of this.datasets()) {
      if (dataset.containsLayerId(layerId)) {
        await this.updateLayerCountOfDataset(dataset);
      }
    }
  }

  private async updateAllLayerCounts() {
    for (const dataset of this.datasets()) {
      await this.updateLayerCountOfDataset(dataset);
    }
  }

  private async updateLayerCountOfDataset(dataset: Dataset) {
    this.activeLayerCount.set(
      dataset,
      await this.datasetTreeService.countActiveLayersOfDataset(
        dataset,
        this.mapIndex(),
        this.viewerType()
      )
    );
    this.totalLayerCount.set(
      dataset,
      this.datasetTreeService.countAllLayersOfDataset(dataset)
    );
  }
}
