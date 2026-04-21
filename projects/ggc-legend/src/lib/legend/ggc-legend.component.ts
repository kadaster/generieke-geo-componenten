import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output
} from "@angular/core";
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

/**
 * Het dataset legenda component toont de legenda van kaartlagen
 * Het component ondersteunt verschillende legenda-types zoals iconenlijsten,
 * URL's naar legenda plaatjes en (mapbox) vector tile stijlen.
 * Door <ggc-legend></ggc-legend> op te nemen in de HTML kan de
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
 * Een datasetLegend kan van verschillende types zijn, zie hiervoor het dataset-
 * legend model ({@link Legend})
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
  @Input()
  collapsable = false;

  /**
   * Geeft aan of legendas als default uitgeklapt zijn of niet.
   * Heeft alleen effect als collapsable op true staat.
   */
  @Input()
  defaultExpanded = true;

  /**
   * CSS-class voor het icoon wanneer de legenda is ingeklapt.
   */
  @Input()
  iconCollapsed = "fas fa-angle-right";

  /**
   * CSS-class voor het icoon wanneer de legenda is uitgeklapt.
   */
  @Input()
  iconExpanded = "fas fa-angle-down";

  /**
   * Geeft aan of de namen van de legenda-items getoond moeten worden.
   */
  @Input()
  showLegendsName = true;

  /**
   * Geeft aan of een melding moet worden getoond wanneer er geen legenda beschikbaar is.
   */
  @Input()
  showEmptyLegendMessage = false;

  /**
   * Legenda's worden per default alleen weergegeven als de laag ook zichtbaar is in het huidige zoomniveau.
   * Mocht je legenda's altijd willen tonen,ongeacht het zoomniveau, dan kan deze input op true gezet worden.
   */
  @Input()
  alwaysEnableLegends = false;

  /**
   * Event dat wordt afgegeven wanneer de lijst van legenda's verandert.
   */
  @Output()
  legendsChange: EventEmitter<Legend[]> = new EventEmitter<Legend[]>();

  /**
   * Tekst die wordt getoond wanneer er geen legenda beschikbaar is en showEmptyLegendMessage = true
   */
  @Input()
  emptyLegendMessage = "Geen legenda beschikbaar";

  /** Interne opslag van de legenda's. */
  private _legends: Legend[] = [];

  /** Service voor het beheren van legenda-acties. */
  private readonly coreLegendService = inject(CoreLegendService);
  private readonly legendMapConnectService = inject(GgcLegendMapConnectService);

  private _mapIndex = DEFAULT_MAPINDEX;
  private _viewerType: ViewerType = ViewerType.TWEE_D;

  /**
   * Haalt de huidige lijst van legenda's op.
   */
  get legends(): Legend[] {
    return this._legends;
  }

  /**
   * Stelt de lijst van legenda's in.
   * @param value Nieuwe lijst van legenda's.
   */
  @Input()
  set legends(value: Legend[]) {
    if (!value) return;
    this._legends = value;
  }

  /**
   * De mapIndex die hoort bij deze legend. Deze legenda reageert automatisch op events van de maps met dezelfde mapIndex.
   */
  @Input()
  get mapIndex(): string {
    return this._mapIndex;
  }

  set mapIndex(mapIndex: string) {
    if (this.viewerType === ViewerType.TWEE_D) {
      this._mapIndex = mapIndex;
    }
  }

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  @Input()
  get viewerType(): string {
    return this._viewerType;
  }

  set viewerType(viewerType: ViewerType) {
    this._viewerType = viewerType;
    if (this.viewerType === ViewerType.DRIE_D) {
      this._mapIndex = DEFAULT_CESIUM_MAPINDEX;
    }
  }

  /**
   * Initialisatie van het component.
   * Abonneert op events om alle legenda's in of uit te klappen.
   */
  ngOnInit() {
    this.coreLegendService.expandAll$.subscribe(
      (datasetLegenToggle: DatasetLegendToggle) => {
        this.toggleAllLegends(datasetLegenToggle);
      }
    );
    void this.initialise();
  }

  /**
   * Voegt de meegegeven layer-legenda toe aan dit legenda component.
   * Nieuwe legenda's worden standaard bovenaan toegevoegd.
   * Als naam wordt de serviceTitle en anders de layerTitle gebruikt. Mocht er al een legenda zijn met dezelfde naam, dan worden deze samen gegroepeerd.
   * @param legend De legenda om toe te voegen
   */
  addLegend(legend: LayerLegend) {
    const datasetLegendNew: Legend = {
      name: legend.serviceTitle ?? legend.layerTitle ?? "",
      expanded: this.defaultExpanded,
      layerLegends: [legend]
    };
    const indexExistingLegend = this._legends.findIndex((datasetLegend) => {
      return datasetLegend.name == datasetLegendNew.name;
    });
    if (indexExistingLegend >= 0) {
      this._legends.at(indexExistingLegend)?.layerLegends?.unshift(legend);
      this._legends
        .at(indexExistingLegend)
        ?.layerLegends?.sort(this.sortLayerLegends);
    } else {
      this._legends.unshift(datasetLegendNew);
    }
    this._legends.sort(this.sortDatasetLegends);
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
   * Verwijder alle legenda's van het opgegeven layerId.
   * @param layerId Van dit layerId worden alle legenda's verwijderd.
   */
  removeLegend(layerId: string) {
    const remainingDatasetLegends = [];
    for (const datasetLegend of this._legends) {
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
    this._legends = remainingDatasetLegends;
  }

  /**
   * Wisselt de status (ingeklapt/uitgeklapt) van een specifieke legenda.
   * @param legend De legenda die moet worden gewisseld.
   */
  public toggleLegend(legend: Legend): void {
    if (this.collapsable) {
      this.toggleLegendInternal(legend);
    } else {
      console.warn(
        "Set DatasetLegendComponent.collapsable = true om legends in of uit te klappen."
      );
    }
  }

  /**
   * Wisselt alle legenda's op basis van een toggle-event.
   * @param datasetLegendToggle Toggle-informatie.
   */
  private toggleAllLegends(datasetLegendToggle: DatasetLegendToggle): void {
    if (
      this._legends != null &&
      Array.isArray(this._legends) &&
      this.mapIndex === datasetLegendToggle.mapIndex
    ) {
      for (const legend of this._legends) {
        legend.expanded = datasetLegendToggle.expanded;
      }
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
    if (this.collapsable && (!keyboardEvent || keyboardEvent.key === "Enter")) {
      legend.expanded = !legend.expanded;
      this.legendsChange.emit(this._legends);
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

  private async initialise() {
    await this.subscribeToZoomendObservable();
    await this.subscribeToLegendAddedObservable();
    await this.subscribeToLegendRemovedObservable();
    await this.applyCurrentActiveLegends();
  }

  private async subscribeToZoomendObservable() {
    const zoomendObservable =
      await this.legendMapConnectService.getZoomendObservableForMap(
        this.mapIndex
      );
    zoomendObservable.subscribe(async () => {
      await this.updateEnabledLayerLegends();
    });
  }

  private async subscribeToLegendAddedObservable() {
    const LegendAddedObservable =
      await this.legendMapConnectService.getLegendAddedObservable();
    LegendAddedObservable.subscribe((event) => {
      if (this.mapIndex == event.mapIndex && event.legend) {
        this.addLegend(event.legend);
      }
    });
  }

  private async subscribeToLegendRemovedObservable() {
    const LegendRemovedObservable =
      await this.legendMapConnectService.getLegendRemovedObservable();
    LegendRemovedObservable.subscribe((event) => {
      if (this.mapIndex == event.mapIndex) {
        this.removeLegend(event.layerId);
      }
    });
  }

  private async applyCurrentActiveLegends() {
    const currentLegends =
      await this.legendMapConnectService.getCurrentActiveLegends(this.mapIndex);
    currentLegends.forEach((legend) => {
      this.addLegend(legend);
    });
  }

  private async updateEnabledLayerLegends() {
    for (const datasetLegend of this._legends) {
      for (const layerLegend of datasetLegend.layerLegends ?? []) {
        layerLegend.layerEnabled =
          await this.legendMapConnectService.getEnabled(
            layerLegend.layerId,
            this.mapIndex
          );
      }
    }
  }
}
