import {
  AfterContentInit,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  TemplateRef
} from "@angular/core";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { GgcDatasetTreeModelCreateService } from "../../core/ggc-dataset-tree-model-create.service";
import { DatasetTreeEvent } from "../../model/dataset-tree-event.model";
import { Theme } from "../../model/theme/theme.model";
import { LayerLabelTemplateDirective } from "../directive/layer-label-template.directive";
import { DatasetLabelTemplateDirective } from "../directive/dataset-label-template.directive";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ThemeSelectorComponent } from "../theme-selector/theme-selector.component";
import { Dataset } from "../../model/theme/dataset.model";
import {
  DEFAULT_CESIUM_MAPINDEX,
  DEFAULT_MAPINDEX,
  ViewerType,
  WebserviceInitialisedEvent
} from "@kadaster/ggc-models";
import { LayerEnabledCallback } from "../../model/layer-enabled-callback.model";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../../model/theme/dataset-tree-webservice.model";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { from, switchMap } from "rxjs";

/**
 * Het root‑component van de dataset‑structuurboom. Dit component vormt de volledige boomstructuur
 * bestaande uit:
 *
 * - Themes (recursief)
 * - Hun onderliggende Datasets
 * - De Layers binnen die datasets
 *
 * Het component:
 * - verwerkt alle configuraties van het dataset‑structuurcomponent (icons, tellers, expand‑gedrag, showOnlyDatasets, enz.);
 * - converteert de aangeleverde dataset‑boom naar interne modellen via `GgcDatasetTreeModelCreateService`;
 * - levert **DatasetTreeEvents** via `(events)` output: `layerActivated` en `layerDeactivated`;
 * - ondersteunt **custom label templates** voor datasets en layers via content projection (`ContentChild`) van
 *   `LayerLabelTemplateDirective` en `DatasetLabelTemplateDirective`;
 * - ondersteunt `showOnlyDatasets`, waarbij alle themes worden samengevoegd tot één vlakke lijst datasets.
 *
 * @example
 * ```html
 * <ggc-dataset-tree
 *   [themes]="myThemes"
 *   [currentMapResolution]="mapResolution"
 *   (events)="handleEvent($event)">
 * </ggc-dataset-tree>
 * ```
 */
@Component({
  selector: "ggc-dataset-tree",
  templateUrl: "./ggc-dataset-tree.component.html",
  imports: [ThemeSelectorComponent]
})
export class GgcDatasetTreeComponent implements AfterContentInit {
  /**
   * Wanneer `true`, dan wordt het aantal actieve kaartlagen getoond bij elke dataset (wordt doorgegeven aan alle themes). Bij `false` wordt bij een thema alleen het aantal onderliggende datasets getoond.
   */
  showActiveCounters = input<boolean>(true);
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset opengeklapt is (wordt doorgegeven aan alle themes).
   */
  iconExpanded = input<string>("fas fa-angle-left");
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de dataset ingeklapt is (wordt doorgegeven aan alle themes).
   */
  iconCollapsed = input<string>("fas fa-angle-right");
  /**
   * Geeft aan of het inklap/uitklap icon rechts uitgelijnd moet worden. Default is true (wordt doorgegeven aan alle themes).
   */
  iconAlignRight = input<boolean>(true);
  /**
   * Wanneer true, dan wordt de dataset-tree als 1 lange lijst van layers weergegeven zonder theme/datasetnamen (wordt doorgegeven aan alle themes)
   */
  hideTree = input<boolean>(false);
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer disabled is (wordt doorgegeven aan alle themes).
   */
  iconDisabled = input<string>("fas fa-square icon");
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer niet zichtbaar is (wordt doorgegeven aan alle themes).
   */
  iconUnchecked = input<string>("far fa-square");
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer zichtbaar is (wordt doorgegeven aan alle themes).
   */
  iconChecked = input<string>("far fa-check-square");
  /**
   * CSS‑class naam van het icoon dat getoond wordt voor de info url, indien opgegeven (wordt doorgegeven aan alle themes).
   */
  iconInfoUrl = input<string>("fas fa-info-circle");
  /**
   * Wanneer true, dan wordt de dataset-tree bij initialisatie uitgeklapt weergegeven (wordt doorgegeven aan alle themes).
   */
  expandTreeOnInit = input<boolean>(false);
  /**
   * Wanneer true, dan worden alle theme namen weggelaten in de tree en worden alleen datasets weergegeven (wordt doorgegeven aan alle themes).
   */
  showOnlyDatasets = input<boolean>(false);
  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   */
  layerEnabledCallback = input<LayerEnabledCallback | null>(null);
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
   * Output stream voor alle DatasetTreeEvents (`layerActivated` / `layerDeactivated`).
   */
  readonly events = output<DatasetTreeEvent>();

  themes = input.required<Theme[]>();

  /**
   * Index van de kaart waarop deze tree wordt bijgehouden.
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   * Voor `viewerType = DRIE_D` wordt intern de Cesium-mapindex gebruikt.
   */
  mapIndex = input(DEFAULT_MAPINDEX);

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, `TWEE_D` (ol) of `DRIE_D` (cesium).
   */
  viewerType = input(ViewerType.TWEE_D);

  protected readonly layerLabelComponent = signal<TemplateRef<any> | undefined>(
    undefined
  );
  protected readonly datasetLabelComponent = signal<
    TemplateRef<any> | undefined
  >(undefined);

  protected readonly effectiveMapIndex = computed(() =>
    this.viewerType() === ViewerType.DRIE_D
      ? DEFAULT_CESIUM_MAPINDEX
      : this.mapIndex()
  );

  protected readonly processedThemes = linkedSignal(() => {
    const treeConfiguration = this.treeConfiguration();
    let themes = treeConfiguration.themes;

    if (treeConfiguration.showOnlyDatasets) {
      themes = [
        new Theme(
          "",
          themes.flatMap((theme: Theme) => this.getDatasetsFromTheme(theme))
        )
      ];
    }

    return this.modelCreateService.themeArrayFactory(themes);
  });

  private readonly treeConfiguration = computed(() => ({
    themes: this.themes(),
    showOnlyDatasets: this.showOnlyDatasets(),
    viewerType: this.viewerType(),
    mapIndex: this.mapIndex()
  }));

  private readonly datasetTreeService = inject(CoreDatasetTreeService);
  private readonly modelCreateService = inject(
    GgcDatasetTreeModelCreateService
  );
  private readonly datasetTreeMapConnectService = inject(
    DatasetTreeMapConnectService
  );

  private readonly layerLabelTemplate = contentChild(
    LayerLabelTemplateDirective
  );

  private readonly datasetLabelTemplate = contentChild(
    DatasetLabelTemplateDirective
  );

  constructor() {
    this.datasetTreeService
      .getEventsObservable()
      .pipe(takeUntilDestroyed())
      .subscribe((datasetTreeEvent) => this.events.emit(datasetTreeEvent));

    effect((onCleanup) => {
      const treeConfiguration = this.treeConfiguration();
      if (
        treeConfiguration.viewerType !== ViewerType.TWEE_D ||
        !this.hasServiceId(treeConfiguration.themes)
      ) {
        return;
      }

      const subscription = from(
        this.datasetTreeMapConnectService.getWebserviceInitialisedObservable(
          treeConfiguration.mapIndex
        )
      )
        .pipe(switchMap((observable) => observable))
        .subscribe((event) => this.addInitialisedLayers(event));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /**
   * Angular lifecycle hook — initialiseert content‑templates
   * voor dataset‑ en layer‑labels (via @ContentChild).
   */
  ngAfterContentInit(): void {
    const layerLabelTemplate = this.layerLabelTemplate();
    if (layerLabelTemplate) {
      this.layerLabelComponent.set(layerLabelTemplate.templateRef);
    }
    const datasetLabelTemplate = this.datasetLabelTemplate();
    if (datasetLabelTemplate) {
      this.datasetLabelComponent.set(datasetLabelTemplate.templateRef);
    }
  }

  private getDatasetsFromTheme(theme: Theme): Dataset[] {
    return [
      ...(theme.datasets ?? []),
      ...(theme.themes ?? []).flatMap((childTheme) =>
        this.getDatasetsFromTheme(childTheme)
      )
    ];
  }

  private hasServiceId(themes: Theme[] = []): boolean {
    return themes.some(
      (theme) =>
        (theme.datasets ?? []).some((dataset) =>
          dataset.services.some((service) => !!service.serviceId)
        ) || this.hasServiceId(theme.themes ?? [])
    );
  }

  private addInitialisedLayers(event: WebserviceInitialisedEvent): void {
    if (
      !event.serviceId ||
      this.viewerType() !== ViewerType.TWEE_D ||
      event.mapIndex !== this.mapIndex()
    ) {
      return;
    }

    this.processedThemes.update((themes) => {
      const changed = themes
        .map((theme) => this.updateThemeLayers(theme, event))
        .some(Boolean);
      return changed ? [...themes] : themes;
    });
  }

  private updateThemeLayers(
    theme: Theme,
    event: WebserviceInitialisedEvent
  ): boolean {
    const datasetsChanged = theme.datasets
      .map((dataset) => this.updateDatasetLayers(dataset, event))
      .some(Boolean);
    if (datasetsChanged) {
      theme.datasets = [...theme.datasets];
    }

    const childThemesChanged = theme.themes
      .map((childTheme) => this.updateThemeLayers(childTheme, event))
      .some(Boolean);
    if (childThemesChanged) {
      theme.themes = [...theme.themes];
    }

    return datasetsChanged || childThemesChanged;
  }

  private updateDatasetLayers(
    dataset: Dataset,
    event: WebserviceInitialisedEvent
  ): boolean {
    const servicesChanged = dataset.services
      .map((service) => this.addInitialisedLayersToService(service, event))
      .some(Boolean);
    if (servicesChanged) {
      dataset.services = [...dataset.services];
    }
    return servicesChanged;
  }

  private addInitialisedLayersToService(
    service: DatasetTreeWebservice,
    event: WebserviceInitialisedEvent
  ): boolean {
    if (service.serviceId !== event.serviceId) {
      return false;
    }

    const layerIds = new Set(service.layers?.map((layer) => layer.layerId));
    const addedLayers: DatasetTreeLayer[] = [];
    for (const layerId of event.layerIds ?? []) {
      if (layerId && !layerIds.has(layerId)) {
        layerIds.add(layerId);
        addedLayers.push(new DatasetTreeLayer(layerId));
      }
    }
    if (addedLayers.length === 0) {
      return false;
    }

    service.layers = [...(service.layers ?? []), ...addedLayers];
    return true;
  }
}
