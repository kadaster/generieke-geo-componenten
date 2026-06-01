import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import {
  ToolbarItemMeasureComponentEvent,
  ToolbarItemMeasureType
} from "../../event/toolbar-item-measure-event";
import { NgClass } from "@angular/common";
import { DEFAULT_MAPINDEX, MapComponentDrawTypes } from "@kadaster/ggc-models";
import { GgcToolbarConnectService } from "../../service/connect.service";
import { from } from "rxjs";

/**
 * Component voor meetfunctionaliteit binnen een `ggc-toolbar-item`.
 *
 * `ToolbarItemMeasureComponent` biedt standaard meetacties zoals lijn en polygon metingen,
 * inclusief bewerken, verplaatsen en wissen van metingen.
 *
 * ### Functionaliteit
 * - Activeert meetacties via `DrawService`.
 * - Ondersteunt instelbare iconen voor elke meetactie.
 * - Stuurt een `measureItemClicked` event uit bij elke actie.
 *
 * ### Inputs
 * - `mapIndex`: Naam van de kaart waarop gemeten wordt. Default is `DEFAULT_MAPINDEX`.
 * - `layer`: Naam van de kaartlaag waarin metingen worden opgeslagen. Default is `"measuring"`.
 * - Iconen: Voor elke meetactie is een instelbaar Font Awesome icoon beschikbaar.
 *
 * ### Output
 * - `measureItemClicked`: Event dat informatie bevat over de uitgevoerde meetactie.
 *
 * ### Voorbeeldgebruik
 * ```html
 * <ggc-toolbar-item-measure
 *   [mapIndex]="'customMap'"
 *   [layer]="'customMeasureLayer'"
 *   (measureItemClicked)="onMeasureAction($event)">
 * </ggc-toolbar-item-measure>
 * ```
 */
@Component({
  selector: "ggc-toolbar-item-measure",
  templateUrl: "./ggc-toolbar-item-measure.component.html",
  styleUrls: ["./ggc-toolbar-item-measure.component.scss"],
  imports: [NgClass]
})
export class GgcToolbarItemMeasureComponent {
  /** Naam van de kaart waarop gemeten wordt. */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  /** Naam van de laag waarin metingen worden opgeslagen. */
  @Input() layer = "measuring";

  /** Icoon voor de 'stop meten' knop. */
  @Input() stopIcon = "fal fa-mouse-pointer";

  /** Icoon voor de 'lijn meten' knop. */
  @Input() measureLineIcon = "fal fa-ruler-horizontal";

  /** Icoon voor de 'polygon meten' knop. */
  @Input() measurePolygonIcon = "fal fa-ruler-combined";

  /** Icoon voor de 'meetlaag wissen' knop. */
  @Input() deleteIcon = "fal fa-trash-alt";

  /** Icoon voor de 'meting verplaatsen' knop. */
  @Input() moveIcon = "fal fa-hand-paper";

  /** Icoon voor de 'meting bewerken' knop. */
  @Input() editIcon = "fal fa-pencil-alt";

  /**
   * Event dat wordt verstuurd wanneer een meetactie wordt uitgevoerd.
   * Bevat het type actie via `toolbarItemName`.
   */
  @Output() measureItemClicked: EventEmitter<ToolbarItemMeasureComponentEvent> =
    new EventEmitter<ToolbarItemMeasureComponentEvent>();

  /** Huidig actieve meetactie. */
  protected activeMeasure: "line" | "polygon" | "edit" | "move" | undefined;

  private readonly connectService = inject(GgcToolbarConnectService);

  private drawServicePromise?: Promise<any>;

  constructor() {
    this.resetActive();
  }

  private getDrawService(): Promise<any> {
    if (!this.drawServicePromise) {
      this.drawServicePromise = this.connectService.getDrawService();
    }
    return this.drawServicePromise;
  }

  /**
   * Start een lijnmeting.
   */
  measureLine() {
    from(this.getDrawService()).subscribe((drawService) => {
      if (drawService) {
        this.resetActive();
        this.activeMeasure = "line";
        drawService.startDraw(
          this.layer,
          MapComponentDrawTypes.LINESTRING,
          { showTotalLength: true },
          this.mapIndex
        );
        this.measureItemClicked.emit({
          toolbarItemName: ToolbarItemMeasureType.LINE
        });
      }
    });
  }

  /**
   * Start een polygonmeting.
   */
  measurePolygon() {
    from(this.getDrawService()).subscribe((drawService) => {
      if (drawService) {
        this.resetActive();
        this.activeMeasure = "polygon";
        drawService.startDraw(
          this.layer,
          MapComponentDrawTypes.POLYGON,
          { showArea: true },
          this.mapIndex
        );
        this.measureItemClicked.emit({
          toolbarItemName: ToolbarItemMeasureType.POLYGON
        });
      }
    });
  }

  /**
   * Stopt de actieve meetactie.
   */
  stopMeasure() {
    from(this.getDrawService()).subscribe((drawService) => {
      if (drawService) {
        this.resetActive();
        drawService.stopDraw(this.mapIndex);
        this.measureItemClicked.emit({
          toolbarItemName: ToolbarItemMeasureType.STOP
        });
      }
    });
  }

  /**
   * Start de verplaatsactie voor metingen.
   */
  move(): void {
    from(this.getDrawService()).subscribe((drawService) => {
      if (drawService) {
        this.activeMeasure = "move";
        drawService.startMove(this.layer, this.mapIndex);
        this.measureItemClicked.emit({
          toolbarItemName: ToolbarItemMeasureType.MOVE
        });
      }
    });
  }

  /**
   * Start de bewerkactie voor metingen.
   */
  edit(): void {
    from(this.getDrawService()).subscribe((drawService) => {
      if (drawService) {
        this.activeMeasure = "edit";
        drawService.startModify(this.layer, this.mapIndex);
        this.measureItemClicked.emit({
          toolbarItemName: ToolbarItemMeasureType.EDIT
        });
      }
    });
  }

  /**
   * Verwijdert alle metingen uit de laag.
   */
  eraseMeasureLayer() {
    from(this.getDrawService()).subscribe((drawService) => {
      if (drawService) {
        this.resetActive();
        drawService.clearLayer(this.layer, this.mapIndex);
        this.measureItemClicked.emit({
          toolbarItemName: ToolbarItemMeasureType.CLEAR
        });
      }
    });
  }

  /**
   * Reset de actieve meetactie.
   */
  private resetActive() {
    this.activeMeasure = undefined;
  }
}
