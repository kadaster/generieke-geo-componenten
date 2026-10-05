import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  output,
  signal
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Legend } from "../model/legend.model";
import {
  CoreLegendService,
  DatasetLegendToggle
} from "./service/core-legend.service";
import { NgTemplateOutlet } from "@angular/common";
import { GgcLegendIconComponent } from "../legend-icon/ggc-legend-icon.component";
import { GgcLegendUrlComponent } from "../legend-url/ggc-legend-url.component";
import { LegendMapboxComponent } from "../legend-mapbox/legend-mapbox.component";
import { LegendEmptyComponent } from "../legend-empty/legend-empty.component";
import {
  DEFAULT_CESIUM_MAPINDEX,
  DEFAULT_MAPINDEX,
  IconList,
  LayerLegend,
  LegendType,
  LegendUrl,
  VectorTileStyle,
  ViewerType
} from "@kadaster/ggc-models";
import { GgcLegendMapConnectService } from "./service/legend-map-connect.service";
import { LayerLegendEnabledCallback } from "../model/layer-legend-enabled-callback.model";

/**
 * Het ggc-legend component toont de legenda van kaartlagen.
 * Het component ondersteunt verschillende legenda-types zoals iconenlijsten,
 * URL's naar legenda plaatjes en (mapbox) vector tile stijlen. Voor de verschillende types, zie {@link LegendType}.
 * Door `<ggc-legend></ggc-legend>` op te nemen in de HTML kan de
 * legenda worden gebruikt.
 *
 * @example
 * ```ts
 * <ggc-legend
 *   [legends]="legends"
 *   [showLegendsName]="false"
 *   [showEmptyLegendMessage]="true"
 *   [emptyLegendMessage]="'Legenda niet beschikbaar'"
 *   [collapsable]="true"
 * >
 * </ggc-legend>
 * ```
 * De verplichte variabele legends is een array van te tonen legenda's.
 *
 * @remarks
 * Standaard (`autoConnect = true`) verbindt het component zich automatisch met de
 * kaart (`ggc-map`/`ggc-map-3d`) met dezelfde `mapIndex`, en wordt `legends` intern gevuld
 * en bijgehouden op basis van de actieve kaartlagen. Handmatig een waarde toekennen aan
 * `legends` is dan niet nodig.
 *
 * Wil je de legenda's zelf samenstellen (bijvoorbeeld los van een kaart), zet dan
 * `autoConnect = false` en geef zelf een `Legend[]` mee, bijvoorbeeld:
 * ```ts
 * const legends: Legend[] = [
 *   {
 *     name: "Terugmeldingen",
 *     expanded: true,
 *     layerLegends: [
 *       {
 *         layerId: "terugmeldingen",
 *         legend: {
 *           legendUrl:
 *             "https://service.pdok.nl/brt/terugmeldingen/wms/v1_0/legend/brtterugmeldingen/brtterugmeldingen:terugmeldingen.png"
 *         }
 *       }
 *     ]
 *   },
 *   {
 *     name: "Status",
 *     layerLegends: [
 *       {
 *         layerId: "status",
 *         legend: [
 *           { imageUrl: "assets/icons/nieuw.svg", iconDescription: "Nieuw", text: "nieuw" },
 *           { imageUrl: "assets/icons/afgerond.svg", iconDescription: "Afgerond", text: "afgerond" }
 *         ]
 *       }
 *     ]
 *   }
 * ];
 * ```
 *
 */

@Component({
  selector: "ggc-legend",
  templateUrl: "./ggc-legend.component.html",
  imports: [
    GgcLegendIconComponent,
    GgcLegendUrlComponent,
    NgTemplateOutlet,
    LegendMapboxComponent,
    LegendEmptyComponent
  ],
  styleUrls: ["./ggc-legend.component.css"]
})
export class GgcLegendComponent implements OnInit {
  /**
   * Geeft aan of de legenda inklapbaar is.
   */
  collapsable = input(false);

  /**
   * Geeft aan of legendas als default uitgeklapt zijn of niet.
   * Heeft alleen effect als collapsable op true staat.
   */
  defaultExpanded = input(true);

  /**
   * CSS-class voor het icoon wanneer de legenda is ingeklapt.
   */
  iconCollapsed = input("fas fa-angle-right");

  /**
   * CSS-class voor het icoon wanneer de legenda is uitgeklapt.
   */
  iconExpanded = input("fas fa-angle-down");

  /**
   * Geeft aan of de namen van de legenda-items getoond moeten worden.
   */
  showLegendsName = input(true);

  /**
   * Geeft aan of een melding moet worden getoond wanneer er geen legenda beschikbaar is.
   */
  showEmptyLegendMessage = input(false);

  /**
   * Legenda's worden per default alleen weergegeven als de laag ook zichtbaar is in het huidige zoomniveau.
   * Mocht je legenda's altijd willen tonen,ongeacht het zoomniveau, dan kan deze input op true gezet worden.
   */
  alwaysEnableLegends = input(false);

  /**
   * Event dat wordt afgegeven wanneer de lijst van legenda's verandert.
   */
  readonly legendsChange = output<Legend[]>();

  /**
   * Tekst die wordt getoond wanneer er geen legenda beschikbaar is en showEmptyLegendMessage = true
   */
  emptyLegendMessage = input("Geen legenda beschikbaar");
  /** Service voor het beheren van legenda-acties. */

  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   */
  layerLegendEnabledCallback = input<LayerLegendEnabledCallback>();

  /**
   * Bepaalt of events automatisch intern worden afgehandeld binnen de component.
   *
   * @remarks
   * Standaardwaarde: `true`.
   *
   * Wanneer ingesteld op `true`, verwerkt de component de events zelf.
   * Bij `false` worden de events niet intern afgehandeld en wordt verwacht
   * dat de parent-component deze afhandeling verzorgt.
   */
  autoConnect = input(true);

  legends = input<Legend[]>([]);

  mapIndex = input(DEFAULT_MAPINDEX);

  viewerType = input<ViewerType>(ViewerType.TWEE_D);

  /** Interne opslag van de legenda's. */
  protected _legends = signal<Legend[]>([]);

  private readonly coreLegendService = inject(CoreLegendService);
  private readonly legendMapConnectService = inject(GgcLegendMapConnectService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly effectiveMapIndex = computed(() =>
    this.viewerType() === ViewerType.DRIE_D
      ? DEFAULT_CESIUM_MAPINDEX
      : this.mapIndex()
  );

  constructor() {
    effect(() => this._legends.set(this.legends() ?? []));
  }

  /**
   * Initialisatie van het component.
   * Abonneert op events om alle legenda's in of uit te klappen.
   */
  ngOnInit() {
    this.coreLegendService.expandAll$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((datasetLegenToggle: DatasetLegendToggle) => {
        this.toggleAllLegends(datasetLegenToggle);
      });
    if (this.autoConnect()) {
      void this.initialise();
    }
  }

  /**
   * Voegt de meegegeven layer-legenda toe aan dit legenda component.
   * Nieuwe legenda's worden standaard bovenaan toegevoegd.
   * Als naam wordt de serviceTitle en anders de layerTitle gebruikt. Mocht er al een legenda zijn met dezelfde naam, dan worden deze samen gegroepeerd.
   * Indien er geen legenda is meegegeven, maar wel een titel. Dan wordt de titel ook niet getoond indien `showEmptyLegendMessage = false`.
   * @param legend De legenda om toe te voegen
   */
  async addLegend(legend: LayerLegend) {
    if (
      !this.isLegendUrl(legend.legend) &&
      !this.isIconListArray(legend.legend) &&
      !this.isVectorTileStyle(legend.legend) &&
      !this.showEmptyLegendMessage()
    ) {
      return;
    }
    if (this.layerLegendEnabledCallback()) {
      const enabled = await this.layerLegendEnabledCallback()!({
        layerLegend: legend,
        mapIndex: this.effectiveMapIndex(),
        viewerType: this.viewerType()
      });
      if (typeof enabled === "boolean" && !enabled) {
        return;
      }
    }
    const datasetLegendNew: Legend = {
      name: legend.serviceTitle ?? legend.layerTitle ?? "",
      expanded: this.defaultExpanded(),
      layerLegends: [legend]
    };
    const indexExistingLegend = this._legends().findIndex((datasetLegend) => {
      return datasetLegend.name == datasetLegendNew.name;
    });
    if (indexExistingLegend >= 0) {
      this._legends().at(indexExistingLegend)?.layerLegends?.unshift(legend);
      this._legends()
        .at(indexExistingLegend)
        ?.layerLegends?.sort(this.sortLayerLegends);
    } else {
      this._legends().unshift(datasetLegendNew);
    }
    this._legends().sort(this.sortDatasetLegends);
    this._legends.set([...this._legends()]);
  }

  /**
   * Verwijder alle legenda's van het opgegeven layerId.
   * @param layerId Van dit layerId worden alle legenda's verwijderd.
   */
  removeLegend(layerId: string) {
    const remainingDatasetLegends = [];
    for (const datasetLegend of this._legends()) {
      const remainingLayerLegends = [];
      for (const layerLegend of datasetLegend.layerLegends ?? []) {
        if (layerLegend.layerId != layerId) {
          remainingLayerLegends.push(layerLegend);
        }
      }
      if (remainingLayerLegends.length > 0) {
        datasetLegend.layerLegends = remainingLayerLegends;
        remainingDatasetLegends.push(datasetLegend);
      }
    }
    this._legends.set(remainingDatasetLegends);
  }

  /**
   * Wisselt de status (ingeklapt/uitgeklapt) van een specifieke legenda.
   * @param legend De legenda die moet worden gewisseld.
   */
  public toggleLegend(legend: Legend): void {
    if (this.collapsable()) {
      this.toggleLegendInternal(legend);
    } else {
      console.warn(
        "Set DatasetLegendComponent.collapsable = true om legends in of uit te klappen."
      );
    }
  }

  /**
   * Interne methode om een legenda te toggelen, inclusief keyboard-ondersteuning.
   * @param legend De legenda die moet worden gewisseld.
   * @param keyboardEvent Optioneel keyboard-event (Enter activeert toggle).
   */
  protected toggleLegendInternal(
    legend: Legend,
    keyboardEvent: KeyboardEvent | undefined = undefined
  ): void {
    if (
      this.collapsable() &&
      (!keyboardEvent || keyboardEvent.key === "Enter")
    ) {
      legend.expanded = !legend.expanded;
      this.legendsChange.emit(this._legends());
    }
  }

  /**
   * Controleert of een legenda een lijst van iconen is.
   * @param legend Het te controleren legenda-object.
   * @returns True als het een IconList[] is.
   */
  protected isIconListArray(legend: LegendType): legend is IconList[] {
    return (
      Array.isArray(legend) && legend.length > 0 && "imageUrl" in legend[0]
    );
  }

  /**
   * Controleert of een legenda een URL-type is.
   * @param legend Het te controleren legenda-object.
   * @returns True als het een LegendUrl is.
   */
  protected isLegendUrl(legend: LegendType): legend is LegendUrl {
    return (
      typeof legend === "object" &&
      legend !== null &&
      "legendUrl" in legend &&
      legend.legendUrl !== ""
    );
  }

  /**
   * Controleert of een legenda een VectorTileStyle is.
   * @param legend Het te controleren legenda-object.
   * @returns True als het een VectorTileStyle is.
   */
  protected isVectorTileStyle(legend: LegendType): legend is VectorTileStyle {
    return (
      typeof legend === "object" &&
      legend !== null &&
      "name" in legend &&
      "url" in legend
    );
  }

  protected legendIsEnabled(legend: Legend) {
    for (const layerLegend of legend.layerLegends ?? []) {
      if (layerLegend.layerEnabled) {
        return true;
      }
    }
    return false;
  }

  private sortLayerLegends(l1: LayerLegend, l2: LayerLegend) {
    const aIndex = l1?.legendIndex ?? 0;
    const bIndex = l2?.legendIndex ?? 0;
    // Hogere index komt eerder in de lijst terecht
    return bIndex - aIndex;
  }

  private sortDatasetLegends(l1: Legend, l2: Legend) {
    const aIndex = l1.layerLegends?.[0]?.legendIndex ?? 0;
    const bIndex = l2.layerLegends?.[0]?.legendIndex ?? 0;
    // Hogere index komt eerder in de lijst terecht
    return bIndex - aIndex;
  }

  /**
   * Wisselt alle legenda's op basis van een toggle-event.
   * @param datasetLegendToggle Toggle-informatie.
   */
  private toggleAllLegends(datasetLegendToggle: DatasetLegendToggle): void {
    if (
      this._legends() != null &&
      Array.isArray(this._legends()) &&
      this.effectiveMapIndex() === datasetLegendToggle.mapIndex
    ) {
      for (const legend of this._legends()) {
        legend.expanded = datasetLegendToggle.expanded;
      }
      this._legends.update((legends) => [...legends]);
    }
  }

  private async initialise() {
    await this.subscribeToZoomendObservable();
    await this.subscribeToLegendAddedObservable();
    await this.subscribeToLegendRemovedObservable();
    await this.applyCurrentActiveLegends();
  }

  private async subscribeToZoomendObservable() {
    const zoomendObservable =
      await this.legendMapConnectService.getZoomendObservableForMap(
        this.effectiveMapIndex()
      );
    zoomendObservable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async () => {
        await this.updateEnabledLayerLegends();
      });
  }

  private async subscribeToLegendAddedObservable() {
    const legendAddedObservable =
      await this.legendMapConnectService.getLegendAddedObservable();
    legendAddedObservable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (this.effectiveMapIndex() == event.mapIndex && event.legend) {
          this.addLegend(event.legend);
        }
      });
  }

  private async subscribeToLegendRemovedObservable() {
    const legendRemovedObservable =
      await this.legendMapConnectService.getLegendRemovedObservable();
    legendRemovedObservable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (this.effectiveMapIndex() == event.mapIndex) {
          this.removeLegend(event.layerId);
        }
      });
  }

  private async applyCurrentActiveLegends() {
    const currentLegends =
      await this.legendMapConnectService.getCurrentActiveLegends(
        this.effectiveMapIndex()
      );
    currentLegends.forEach((legend) => {
      this.addLegend(legend);
    });
  }

  private async updateEnabledLayerLegends() {
    for (const datasetLegend of this._legends()) {
      for (const layerLegend of datasetLegend.layerLegends ?? []) {
        layerLegend.layerEnabled =
          await this.legendMapConnectService.getEnabled(
            layerLegend.layerId,
            this.effectiveMapIndex()
          );
      }
    }
    this._legends.update((legends) => [...legends]);
  }
}
