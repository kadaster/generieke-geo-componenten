import { inject, Injectable } from "@angular/core";
import { DrawingType } from "../model/enums";
import {
  Cartesian3,
  Color,
  Ellipsoid,
  Entity,
  HeightReference,
  Math as CesiumMath,
  PointGraphics,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin
} from "@cesium/engine";
import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { Subject } from "rxjs";
import { DrawEvent, SelectionConfig } from "../model/interfaces";
import { CoreSelectionService } from "./core-selection.service";

@Injectable({
  providedIn: "root"
})
export class GgcDrawingService {
  private readonly coreSelectionService = inject(CoreSelectionService);
  private readonly coreViewerService = inject(CoreViewerService);
  private readonly defaultPointStyle: PointGraphics = new PointGraphics({
    color: Color.BLUE,
    pixelSize: 10,
    heightReference: HeightReference.CLAMP_TO_GROUND,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
  });
  private viewer: Viewer | undefined;
  private screenSpaceEventHandler: ScreenSpaceEventHandler;
  private drawEntityIds: string[];
  private drawEventSubject: Subject<DrawEvent> = new Subject<DrawEvent>();
  private drawStyles: Map<DrawingType, PointGraphics | string> = new Map();
  private leftClickFromSelectionService: SelectionConfig | undefined;

  constructor() {
    this.coreViewerService.getViewerObservable().subscribe((viewer) => {
      this.viewer = viewer;
      this.drawEntityIds = [];
      if (viewer) {
        this.initializeDrawingService();
      } else {
        this.clearDrawingService();
      }
    });
  }

  public startDraw(type: DrawingType) {
    // Verwijder de LEFT_CLICK inputAction uit de SelectionService, zodat deze niet conflicteert met het tekenen
    this.leftClickFromSelectionService = this.coreSelectionService.getSelection(
      ScreenSpaceEventType.LEFT_CLICK
    );
    this.coreSelectionService.destroySelection(ScreenSpaceEventType.LEFT_CLICK);
    this.screenSpaceEventHandler?.setInputAction(
      (event: ScreenSpaceEventHandler.PositionedEvent) => {
        const ray = this.viewer?.camera.getPickRay(event.position);
        if (ray) {
          const earthPosition = this.viewer?.scene.globe.pick(
            ray,
            this.viewer.scene
          );
          if (earthPosition) {
            this.addDrawing(type, earthPosition);
          }
        }
      },
      ScreenSpaceEventType.LEFT_CLICK
    );
  }

  public stopDraw() {
    this.screenSpaceEventHandler?.removeInputAction(
      ScreenSpaceEventType.LEFT_CLICK
    );
    // Herstel de originele LEFT_CLICK InputAction in de SelectionService wanneer er gestopt wordt met tekenen
    if (this.leftClickFromSelectionService) {
      this.coreSelectionService.addSelection(
        this.leftClickFromSelectionService
      );
    }
  }

  public removeAllDrawings() {
    this.drawEntityIds.forEach((id) => this.viewer?.entities.removeById(id));
  }

  public setDrawStyles(drawStyles: Map<DrawingType, PointGraphics | string>) {
    this.drawStyles = drawStyles;
  }

  public getDrawEventObservable() {
    return this.drawEventSubject.asObservable();
  }

  public addDrawing(type: DrawingType, earthPosition: Cartesian3) {
    let drawnEntity;
    if (type === DrawingType.Point) {
      drawnEntity = this.addPoint(earthPosition);
    } else if (type === DrawingType.Svg) {
      drawnEntity = this.addSvg(earthPosition);
    }
    if (drawnEntity) {
      this.drawEntityIds.push(drawnEntity.id);
      const drawEvent = this.createDrawEvent(earthPosition, type);
      this.drawEventSubject.next(drawEvent);
    }
  }

  private addSvg(cartesian: Cartesian3): Entity | undefined {
    const drawStyleSvg = this.drawStyles.get(DrawingType.Svg) as string;
    return this.viewer?.entities.add({
      position: cartesian,
      billboard: {
        image: drawStyleSvg,
        heightReference: HeightReference.CLAMP_TO_GROUND,
        verticalOrigin: VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      }
    });
  }

  private addPoint(cartesian: Cartesian3): Entity | undefined {
    const drawStylePoint = this.drawStyles.get(
      DrawingType.Point
    ) as PointGraphics;
    return this.viewer?.entities.add({
      position: cartesian,
      point: drawStylePoint ?? this.defaultPointStyle
    });
  }

  private createDrawEvent(
    earthPosition: Cartesian3,
    drawingType: DrawingType
  ): DrawEvent {
    const cartographic = Ellipsoid.WGS84.cartesianToCartographic(earthPosition);
    return {
      type: drawingType,
      location: [
        CesiumMath.toDegrees(cartographic.longitude),
        CesiumMath.toDegrees(cartographic.latitude)
      ],
      terrainHeight: cartographic.height
    } as DrawEvent;
  }

  private initializeDrawingService() {
    this.screenSpaceEventHandler = new ScreenSpaceEventHandler(
      this.viewer?.scene.canvas
    );
    this.drawEventSubject = new Subject<DrawEvent>();
  }

  private clearDrawingService() {
    this.screenSpaceEventHandler?.destroy();
    this.drawEventSubject.complete();
    this.drawStyles = new Map<DrawingType, PointGraphics | string>();
  }
}
