import {
  Component,
  inject,
  Input,
  OnInit,
  TemplateRef,
  OnDestroy
} from "@angular/core";
import { DatasetTreeLayer } from "../../model/theme/dataset-tree-webservice.model";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { Subscription } from "rxjs";
import { ViewerType } from "@kadaster/ggc-models";
import { LayerEnabledCallback } from "../../model/layer-enabled-callback.model";

/**
 * Component voor het tonen en bedienen van een enkele kaartlaag
 * binnen het dataset‑structuurcomponent.
 *
 * Dit component toont:
 * - de zichtbaarheid van een kaartlaag
 * - of de kaartlaag enabled is (actief in de huidige map resolutie)
 * - de titel van de kaartlaag
 * - optioneel een custom template voor het layer‑label
 *
 * Events binnen de dataset‑tree worden afgehandeld via de
 * CoreDatasetTreeService, waarmee layerActivated en layerDeactivated events
 * naar buiten worden gestuurd.
 */

@Component({
  selector: "ggc-layer-toggle",
  imports: [NgClass, NgTemplateOutlet],
  templateUrl: "./layer-toggle.component.html",
  styleUrl: "./layer-toggle.component.scss"
})
export class LayerToggleComponent implements OnInit, OnDestroy {
  /**
   * Index van de kaart waarop deze layer wordt bijgehouden.
   * Dit is dezelfde waarde als gebruikt binnen DatasetTreeEvents (mapIndex).
   */
  @Input() mapIndex: string;

  /**
   * Type kaartviewer waarmee de dataset-tree interacteert, TWEE_D (ol) of DRIE_D (cesium).
   * Default is TWEE_D
   */
  @Input() viewerType = ViewerType.TWEE_D;

  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer disabled is.
   */
  @Input() iconDisabled: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer zichtbaar is.
   */
  @Input() iconChecked: string;
  /**
   * CSS‑class naam van het icoon dat getoond wordt wanneer de layer niet zichtbaar is.
   */
  @Input() iconUnchecked: string;
  /**
   * Optioneel Angular template waarmee het standaard layer‑label kan worden overschreven.
   */
  @Input() layerLabelComponent?: TemplateRef<any>;
  /**
   * Callback waarmee je de door de dataset-tree berekende *enabled* status van een layer
   * optioneel kunt **overschrijven**.
   *
   * De dataset-tree bepaalt eerst `isEnabled` op basis van de huidige kaartstatus
   * (bijv. resolutie/zoom). Daarna wordt de callback aangeroepen met de berekende waarde.
   *
   * - Retourneer `true` of `false` om de uiteindelijke enabled-status te forceren.
   * - Retourneer `void`/`undefined` om de berekende waarde te laten staan.
   * - Mag async zijn (return Promise).
   *
   * @example
   * ```typescript
   * // Forceer een specifieke laag altijd disabled
   * const layerEnabledCallback: LayerEnabledCallback = ({ layer }) => {
   *   if (layer.layerId === "my-layer-id") {
   *     return false;
   *   }
   * };
   * ```
   *
   * @example
   * ```typescript
   * // Maak enablement afhankelijk van viewerType
   * const layerEnabledCallback: LayerEnabledCallback = async ({ viewerType, isEnabled }) => {
   *   if (viewerType === ViewerType.DRIE_D) {
   *     return false;
   *   }
   *   return isEnabled; // expliciet dezelfde waarde teruggeven mag ook
   * };
   * ```
   *
   * @param args.layer - De layer waar het om gaat.
   * @param args.mapIndex - Index/identifier van de map waarop de layer wordt beheerd.
   * @param args.viewerType - Viewer type (2D/3D) van de map.
   * @param args.isEnabled - De door de dataset-tree berekende enabled-status.
   * @returns `boolean` om te overschrijven, of `void` om niet te overschrijven.
   */
  @Input() layerEnabledCallback: LayerEnabledCallback;

  protected title: string;
  protected visible: boolean;
  protected enabled = true;

  private readonly datasetTreeService = inject(CoreDatasetTreeService);
  private readonly datasetTreeMapConnectService = inject(
    DatasetTreeMapConnectService
  );

  private _layer: DatasetTreeLayer;
  private zoomendSubscription: Subscription;
  private layerChangedSubscription: Subscription;
  private triggerSubscription: Subscription;

  /**
   * DatasetTreeLayer object zoals opgebouwd via het dataset‑structuurcomponent.
   * Wordt gebruikt voor:
   * - opslaan layerId (referentie naar kaartlaag)
   * - ophalen van titel
   * - ophalen van visibility
   * - zetten van visibility
   */
  @Input()
  set layer(layer: DatasetTreeLayer) {
    this._layer = layer;
  }

  get layer() {
    return this._layer;
  }

  /**
   * Angular lifecycle hook — initialiseert het component:
   * - leest de actuele enabled status uit de kaart;
   * - abonneert op zoom‑events (voor het updaten van zichtbaarheid in huidige resolutie);
   * - abonneert op LayerChangedEvent (voor het updaten van titel en zichtbaarheid);
   * - initialiseert titel en zichtbaarheid.
   */

  ngOnInit() {
    void this.initialize();
  }

  private async initialize() {
    await this.subscribeToZoomend();
    await this.subscribeToLayerChanged();
    await this.subscribeToTrigger();
    await this.updateTitleAndVisibility();
    await this.updateEnabled();
  }

  private async subscribeToZoomend() {
    this.zoomendSubscription = (
      await this.datasetTreeMapConnectService.getZoomendObservableForMap(
        this.mapIndex,
        this.viewerType
      )
    ).subscribe(async () => {
      await this.updateEnabled();
    });
  }

  private async subscribeToLayerChanged() {
    this.layerChangedSubscription = (
      await this.datasetTreeMapConnectService.getLayerChangedObservable(
        this.viewerType
      )
    ).subscribe(async (event) => {
      if (
        event.layerId == this._layer.layerId &&
        event.mapIndex == this.mapIndex
      ) {
        await this.updateTitleAndVisibility();
        await this.updateEnabled();
      }
    });
  }

  private async updateEnabled() {
    const computedEnabled =
      (await this.datasetTreeMapConnectService.getEnabled(
        this._layer.layerId,
        this.mapIndex,
        this.viewerType
      )) ?? true;

    let finalEnabled = computedEnabled;

    if (this.layerEnabledCallback) {
      const override = await this.layerEnabledCallback({
        layer: this._layer,
        mapIndex: this.mapIndex,
        viewerType: this.viewerType,
        isEnabled: computedEnabled
      });

      if (typeof override === "boolean") {
        finalEnabled = override;
      }
    }

    this.enabled = finalEnabled;
  }

  private async updateTitleAndVisibility() {
    this.title =
      (await this.datasetTreeMapConnectService.getTitle(
        this._layer.layerId,
        this.mapIndex,
        this.viewerType
      )) ?? this.title;
    this.visible =
      (await this.datasetTreeMapConnectService.isVisible(
        this._layer.layerId,
        this.mapIndex,
        this.viewerType
      )) ?? this.visible;
  }

  private async subscribeToTrigger() {
    this.triggerSubscription = this.datasetTreeMapConnectService
      .getTriggerObservable(this.mapIndex)
      .subscribe(async (mapIndex) => {
        if (mapIndex == this.mapIndex) {
          await this.updateEnabled();
          await this.updateTitleAndVisibility();
        }
      });
  }

  /**
   * Functie voor een klik op dit component
   * - Als de kaartlaag enabled is, dan wordt de visibility getoggled en wordt er een datasettree event ge-emit.
   */
  public async toggleVisibility() {
    if (this.enabled) {
      const updatedVisibility =
        await this.datasetTreeMapConnectService.toggleVisibility(
          this._layer.layerId,
          this.mapIndex,
          this.viewerType
        );

      if (updatedVisibility != undefined) {
        this.visible = updatedVisibility;
        this.datasetTreeService.emitDatasetTreeEvent(
          this._layer.layerId,
          this.mapIndex,
          updatedVisibility
        );
      }
    }
  }

  ngOnDestroy(): void {
    if (this.zoomendSubscription) {
      this.zoomendSubscription.unsubscribe();
    }
    if (this.layerChangedSubscription) {
      this.layerChangedSubscription.unsubscribe();
    }
    if (this.triggerSubscription) {
      this.triggerSubscription.unsubscribe();
    }
  }
}
