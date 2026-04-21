import { inject, Injectable } from "@angular/core";
import {
  Cartesian2,
  Cesium3DTileFeature,
  Color,
  defined,
  Ellipsoid,
  Entity,
  Math as CesiumMath,
  PostProcessStage,
  PostProcessStageLibrary,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType
} from "@cesium/engine";
import { Viewer } from "@cesium/widgets";
import { Subject } from "rxjs";
import { Tiles3dLayerService } from "../layers/tiles3d-layer.service";
import {
  SelectionConfig,
  SelectionEvent,
  SelectionEventType
} from "../model/interfaces";
import { CoreViewerService } from "./core-viewer.service";
import { GeoJsonLayerService } from "../layers/geojson-layer.service";

export type ScreenSpaceEvent =
  | ScreenSpaceEventHandler.MotionEvent
  | ScreenSpaceEventHandler.PositionedEvent
  | ScreenSpaceEventHandler.TwoPointEvent
  | ScreenSpaceEventHandler.TwoPointMotionEvent;
@Injectable({
  providedIn: "root"
})
export class CoreSelectionService {
  public currentSupportedEvents: ScreenSpaceEventType[];
  protected viewer: Viewer | undefined;
  protected mouseHandler: ScreenSpaceEventHandler;
  protected lastHoveredFeature: Cesium3DTileFeature | Entity | undefined =
    undefined;
  protected lastClickedEntity: Entity | undefined;
  protected isSilhouetteActivated = false;
  protected highlightMap: Map<
    ScreenSpaceEventType,
    PostProcessStage | undefined
  > = new Map<ScreenSpaceEventType, PostProcessStage>();
  private readonly tiles3DService = inject(Tiles3dLayerService);
  private readonly geoJsonLayerService = inject(GeoJsonLayerService);
  private readonly coreViewerService = inject(CoreViewerService);
  private selections: SelectionConfig[] = [];
  private readonly clickEvent: Subject<SelectionEvent> =
    new Subject<SelectionEvent>();

  constructor() {
    this.coreViewerService.getViewerObservable().subscribe((viewer) => {
      this.viewer = viewer;
      if (viewer) {
        this.initializeCoreSelectionService();
      } else {
        this.clearCoreSelectionService();
      }
      if (this.viewer?.scene) {
        if (PostProcessStageLibrary.isSilhouetteSupported(this.viewer?.scene)) {
          this.isSilhouetteActivated = true;
        }
      }
    });
  }

  public initializeSelections(selections: SelectionConfig[]) {
    this.selections = selections;
    this.reAddSelections();
  }

  public addSelection(selection: SelectionConfig) {
    this.removeSelectionFromSelectionArray(selection.eventType);
    this.selections.push(selection);
    this.reAddSelections();
  }

  public clearSelection(eventType: ScreenSpaceEventType) {
    const selection = this.getSelection(eventType);
    if (selection) {
      this.clearHighlight(eventType);
      this.clickEvent.next({
        selectionEventType:
          SelectionEventType.SELECTIONSERVICE_SELECTIONCLEARED,
        type: selection.eventType
      });
    }
  }

  public getSelection(eventType: ScreenSpaceEventType) {
    const foundSelection = this.selections.find(
      (sel) => sel.eventType === eventType
    );
    if (foundSelection) {
      return foundSelection;
    }
  }

  public destroySelection(eventType: ScreenSpaceEventType) {
    this.clearSelection(eventType);
    this.removeSelectionEvent(eventType);
  }

  public clearAllSelections() {
    this.selections.forEach((selection) =>
      this.clearSelection(selection.eventType)
    );
  }

  public destroyAllSelections() {
    // Gebruik een copy van de array, omdat in de loop ook waarden uit de 'echte' array worden verwijderd
    const selectionsCopy = [...this.selections];
    selectionsCopy.forEach((selection) =>
      this.destroySelection(selection.eventType)
    );
  }

  public getClickEventsObservable() {
    return this.clickEvent.asObservable();
  }

  private clearHighlight(type: ScreenSpaceEventType) {
    if (this.isSilhouetteActivated) {
      // Verwijder alle selected features uit het silhouette, maar laat het silhouette bestaan
      const silhouette = this.highlightMap.get(type);
      if (silhouette !== undefined) {
        silhouette.selected = [];
      }
    }
    if (
      this.lastClickedEntity !== undefined &&
      type == ScreenSpaceEventType.LEFT_CLICK
    ) {
      // Als het gaat om een GeoJSON feature (Entity), gebruik dan de originele entitiesFunction voor de styling
      const entitiesFunction = this.geoJsonLayerService.getEntitiesFunction(
        this.geoJsonLayerService.getLayerName(this.lastClickedEntity)
      );
      entitiesFunction?.(this.lastClickedEntity);
      this.lastClickedEntity = undefined;
    }
    // Als het silhouette niet geactiveerd is (en de color dus direct op het 3DTilesFeature zit moet deze worden opgeruimd)
    if (!this.isSilhouetteActivated && this.lastHoveredFeature !== undefined) {
      this.lastHoveredFeature = undefined;
    }
  }

  private removeSelectionEvent(type: ScreenSpaceEventType) {
    if (this.mouseHandler) {
      this.mouseHandler.removeInputAction(type);
      this.highlightMap.set(type, undefined);
      this.removeSelectionFromSelectionArray(type);
    }
  }

  private reAddSelections() {
    // Helaas moeten de SelectionConfigs steeds opnieuw worden toegevoegd, anders werkt het bijwerken van de PostProcessStages niet correct
    this.selections.forEach((selection) => {
      if (this.currentSupportedEvents.includes(selection.eventType)) {
        this.addToHighlightMap(selection.eventType, selection.highlightColor);
        this.mouseHandler?.setInputAction((movement: ScreenSpaceEvent) => {
          this.handleInputEvent(movement, selection);
        }, selection.eventType);
      }
    });
    this.updatePostProcessStages();
  }

  private addToHighlightMap(
    type: ScreenSpaceEventType,
    highlightColor = Color.GREEN
  ) {
    if (this.isSilhouetteActivated) {
      const existingSilhouette = this.highlightMap.get(type);
      const sameHighlightColor =
        existingSilhouette?.uniforms.color === highlightColor;
      const silhouette = PostProcessStageLibrary.createEdgeDetectionStage();
      silhouette.uniforms.color = highlightColor;
      silhouette.uniforms.length = 0.001;
      silhouette.selected =
        existingSilhouette && sameHighlightColor
          ? existingSilhouette.selected
          : [];
      this.highlightMap.set(type, silhouette);
    }
  }

  private handleInputEvent(
    movement: ScreenSpaceEvent,
    selection: SelectionConfig
  ) {
    const pickedFeature = this.getFeature(selection.eventType, movement);
    this.clearHighlight(selection.eventType);
    if (
      pickedFeature !== undefined &&
      pickedFeature instanceof Cesium3DTileFeature
    ) {
      this.setHighlightOnFeature(
        pickedFeature,
        selection.eventType,
        selection.highlightColor
      );
    }
    if (pickedFeature !== undefined && pickedFeature instanceof Entity) {
      this.updateLastClickedEntity(pickedFeature, selection.eventType);
    }
    this.clickEvent.next({
      selectionEventType: SelectionEventType.SELECTIONSERVICE_SELECTIONUPDATED,
      type: selection.eventType,
      location: this.getPositionString(selection.eventType, movement),
      feature: pickedFeature,
      layerName:
        pickedFeature instanceof Cesium3DTileFeature
          ? this.tiles3DService.getLayerName(pickedFeature)
          : this.geoJsonLayerService.getLayerName(pickedFeature)
    });
  }

  private setHighlightOnFeature(
    feature: Cesium3DTileFeature,
    type: ScreenSpaceEventType,
    highlightColor = Color.GREEN
  ) {
    if (this.isSilhouetteActivated) {
      const silhouette = this.highlightMap.get(type);
      if (silhouette !== undefined) {
        silhouette.selected = [feature];
      }
    } else {
      this.lastHoveredFeature = feature;
      feature.color = highlightColor;
    }
  }

  private removeSelectionFromSelectionArray(eventType: ScreenSpaceEventType) {
    const foundSelection = this.selections.findIndex(
      (sel) => sel.eventType === eventType
    );
    if (foundSelection > -1) {
      this.selections.splice(foundSelection, 1);
    }
  }

  private updatePostProcessStages() {
    if (this.isSilhouetteActivated) {
      this.viewer?.scene.postProcessStages.removeAll();
      const silhouettes = Array.from(this.highlightMap.values()).filter(
        (value) => value !== undefined
      );
      if (silhouettes.length > 0) {
        this.viewer?.scene.postProcessStages.add(
          PostProcessStageLibrary.createSilhouetteStage(silhouettes)
        );
      }
    }
  }

  private updateLastClickedEntity(entity: Entity, type: ScreenSpaceEventType) {
    if (type == ScreenSpaceEventType.LEFT_CLICK) {
      const entitiesHighlightFunction =
        this.geoJsonLayerService.getEntitiesHighlightFunction(
          this.geoJsonLayerService.getLayerName(entity)
        );
      entitiesHighlightFunction?.(entity);
      this.lastClickedEntity = entity;
    }
  }

  private getFeature(
    type: ScreenSpaceEventType,
    movement: ScreenSpaceEvent
  ): Cesium3DTileFeature | Entity | undefined {
    switch (type) {
      case ScreenSpaceEventType.WHEEL:
        return;
      case ScreenSpaceEventType.MOUSE_MOVE: {
        const moveFeature = this.viewer?.scene.pick(
          (movement as ScreenSpaceEventHandler.MotionEvent).endPosition
        );
        if (moveFeature instanceof Cesium3DTileFeature) {
          return moveFeature;
        } else if (
          moveFeature?.id !== undefined &&
          moveFeature.id instanceof Entity
        ) {
          return moveFeature.id;
        } else {
          return undefined;
        }
      }
      default: {
        const feature = this.viewer?.scene.pick(
          (movement as ScreenSpaceEventHandler.PositionedEvent).position
        );
        if (feature instanceof Cesium3DTileFeature) {
          return feature;
        } else if (feature?.id !== undefined && feature.id instanceof Entity) {
          return feature.id;
        } else {
          return undefined;
        }
      }
    }
  }

  private getPositionString(
    type: ScreenSpaceEventType,
    movement: ScreenSpaceEvent
  ): number[] | number[][] {
    switch (type) {
      case ScreenSpaceEventType.WHEEL:
        return [];
      case ScreenSpaceEventType.MOUSE_MOVE:
        return [
          this.getCoords(
            (movement as ScreenSpaceEventHandler.MotionEvent).startPosition
          ),
          this.getCoords(
            (movement as ScreenSpaceEventHandler.MotionEvent).endPosition
          )
        ];
      default:
        return this.getCoords(
          (movement as ScreenSpaceEventHandler.PositionedEvent).position
        );
    }
  }

  private getCoords(position: Cartesian2): number[] {
    let coords: number[] = [];
    const ray = this.viewer?.camera.getPickRay(position);
    if (ray) {
      const worldPosition = this.viewer?.scene.globe.pick(
        ray,
        this.viewer?.scene
      );
      if (defined(worldPosition)) {
        const cartographic =
          Ellipsoid.WGS84.cartesianToCartographic(worldPosition);
        coords = [
          CesiumMath.toDegrees(cartographic.latitude),
          CesiumMath.toDegrees(cartographic.longitude),
          cartographic.height
        ];
      }
    }
    return coords;
  }

  private initializeCoreSelectionService() {
    this.selections = [];
    this.highlightMap = new Map<ScreenSpaceEventType, PostProcessStage>();
    this.mouseHandler = new ScreenSpaceEventHandler(this.viewer?.scene.canvas);
    this.currentSupportedEvents = [
      ScreenSpaceEventType.LEFT_DOWN,
      ScreenSpaceEventType.LEFT_UP,
      ScreenSpaceEventType.LEFT_CLICK,
      ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
      ScreenSpaceEventType.RIGHT_DOWN,
      ScreenSpaceEventType.RIGHT_UP,
      ScreenSpaceEventType.RIGHT_CLICK,
      ScreenSpaceEventType.MIDDLE_DOWN,
      ScreenSpaceEventType.MIDDLE_UP,
      ScreenSpaceEventType.MIDDLE_CLICK,
      ScreenSpaceEventType.MOUSE_MOVE,
      ScreenSpaceEventType.WHEEL
    ];
  }

  private clearCoreSelectionService() {
    this.currentSupportedEvents = [];
    this.selections = [];
    this.mouseHandler?.destroy();
    this.lastHoveredFeature = undefined;
    this.lastClickedEntity = undefined;
    this.isSilhouetteActivated = false;
    this.highlightMap = new Map<ScreenSpaceEventType, PostProcessStage>();
  }
}
