import {
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { Dataset } from "../../model/theme/dataset.model";

import { NgClass, NgTemplateOutlet } from "@angular/common";
import { LayerToggleComponent } from "../layer-toggle/layer-toggle.component";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { ViewerType } from "@kadaster/ggc-models";
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
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass, NgTemplateOutlet, LayerToggleComponent]
})
export class LayerSelectorComponent implements OnInit {
  /**
   * Identifier van het geselecteerde theme waarin deze datasets zich bevinden.
   * Wordt gebruikt voor label‑context, counters of styling op theme‑niveau.
   */
  @Input() themeIndex: string;
  /**
   * Lijst van datasets die onder dit theme vallen
   */
  @Input() datasets: Dataset[] = [];
  /**
   * Wanneer `true`, worden active/all counters toont bij elke dataset.
   */
  @Input() showActiveCounters = true;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset ingeklapt is.
   */
  @Input() iconCollapsed: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset opengeklapt is.
   */
  @Input() iconExpanded: string;
  /**
   * Geeft aan of het inklap/uitklap icon rechts uitgelijnd moet worden. Default is true.
   */
  @Input() iconAlignRight: boolean;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer disabled is (wordt doorgegeven aan alle layers).
   */
  @Input() iconDisabled: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer zichtbaar is (wordt doorgegeven aan alle layers).
   */
  @Input() iconChecked: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer niet zichtbaar is (wordt doorgegeven aan alle layers).
   */
  @Input() iconUnchecked: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt voor de info url, indien opgegeven.
   */
  @Input() iconInfoUrl: string;
  /**
   * Wanneer true, dan wordt de dataset-tree als 1 lange lijst van layers weergegeven zonder theme/datasetnamen
   */
  @Input() hideTree: boolean;
  /**
   * Optioneel Angular template waarmee het standaard layer‑label kan worden overschreven (wordt doorgegeven aan alle layers).
   */
  @Input() layerLabelComponent?: TemplateRef<any>;
  /**
   * Optioneel Angular template waarmee het standaard dataset‑label kan worden overschreven.
   */
  @Input() datasetLabelComponent?: TemplateRef<any>;
  /**
   * Wanneer true, dan wordt de dataset-tree bij initialisatie uitgeklapt weergegeven.
   */
  @Input() expandTreeOnInit: boolean;
  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   */
  @Input() layerEnabledCallback: LayerEnabledCallback;
  /**
   * Index van de kaart waarop deze layer wordt bijgehouden (wordt doorgegeven aan alle layers).
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   */
  @Input() mapIndex: string;
  /**
   * Wanneer ingesteld op `true`, verwerkt de component de layerChangedEvents vanuit de GgcLayerService zelf als een layer veranderd van dezelfde mapIndex.
   * Dit gaat dan over de weergegeven titel van de laag en de weergegeven status of de laag aangezet, uitgezet of en/disabled is.
   * Bij `false` worden de events niet intern afgehandeld en zal dit zelf geprogrammeerd moeten worden.
   */
  @Input() autoConnectLayerStatus = true;
  /**
   * Wanneer ingesteld op `true`, zal de dataset-tree automatisch lagen aan- of uitzetten in het 2D of 3D map component met dezelfde mapIndex als deze worden getoggled in de dataset-tree.
   * Bij `false` worden de kaartlagen niet automatisch aan- of uitgezet in de kaart en zal dit zelf geprogrammeerd moeten worden.
   * Hiervoor kan dan de output events worden gebruikt.
   */
  @Input() autoConnectLayerToggle = true;

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  @Input() viewerType = ViewerType.TWEE_D;

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
    if (!this.datasets) {
      this.datasets = [];
    }
    if (this.expandTreeOnInit) {
      this.datasets.forEach((dataset) => (dataset.open = true));
    }
    (
      await this.datasetTreeMapConnectService.getLayerChangedObservable(
        this.viewerType
      )
    )?.subscribe((event) => {
      if (event.mapIndex == this.mapIndex) {
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
      this.showActiveCounters && activeCount > 0 ? activeCount + "/" : "";
    return "(" + activeCountersString + totalCount + ")";
  }

  private async handleLayerChanged(layerId: string) {
    for (const dataset of this.datasets) {
      if (dataset.containsLayerId(layerId)) {
        await this.updateLayerCountOfDataset(dataset);
      }
    }
  }

  private async updateAllLayerCounts() {
    for (const dataset of this.datasets) {
      await this.updateLayerCountOfDataset(dataset);
    }
  }

  private async updateLayerCountOfDataset(dataset: Dataset) {
    this.activeLayerCount.set(
      dataset,
      await this.datasetTreeService.countActiveLayersOfDataset(
        dataset,
        this.mapIndex,
        this.viewerType
      )
    );
    this.totalLayerCount.set(
      dataset,
      this.datasetTreeService.countAllLayersOfDataset(dataset)
    );
  }
}
