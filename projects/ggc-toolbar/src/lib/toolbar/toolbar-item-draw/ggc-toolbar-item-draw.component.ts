import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import {
  ToolbarItemDrawComponentEvent,
  ToolbarItemDrawType
} from "../../event/toolbar-item-draw-event";
import { NgClass } from "@angular/common";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { GgcToolbarConnectService } from "../../service/connect.service";

/**
 * Component voor tekenen op de kaart binnen een `ggc-toolbar-item`.
 *
 * `ToolbarItemDrawComponent` biedt standaard tekenfunctionaliteit zoals punt, lijn, cirkel, rechthoek en polygon tekenen.
 * Daarnaast ondersteunt het bewerken, verplaatsen en wissen van tekeningen.
 *
 * ### Functionaliteit
 * - Activeert tekenacties via `DrawService`.
 * - Ondersteunt instelbare iconen voor elke tekenactie.
 * - Stuurt een `drawItemClicked` event uit bij elke actie.
 *
 * ### Inputs
 * - `mapIndex`: Naam van de kaart waarop getekend wordt. Default is `DEFAULT_MAPINDEX`.
 * - `layer`: Naam van de kaartlaag waarin getekend wordt. Default is `"drawing"`.
 * - Iconen: Voor elke tekenactie is een instelbaar Font Awesome icoon beschikbaar.
 *
 * ### Output
 * - `drawItemClicked`: Event dat informatie bevat over de uitgevoerde tekenactie.
 *
 * ### Voorbeeldgebruik
 * ```html
 * <ggc-toolbar-item-draw
 *   [mapIndex]="'customMap'"
 *   [layer]="'customDrawingLayer'"
 *   (drawItemClicked)="onDrawAction($event)">
 * </ggc-toolbar-item-draw>
 * ```
 */

type DrawType = "Point" | "Line" | "Circle" | "Rectangle" | "Polygon";

@Component({
  selector: "ggc-toolbar-item-draw",
  templateUrl: "./ggc-toolbar-item-draw.component.html",
  styleUrls: ["./ggc-toolbar-item-draw.component.scss"],
  imports: [NgClass]
})
export class GgcToolbarItemDrawComponent {
  /** Naam van de kaart waarop getekend wordt. */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  /** Naam van de laag waarin getekend wordt. */
  @Input() layer = "drawing";

  /** Icoon voor de 'stop tekenen' knop. */
  @Input() stopIcon = "fal fa-mouse-pointer";

  /** Icoon voor de 'punt tekenen' knop. */
  @Input() drawIcon = "fas fa-circle";

  /** Icoon voor de 'lijn tekenen' knop. */
  @Input() drawLineIcon = "fal fa-project-diagram";

  /** Icoon voor de 'cirkel tekenen' knop. */
  @Input() drawCircleIcon = "fal fa-dot-circle";

  /** Icoon voor de 'rechthoek tekenen' knop. */
  @Input() drawRectangleIcon = "fal fa-vector-square";

  /** Icoon voor de 'polygon tekenen' knop. */
  @Input() drawPolygonIcon = "fal fa-draw-polygon";

  /** Icoon voor de 'tekenlaag wissen' knop. */
  @Input() deleteIcon = "fal fa-trash-alt";

  /** Icoon voor de 'tekening verplaatsen' knop. */
  @Input() moveIcon = "fal fa-hand-paper";

  /** Icoon voor de 'tekening bewerken' knop. */
  @Input() editIcon = "fal fa-pencil-alt";

  /**
   * Event dat wordt verstuurd wanneer een tekenactie wordt uitgevoerd.
   * Bevat het type actie via `toolbarItemName`.
   */
  @Output() drawItemClicked: EventEmitter<ToolbarItemDrawComponentEvent> =
    new EventEmitter<ToolbarItemDrawComponentEvent>();

  protected activeDraw: DrawType | "move" | "edit" | undefined;
  private readonly connectService = inject(GgcToolbarConnectService);

  private drawService: any;
  private mapComponentDrawTypes: any;

  constructor() {
    this.initDrawService();
  }

  private async initDrawService(): Promise<void> {
    await this.connectService.loadDrawService();
    await this.connectService.loadMapComponentDrawTypes();
    this.drawService = this.connectService.getDrawService();
    this.mapComponentDrawTypes = this.connectService.getMapComponentDrawTypes();
  }

  /**
   * Start een tekenactie van het opgegeven type.
   * @param type Het type tekenactie (Point, Line, Circle, Rectangle, Polygon).
   */
  draw(type: DrawType): void {
    if (this.drawService) {
      this.activeDraw = type;
      this.drawService.startDraw(
        this.layer,
        this.getMapComponentDrawType(type),
        {},
        this.mapIndex
      );
      this.drawItemClicked.emit({
        toolbarItemName: this.getToolbarItemDrawType(type)
      });
    }
  }

  /**
   * Start de verplaatsactie voor tekeningen.
   */
  move(): void {
    if (this.drawService) {
      this.activeDraw = "move";
      this.drawService.startMove(this.layer, this.mapIndex);
      this.drawItemClicked.emit({ toolbarItemName: ToolbarItemDrawType.MOVE });
    }
  }

  /**
   * Start de bewerkactie voor tekeningen.
   */
  edit(): void {
    if (this.drawService) {
      this.activeDraw = "edit";
      this.drawService.startModify(this.layer, this.mapIndex);
      this.drawItemClicked.emit({ toolbarItemName: ToolbarItemDrawType.EDIT });
    }
  }

  /**
   * Stopt de actieve tekenactie.
   */
  stopDrawing() {
    if (this.drawService) {
      this.activeDraw = undefined;
      this.drawService.stopDraw(this.mapIndex);
      this.drawItemClicked.emit({ toolbarItemName: ToolbarItemDrawType.STOP });
    }
  }

  /**
   * Verwijdert alle tekeningen uit de laag.
   */
  eraseDrawLayer() {
    if (this.drawService) {
      this.activeDraw = undefined;
      this.drawService.clearLayer(this.layer, this.mapIndex);
      this.drawItemClicked.emit({ toolbarItemName: ToolbarItemDrawType.CLEAR });
    }
  }

  private getMapComponentDrawType(type: DrawType) {
    if (this.mapComponentDrawTypes) {
      switch (type) {
        case "Circle":
          return this.mapComponentDrawTypes.CIRCLE;
        case "Line":
          return this.mapComponentDrawTypes.LINESTRING;
        case "Point":
          return this.mapComponentDrawTypes.POINT;
        case "Rectangle":
          return this.mapComponentDrawTypes.RECTANGLE;
        default:
          return this.mapComponentDrawTypes.POLYGON;
      }
    } else {
      return type;
    }
  }

  private getToolbarItemDrawType(type: DrawType) {
    switch (type) {
      case "Circle":
        return ToolbarItemDrawType.POLYGON;
      case "Line":
        return ToolbarItemDrawType.LINE;
      case "Point":
        return ToolbarItemDrawType.POINT;
      case "Rectangle":
        return ToolbarItemDrawType.RECTANGLE;
      default:
        return ToolbarItemDrawType.POLYGON;
    }
  }
}
