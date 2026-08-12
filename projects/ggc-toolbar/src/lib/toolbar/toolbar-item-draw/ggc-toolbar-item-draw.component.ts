import { Component, EventEmitter, inject, input, Output } from "@angular/core";
import {
  ToolbarItemDrawComponentEvent,
  ToolbarItemDrawType
} from "../../event/toolbar-item-draw-event";
import { NgClass } from "@angular/common";
import { DEFAULT_MAPINDEX, MapComponentDrawTypes } from "@kadaster/ggc-models";
import { GgcToolbarConnectService } from "../../service/connect.service";
import { from } from "rxjs";

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
@Component({
  selector: "ggc-toolbar-item-draw",
  templateUrl: "./ggc-toolbar-item-draw.component.html",
  styleUrls: ["./ggc-toolbar-item-draw.component.scss"],
  imports: [NgClass]
})
export class GgcToolbarItemDrawComponent {
  /** Naam van de kaart waarop getekend wordt. */
  mapIndex = input<string>(DEFAULT_MAPINDEX);

  /** Naam van de laag waarin getekend wordt. Default "drawing". */
  layer = input<string>("drawing");

  /** Icoon voor de 'stop tekenen' knop. Default "fal fa-mouse-pointer". */
  stopIcon = input<string>("fal fa-mouse-pointer");

  /** Icoon voor de 'punt tekenen' knop. Default "fas fa-circle". */
  drawIcon = input<string>("fas fa-circle");

  /** Icoon voor de 'lijn tekenen' knop. Default "fal fa-project-diagram". */
  drawLineIcon = input<string>("fal fa-project-diagram");

  /** Icoon voor de 'cirkel tekenen' knop. Default "fal fa-dot-circle". */
  drawCircleIcon = input<string>("fal fa-dot-circle");

  /** Icoon voor de 'rechthoek tekenen' knop. Default "fal fa-vector-square". */
  drawRectangleIcon = input<string>("fal fa-vector-square");

  /** Icoon voor de 'polygon tekenen' knop. Default "fal fa-draw-polygon". */
  drawPolygonIcon = input<string>("fal fa-draw-polygon");

  /** Icoon voor de 'tekenlaag wissen' knop. Default "fal fa-trash-alt". */
  deleteIcon = input<string>("fal fa-trash-alt");

  /** Icoon voor de 'tekening verplaatsen' knop. Default "fal fa-hand-paper". */
  moveIcon = input<string>("fal fa-hand-paper");

  /** Icoon voor de 'tekening bewerken' knop. Default "fal fa-pencil-alt". */
  editIcon = input<string>("fal fa-pencil-alt");

  /**
   * Event dat wordt verstuurd wanneer een tekenactie wordt uitgevoerd.
   * Bevat het type actie via `toolbarItemName`.
   */
  @Output() drawItemClicked: EventEmitter<ToolbarItemDrawComponentEvent> =
    new EventEmitter<ToolbarItemDrawComponentEvent>();

  protected activeDraw: DrawType | "move" | "edit" | undefined;
  private readonly connectService = inject(GgcToolbarConnectService);

  private drawServicePromise?: Promise<any>;

  private getDrawService(): Promise<any> {
    this.drawServicePromise ??= this.connectService.getDrawService();
    return this.drawServicePromise;
  }

  /**
   * Start een tekenactie van het opgegeven type.
   * @param type Het type tekenactie (Point, Line, Circle, Rectangle, Polygon).
   */
  draw(type: DrawType): void {
    from(this.getDrawService()).subscribe((service) => {
      this.activeDraw = type;
      service.startDraw(
        this.layer(),
        this.getMapComponentDrawType(type),
        {},
        this.mapIndex()
      );
      this.drawItemClicked.emit({
        toolbarItemName: this.getToolbarItemDrawType(type)
      });
    });
  }

  /**
   * Start de verplaatsactie voor tekeningen.
   */
  move(): void {
    from(this.getDrawService()).subscribe((service) => {
      if (service) {
        this.activeDraw = "move";
        service.startMove(this.layer(), this.mapIndex());
        this.drawItemClicked.emit({
          toolbarItemName: ToolbarItemDrawType.MOVE
        });
      }
    });
  }

  /**
   * Start de bewerkactie voor tekeningen.
   */
  edit(): void {
    from(this.getDrawService()).subscribe((service) => {
      if (service) {
        this.activeDraw = "edit";
        service.startModify(this.layer(), this.mapIndex());
        this.drawItemClicked.emit({
          toolbarItemName: ToolbarItemDrawType.EDIT
        });
      }
    });
  }

  /**
   * Stopt de actieve tekenactie.
   */
  stopDrawing() {
    from(this.getDrawService()).subscribe((service) => {
      if (service) {
        this.activeDraw = undefined;
        service.stopDraw(this.mapIndex());
        this.drawItemClicked.emit({
          toolbarItemName: ToolbarItemDrawType.STOP
        });
      }
    });
  }

  /**
   * Verwijdert alle tekeningen uit de laag.
   */
  eraseDrawLayer() {
    from(this.getDrawService()).subscribe((service) => {
      if (service) {
        this.activeDraw = undefined;
        service.clearLayer(this.layer(), this.mapIndex());
        this.drawItemClicked.emit({
          toolbarItemName: ToolbarItemDrawType.CLEAR
        });
      }
    });
  }

  private getMapComponentDrawType(type: DrawType) {
    switch (type) {
      case "Circle":
        return MapComponentDrawTypes.CIRCLE;
      case "Line":
        return MapComponentDrawTypes.LINESTRING;
      case "Point":
        return MapComponentDrawTypes.POINT;
      case "Rectangle":
        return MapComponentDrawTypes.RECTANGLE;
      default:
        return MapComponentDrawTypes.POLYGON;
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

type DrawType = "Point" | "Line" | "Circle" | "Rectangle" | "Polygon";
