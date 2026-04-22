import { inject, Injectable } from "@angular/core";
import { Collection } from "ol";
import { EventsKey } from "ol/events";
import { Condition, never } from "ol/events/condition";
import Feature from "ol/Feature";
import { Geometry, LineString, Polygon } from "ol/geom";
import { Type } from "ol/geom/Geometry";
import { Modify, Translate } from "ol/interaction";
import Draw, {
  createBox,
  GeometryFunction,
  Options
} from "ol/interaction/Draw";
import { unByKey } from "ol/Observable";
import { Observable, Subject } from "rxjs";
import { ObservableMapWrapper } from "@kadaster/ggc-models";
import { CoreMapService } from "../../map/service/core-map.service";
import { calculateAreaOrLength } from "../measure-styles";
import {
  DrawInteractionEvent,
  DrawInteractionEventTypes,
  MapComponentDrawTypes,
  StyleLikeMap
} from "../../model/draw-interaction-event.model";
import { MapComponentEvent } from "../../model/map-component-event.model";
import { DrawOptions } from "../../model/draw-options";
import {
  ModifyInteractionEvent,
  ModifyInteractionEventTypes
} from "../../model/modify-interaction-event.model";
import { drawTypeToGeometryType } from "../../utils/conversions";
import { CoreDrawValidationService } from "./core-draw-validation.service";
import { CoreMeasureDrawStyleService } from "./core-measure-draw-style.service";
import { Coordinate } from "ol/coordinate";
import { CoreDrawLayerService } from "./core-draw-layer.service";
import { CoreSnapService } from "./core-snap.service";
import {
  CenterDraw,
  CenterDrawOptions
} from "../center-interaction/center-draw";
import { TraceOptions } from "../../model/trace-options";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { DrawValidator } from "../draw-validator";
import { CenterBase } from "../center-interaction/center-base";
import {
  CenterModify,
  CenterModifyOptions
} from "../center-interaction/center-modify";
import { StyleLike } from "ol/style/Style";

@Injectable({
  providedIn: "root"
})
export class CoreDrawService {
  MIN_POINTS_LINE_STRING = 2;
  MIN_POINTS_POLYGON = 3;

  private readonly drawInteractions: Map<string, Draw | CenterDraw> = new Map();
  private readonly coreMapService = inject(CoreMapService);
  private readonly coreDrawValidationService = inject(
    CoreDrawValidationService
  );
  private readonly measureDrawStyleService = inject(
    CoreMeasureDrawStyleService
  );
  private readonly coreDrawLayerService = inject(CoreDrawLayerService);
  private readonly coreSnapService = inject(CoreSnapService);
  private readonly modifyInteractions: Map<string, Modify | CenterModify> =
    new Map();
  private readonly moveInteractions: Map<string, Translate> = new Map();
  private validLineStringOrPolygon = false;

  private readonly drawEventsMap = new ObservableMapWrapper<
    string,
    DrawInteractionEvent
  >(() => new Subject<DrawInteractionEvent>());
  private readonly modifyEventsMap = new ObservableMapWrapper<
    string,
    ModifyInteractionEvent
  >(() => new Subject<ModifyInteractionEvent>());
  private readonly drawEndListenerMap: Map<string, EventsKey> = new Map();
  private readonly drawStyleMap: Map<string, StyleLikeMap> = new Map();
  private readonly modifyListenersMap: Map<string, EventsKey[]> = new Map();
  private readonly moveListenersMap: Map<string, EventsKey[]> = new Map();
  private activeCenterInteraction: CenterBase | undefined;

  startCenterInteraction(mapIndex: string, croshairStyle?: StyleLike) {
    const activeCenterBase = new CenterBase({
      crossHairStyle: croshairStyle
    });
    this.coreMapService.getMap(mapIndex).addInteraction(activeCenterBase);
  }

  startCenterModify(
    layerName: string,
    mapIndex: string,
    options?: CenterModifyOptions
  ): CenterModify {
    this.removeActiveCenterInteraction(mapIndex);
    const targetSource = this.coreDrawLayerService
      .getDrawLayer(layerName, mapIndex)
      .getSource()!;
    if (options && !options.targetSource) {
      options.targetSource = targetSource;
    }
    const centerModify = new CenterModify(
      options ?? ({ targetSource } as CenterModifyOptions)
    );
    this.activeCenterInteraction = centerModify;
    const map = this.coreMapService.getMap(mapIndex);
    map.addInteraction(centerModify);
    this.modifyInteractions.set(mapIndex, centerModify);
    return centerModify;
  }

  startCenterModifyCurrentPoint() {
    if (this.activeCenterInteraction instanceof CenterModify) {
      this.activeCenterInteraction.startModifyCurrentPoint();
    }
  }

  stopCenterModifyCurrentPoint() {
    if (this.activeCenterInteraction instanceof CenterModify) {
      this.activeCenterInteraction.finishModify();
    }
  }

  removeActiveCenterInteraction(mapIndex: string) {
    if (this.activeCenterInteraction) {
      this.activeCenterInteraction.cleanup();
      const map = this.coreMapService.getMap(mapIndex);
      map.removeInteraction(this.activeCenterInteraction);
    }
  }

  addFeatureToLayer(
    layerName: string,
    mapIndex: string,
    feature: Feature<Geometry>
  ): MapComponentEvent {
    const exists = this.coreMapService.checkMapIndex(mapIndex);
    if (exists) {
      if (feature.getStyle() === undefined || feature.getStyle() === null) {
        this.addStylingToFeature(layerName, mapIndex, feature);
      }
      const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
      layer.getSource()!.addFeature(feature);
    }
    return this.coreMapService.decideMapComponentEventType(exists, mapIndex);
  }

  removeFeatureFromLayer(
    layerName: string,
    mapIndex: string,
    feature: Feature<Geometry>
  ) {
    const exists = this.coreMapService.checkMapIndex(mapIndex);
    if (exists) {
      const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
      layer.getSource()!.removeFeature(feature);
    }
  }

  appendCoordinates(coordinates: Coordinate, mapIndex: string) {
    const mapIndexExists = this.coreMapService.checkMapIndex(mapIndex);
    if (mapIndexExists) {
      const drawInteraction = this.drawInteractions.get(mapIndex);
      if (drawInteraction) {
        drawInteraction.appendCoordinates([coordinates]);
      }
    }
  }

  removeLastPoint(mapIndex: string) {
    const mapIndexExists = this.coreMapService.checkMapIndex(mapIndex);
    if (mapIndexExists) {
      const drawInteraction = this.drawInteractions.get(mapIndex);
      if (drawInteraction) {
        drawInteraction.removeLastPoint();
      }
    }
  }

  getSketchCoordinates(mapIndex: string): Coordinate[] | undefined {
    const mapIndexExists = this.coreMapService.checkMapIndex(mapIndex);
    if (mapIndexExists) {
      const drawInteraction = this.drawInteractions.get(mapIndex);
      if (drawInteraction && drawInteraction instanceof CenterDraw) {
        return drawInteraction.getSketchCoordinates();
      }
    } else {
      return;
    }
  }

  clearLayer(layerName: string, mapIndex: string): MapComponentEvent {
    const exists = this.coreMapService.checkMapIndex(mapIndex);
    if (exists) {
      const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
      layer.getSource()!.clear();
    }
    return this.coreMapService.decideMapComponentEventType(exists, mapIndex);
  }

  deleteDrawInteraction(mapIndex: string): void {
    const map = this.coreMapService.getMap(mapIndex);
    if (this.drawInteractions.has(mapIndex)) {
      map.removeInteraction(
        this.drawInteractions.get(mapIndex) as Draw | CenterDraw
      );
    }
    this.drawInteractions.delete(mapIndex);
  }

  deleteLayers(mapIndex: string): void {
    this.stopDraw(mapIndex);
    this.stopModify(mapIndex);
    const prefix = `${mapIndex}-`;
    this.coreSnapService.stopSnap(mapIndex);
    this.coreDrawLayerService.getDrawLayers().forEach((_layer, key: string) => {
      if (key.startsWith(prefix)) {
        this.deleteLayer(key.slice(prefix.length), mapIndex);
      }
    });
  }

  deleteLayer(layerName: string, mapIndex: string): void {
    this.stopDraw(mapIndex);
    this.stopModify(mapIndex);
    this.coreSnapService.stopSnap(mapIndex);
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    layer.setMap(null);
    this.coreDrawLayerService
      .getDrawLayers()
      .delete(`${mapIndex}-${layerName}`);
  }

  finishCurrentDraw(mapIndex: string): void {
    const drawInteraction = this.drawInteractions.get(mapIndex);
    if (drawInteraction && this.validLineStringOrPolygon) {
      drawInteraction.finishDrawing();
    }
  }

  getDrawObservable(mapIndex: string): Observable<DrawInteractionEvent> {
    return this.drawEventsMap.getOrCreateObservable(mapIndex);
  }

  getModifyEventsObservable(
    mapIndex: string
  ): Observable<ModifyInteractionEvent> {
    return this.modifyEventsMap.getOrCreateObservable(mapIndex);
  }

  setDrawStyle(
    layerName: string,
    mapIndex: string,
    drawStyle: StyleLikeMap
  ): void {
    this.drawStyleMap.set(`${mapIndex}-${layerName}`, drawStyle);
  }

  setLayerZIndex(layerName: string, mapIndex: string, index: number): void {
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    layer.setZIndex(index);
    layer.changed();
  }

  startDraw(
    layerName: string,
    mapIndex: string,
    drawType: MapComponentDrawTypes,
    drawOptions: DrawOptions = {},
    trace?: TraceOptions
  ): void {
    this.stopDraw(mapIndex);
    this.stopMove(mapIndex);
    this.setLayerVisibility(layerName, mapIndex, true);
    this.drawEventsMap.getOrCreateObservable(mapIndex);

    const geometryType = drawTypeToGeometryType(drawType);
    const selectedStyle = this.decideAndGetStyles(
      layerName,
      mapIndex,
      geometryType,
      drawOptions
    );
    const drawInteraction = this.getDrawInteraction(
      layerName,
      mapIndex,
      drawType,
      selectedStyle,
      drawOptions,
      trace
    );
    drawInteraction.on("drawstart", (event) => {
      this.drawEventsMap
        .getOrCreateSubject(mapIndex)
        .next(
          new DrawInteractionEvent(
            DrawInteractionEventTypes.DRAWSTART,
            drawType,
            mapIndex,
            `DrawStart on ${layerName}`,
            event
          )
        );
      if (drawOptions.validators) {
        this.coreDrawValidationService.addValidators(
          mapIndex,
          event.feature,
          drawOptions.validators,
          selectedStyle
        );
      }
      const geom = event.feature.getGeometry();
      if (geom) {
        geom.on("change", () => {
          this.validLineStringOrPolygon = this.isValidOnFinishByMethod(
            event.feature
          );
        });
      }
    });

    const id = drawInteraction.on("drawend", (event) => {
      if (selectedStyle) {
        event.feature.setStyle(selectedStyle.finishDrawStyle);
      }
      const valid =
        this.coreDrawValidationService.checkAndRemoveValidators(mapIndex);
      const areaOrLength = calculateAreaOrLength(event.feature);
      event.feature.setProperties({
        areaOrLength,
        measurement: this.getDrawType(drawOptions)
      });
      this.drawEventsMap
        .getOrCreateSubject(mapIndex)
        .next(
          new DrawInteractionEvent(
            DrawInteractionEventTypes.DRAWEND,
            drawType,
            mapIndex,
            `DrawEnd on ${layerName}`,
            event,
            valid,
            areaOrLength
          )
        );
    });
    this.drawEndListenerMap.set(mapIndex, id);
    this.coreSnapService.startSnapAgainIfExists(layerName, mapIndex);
  }

  // Segments are not supported yet and polygon has only area.
  public getDrawType(options: DrawOptions): string {
    if (options.showArea !== undefined && options.showArea) {
      return "area";
    } else if (
      options.showTotalLength !== undefined &&
      options.showTotalLength
    ) {
      return "length";
    } else {
      return "none";
    }
  }

  startModify(
    layerName: string,
    mapIndex: string,
    drawOptions: DrawOptions,
    deleteCondition: Condition = never,
    insertVertexCondition: Condition = never
  ): void {
    this.stopModify(mapIndex);
    this.stopMove(mapIndex);
    this.setLayerVisibility(layerName, mapIndex, true);
    const source = this.coreDrawLayerService
      .getDrawLayer(layerName, mapIndex)
      .getSource()!;
    const modify: Modify = new Modify({
      source,
      deleteCondition: deleteCondition,
      insertVertexCondition: insertVertexCondition
    });
    const map = this.coreMapService.getMap(mapIndex);
    map.addInteraction(modify);
    this.modifyInteractions.set(mapIndex, modify);
    const modifyEventSubject =
      this.modifyEventsMap.getOrCreateSubject(mapIndex);

    const eventsKeys: EventsKey[] = [];
    const validators = drawOptions?.validators || [];
    if (validators.length > 0) {
      eventsKeys.push(
        modify.on("modifystart", (event) => {
          event.features.forEach((feature: Feature<Geometry>) => {
            const selectedStyle = this.decideAndGetStyles(
              layerName,
              mapIndex,
              feature.getGeometry()!.getType(),
              drawOptions,
              true
            );
            this.coreDrawValidationService.addValidators(
              mapIndex,
              feature,
              validators,
              selectedStyle
            );
          });
        })
      );
    }
    eventsKeys.push(
      modify.on("modifyend", (event) => {
        if (event.features) {
          event.features.forEach((feature) => {
            const areaOrLength = calculateAreaOrLength(feature);
            feature.set("areaOrLength", areaOrLength);
          });
        }
        modifyEventSubject.next(
          new ModifyInteractionEvent(
            ModifyInteractionEventTypes.MODIFYEND,
            mapIndex,
            `bewerken ${layerName}`,
            event,
            this.coreDrawValidationService.checkAndRemoveValidators(mapIndex)
          )
        );
      })
    );
    this.modifyListenersMap.set(mapIndex, eventsKeys);

    this.coreSnapService.startSnapAgainIfExists(layerName, mapIndex);
  }

  startMove(
    layerName: string,
    mapIndex: string,
    drawOptions: DrawOptions = {}
  ): void {
    const map = this.coreMapService.getMap(mapIndex);
    const drawLayer = this.coreDrawLayerService.getDrawLayer(
      layerName,
      mapIndex
    );

    // source.
    this.stopModify(mapIndex);
    this.stopDraw(mapIndex);
    this.stopMove(mapIndex);
    const features = new Collection<Feature<Geometry>>();
    const move = new Translate({ features });
    const modifyEventSubject =
      this.modifyEventsMap.getOrCreateSubject(mapIndex);
    let selected: Feature<Geometry> | undefined;
    let isTranslating = false;
    this.moveInteractions.set(mapIndex, move);
    map.addInteraction(move);
    const eventsKeys: EventsKey[] = [];
    eventsKeys.push(
      move.on("translatestart", () => {
        isTranslating = true;
        map.getViewport().style.cursor = "grabbing";
        if (drawOptions.validators) {
          const selectedStyle = this.decideAndGetStyles(
            layerName,
            mapIndex,
            selected!.getGeometry()!.getType(),
            drawOptions
          );
          this.coreDrawValidationService.addValidators(
            mapIndex,
            selected as Feature<Geometry>,
            drawOptions.validators,
            selectedStyle
          );
        }
      }),
      move.on("translateend", (event) => {
        isTranslating = false;
        map.getViewport().style.cursor = "grab";
        modifyEventSubject.next(
          new ModifyInteractionEvent(
            ModifyInteractionEventTypes.MOVEEND,
            mapIndex,
            `verplaatsen feature op ${layerName}`,
            event,
            this.coreDrawValidationService.checkAndRemoveValidators(mapIndex)
          )
        );
      }),
      map.on("pointermove", (evt) => {
        if (isTranslating) {
          return;
        }
        let onFeature = false;
        map.forEachFeatureAtPixel(
          evt.pixel,
          (feat) => {
            onFeature = true;
            selected = feat as Feature<Geometry>;
            map.getViewport().style.cursor = "grab";
            return true;
          },
          { layerFilter: (layer) => layer === drawLayer }
        );
        features.clear();
        if (onFeature) {
          if (selected) {
            features.push(selected);
          }
        } else {
          selected = undefined;
          map.getViewport().style.cursor = "";
        }
      })
    );
    this.moveListenersMap.set(mapIndex, eventsKeys);
  }

  stopDraw(mapIndex: string): void {
    const interaction = this.drawInteractions.get(mapIndex);
    if (interaction) {
      unByKey(this.drawEndListenerMap.get(mapIndex) as EventsKey);
      this.drawEndListenerMap.delete(mapIndex);
      this.deleteDrawInteraction(mapIndex);
    }
  }

  stopModify(mapIndex: string): void {
    const interaction = this.modifyInteractions.get(mapIndex);
    if (interaction) {
      unByKey(this.modifyListenersMap.get(mapIndex) as EventsKey[]);
      this.modifyListenersMap.delete(mapIndex);
      this.modifyInteractions.delete(mapIndex);
      if (interaction instanceof CenterModify) {
        interaction.finishModify();
      }
      this.coreMapService.getMap(mapIndex).removeInteraction(interaction);
    }
  }

  stopMove(mapIndex: string): void {
    const interaction = this.moveInteractions.get(mapIndex);
    if (interaction) {
      unByKey(this.moveListenersMap.get(mapIndex) as EventsKey[]);
      this.moveListenersMap.delete(mapIndex);
      this.moveInteractions.delete(mapIndex);
      this.coreMapService.getMap(mapIndex).removeInteraction(interaction);
    }
  }

  setLayerVisibility(layerName: string, mapIndex: string, visible: boolean) {
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    layer.setVisible(visible);
    layer.changed();
  }

  toggleLayer(layerName: string, mapIndex: string) {
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    layer.setVisible(!layer.getVisible());
    layer.changed();
  }

  resetDrawStyle(
    layerName: string,
    mapIndex: string,
    drawOptions: DrawOptions
  ) {
    this.stopDraw(mapIndex);
    // Style de afgeronde tekeningen
    const layer = this.coreDrawLayerService.getDrawLayer(layerName, mapIndex);
    const features = layer.getSource()?.getFeatures() ?? [];

    features.forEach((feature) => {
      const styles = this.decideAndGetStyles(
        layerName,
        mapIndex,
        feature.getGeometry()!.getType(),
        drawOptions
      );

      // bepaal validatie status
      const isValid = drawOptions.validators?.length
        ? new DrawValidator(feature, drawOptions.validators).validate(feature)
        : true;

      feature.setStyle(
        isValid ? styles?.finishDrawStyle : styles?.invalidFinishDrawStyle
      );
    });
  }

  private decideAndGetStyles(
    layerName: string,
    mapIndex: string,
    measureType: Type,
    drawOptions: DrawOptions,
    modifying = false
  ): StyleLikeMap | undefined {
    return this.measureDrawStyleService.getMeasureStyle(
      measureType,
      drawOptions,
      this.drawStyleMap.get(`${mapIndex}-${layerName}`),
      modifying
    );
  }

  private getDrawInteraction(
    layerName: string,
    mapIndex: string,
    drawType: MapComponentDrawTypes,
    styleLikeMap?: StyleLikeMap,
    options?: Partial<Options>,
    traceOptions?: TraceOptions
  ): Draw | CenterDraw {
    if (!this.drawInteractions.has(mapIndex)) {
      let drawInteraction: Draw | CenterDraw;
      let geometryFunction: (() => GeometryFunction) | undefined;
      let geometryType: Type;
      switch (drawType) {
        case MapComponentDrawTypes.RECTANGLE:
          // type Circle and geometryFunction createBox() enables drawing rectangles (default Openlayers)
          geometryFunction = createBox;
          geometryType = "Circle";
          break;

        case MapComponentDrawTypes.POLYGON:
          geometryType = "Polygon";
          break;

        case MapComponentDrawTypes.LINESTRING:
          geometryType = "LineString";
          break;

        case MapComponentDrawTypes.POINT:
          geometryType = "Point";
          break;

        case MapComponentDrawTypes.CIRCLE:
          geometryType = "Circle";
          break;

        default:
          throw new Error("Unknown draw type");
      }
      // Validatie of LineString uit minimaal 2 en Polygon 3 punten bestaat
      let currentSketch: Feature<Geometry> | null = null;
      options = {
        ...options,
        finishCondition: () => {
          return this.isValidOnFinishByDoubleClick(currentSketch);
        }
      };

      if (geometryType) {
        drawInteraction = this.createDrawObject(
          layerName,
          mapIndex,
          geometryType,
          styleLikeMap,
          options,
          geometryFunction ? geometryFunction() : undefined,
          traceOptions
        );

        // currentSketch vullen met huidige actieve Draw tekening
        if (drawInteraction instanceof Draw) {
          drawInteraction.on("drawstart", (evt) => {
            currentSketch = evt.feature;
          });
          drawInteraction.on("drawend", () => {
            currentSketch = null;
          });
        }

        const map = this.coreMapService.getMap(mapIndex);
        map.addInteraction(drawInteraction);
        /* need to snap to tracing layer after
         * drawInteraction is initiated */
        if (this.shouldTrace(traceOptions, options)) {
          this.addSnappingForTracing(traceOptions!);
        }

        this.drawInteractions.set(mapIndex, drawInteraction);
      }
    }
    return this.drawInteractions.get(mapIndex) as Draw | CenterDraw;
  }

  private shouldTrace(
    traceOptions: TraceOptions | undefined,
    options: DrawOptions | undefined
  ) {
    return traceOptions && !options?.centerDraw;
  }

  private createDrawObject(
    layerName: string,
    mapIndex: string,
    type: Type,
    styleLikeMap?: StyleLikeMap,
    options?: DrawOptions,
    geoFunction?: GeometryFunction,
    traceOptions?: TraceOptions
  ): Draw | CenterDraw {
    const layer = this.coreDrawLayerService.getDrawLayer(
      layerName,
      mapIndex,
      styleLikeMap?.finishDrawStyle
    );
    const source = layer.getSource()!;

    const drawOptions: Options = {
      ...options,
      source,
      type,
      stopClick: true,
      geometryFunction: geoFunction
    };

    if (this.shouldTrace(traceOptions, options)) {
      this.addTracing(drawOptions, traceOptions!);
    }

    if (styleLikeMap) {
      drawOptions.style = styleLikeMap.drawingDrawStyle;
    }
    if (options?.centerDraw) {
      const centerDrawOptions: CenterDrawOptions = {
        ...drawOptions,
        crossHairStyle: styleLikeMap?.crossHairStyle
      };
      const centerDraw = new CenterDraw(centerDrawOptions);
      this.removeActiveCenterInteraction(mapIndex);
      this.activeCenterInteraction = centerDraw;
      return centerDraw;
    }
    return new Draw(drawOptions);
  }

  private isValidOnFinishByMethod(currentSketch: Feature<Geometry> | null) {
    if (!currentSketch) return false;
    const geom = currentSketch.getGeometry();
    if (geom instanceof LineString) {
      const placedCoordinates = new Set(
        geom
          .getCoordinates()
          .slice(0, -1)
          .map((c) => JSON.stringify(c))
      );
      return placedCoordinates.size >= this.MIN_POINTS_LINE_STRING; // -1, want tijdens tekenen is muispositie extra point
    }
    if (geom instanceof Polygon) {
      const placedCoordinates = new Set(
        geom
          .getCoordinates()[0]
          .slice(0, -2)
          .map((c) => JSON.stringify(c))
      );
      return placedCoordinates.size >= this.MIN_POINTS_POLYGON; // -1, want tijdens tekenen is muispositie extra point
    }
    return true;
  }

  private isValidOnFinishByDoubleClick(
    currentSketch: Feature<Geometry> | null
  ) {
    if (!currentSketch) return false;
    const geom = currentSketch.getGeometry();
    if (geom instanceof LineString) {
      const placedCoordinates = new Set(
        geom.getCoordinates().map((c) => JSON.stringify(c))
      );
      return placedCoordinates.size >= this.MIN_POINTS_LINE_STRING;
    }
    if (geom instanceof Polygon) {
      const placedCoordinates = new Set(
        geom.getCoordinates()[0].map((c) => JSON.stringify(c))
      );
      return placedCoordinates.size >= this.MIN_POINTS_POLYGON;
    }
    return true;
  }

  private addStylingToFeature(
    layerName: string,
    mapIndex: string,
    feature: Feature<Geometry>
  ) {
    const styleLikeMap: StyleLikeMap | undefined = this.drawStyleMap.get(
      `${mapIndex}-${layerName}`
    );
    if (styleLikeMap) {
      feature.setStyle(styleLikeMap.finishDrawStyle);
    }
  }

  private addTracing(drawOptions: Options, traceOptions: TraceOptions) {
    const traceLayer = this.coreMapService.getLayer(
      traceOptions.traceLayerId,
      traceOptions.mapIndex
    ) as VectorLayer;

    if (traceLayer === undefined) {
      console.warn(
        "Kan niet tracen. Laag [" +
          traceOptions.traceLayerId +
          "] niet gevonden in mapIndex [" +
          traceOptions.mapIndex +
          "]."
      );
      return;
    }
    const traceSource = traceLayer.getSource() as VectorSource;
    drawOptions.trace = true;
    drawOptions.traceSource = traceSource;
  }

  private addSnappingForTracing(trace: TraceOptions) {
    this.coreSnapService.startSnap(trace.drawLayerId, trace.mapIndex, {
      snapLayers: [...trace.traceLayerId],
      pixelTolerance: trace.pixelTolerance
    });
  }
}
