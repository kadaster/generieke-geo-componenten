import {
  AfterContentInit,
  Component,
  computed,
  ContentChild,
  inject,
  input,
  output,
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
  ViewerType
} from "@kadaster/ggc-models";
import { LayerEnabledCallback } from "../../model/layer-enabled-callback.model";

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
   * Output stream voor alle DatasetTreeEvents (layer activated/deactivated).
   */
  events = output<DatasetTreeEvent>();

  themes = input.required<Theme[]>();

  /**
   * Index van de kaart waarop deze layer wordt bijgehouden (wordt doorgegeven aan alle themes).
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   */
  mapIndex = input(DEFAULT_MAPINDEX);

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  viewerType = input(ViewerType.TWEE_D);

  protected layerLabelComponent?: TemplateRef<any>;
  protected datasetLabelComponent?: TemplateRef<any>;

  private readonly datasetTreeService = inject(CoreDatasetTreeService);
  private readonly modelCreateService = inject(
    GgcDatasetTreeModelCreateService
  );

  @ContentChild(LayerLabelTemplateDirective)
  private readonly layerLabelTemplate: LayerLabelTemplateDirective;

  @ContentChild(DatasetLabelTemplateDirective)
  private readonly datasetLabelTemplate: DatasetLabelTemplateDirective;

  protected processedThemes = computed(() => {
    let themes = this.themes();

    if (this.showOnlyDatasets()) {
      themes = [
        new Theme(
          "",
          themes.flatMap((theme: Theme) => this.getDatasetsFromTheme(theme))
        )
      ];
    }

    return this.modelCreateService.themeArrayFactory(themes);
  });

  protected readonly effectiveMapIndex = computed(() =>
    this.viewerType() === ViewerType.DRIE_D
      ? DEFAULT_CESIUM_MAPINDEX
      : this.mapIndex()
  );

  constructor() {
    this.datasetTreeService
      .getEventsObservable()
      .pipe(takeUntilDestroyed())
      .subscribe((datasetTreeEvent) => this.events.emit(datasetTreeEvent));
  }

  /**
   * Angular lifecycle hook — initialiseert content‑templates
   * voor dataset‑ en layer‑labels (via @ContentChild).
   */
  ngAfterContentInit(): void {
    if (this.layerLabelTemplate) {
      this.layerLabelComponent = this.layerLabelTemplate.templateRef;
    }
    if (this.datasetLabelTemplate) {
      this.datasetLabelComponent = this.datasetLabelTemplate.templateRef;
    }
  }

  private getDatasetsFromTheme(theme: Theme): Dataset[] {
    if (theme.themes && theme.themes.length > 0) {
      return theme.themes.flatMap((theme: Theme) =>
        this.getDatasetsFromTheme(theme)
      );
    }
    return theme.datasets;
  }
}
