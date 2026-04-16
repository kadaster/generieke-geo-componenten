import { Injectable } from "@angular/core";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Type } from "ol/geom/Geometry";
import RenderFeature from "ol/render/Feature";
import Style, { StyleFunction } from "ol/style/Style";
import {
  areaStyle,
  finishedStyleFunction,
  lengthStyle,
  measuringStyleFunction,
  segmentLengthStyle,
  styleAreaLabelFunction,
  styleLengthLabelFunction,
  styleSegmentLabelFunction
} from "../measure-styles";
import { StyleLikeMap } from "../../model/draw-interaction-event.model";
import { DrawOptions } from "../../model/draw-options";

type DrawStyle =
  | "drawingDrawStyle"
  | "invalidDrawStyle"
  | "finishDrawStyle"
  | "invalidFinishDrawStyle";

type CoreMeasureDrawStyle = Style | Style[] | void;

@Injectable({
  providedIn: "root"
})
export class CoreMeasureDrawStyleService {
  public getMeasureStyle(
    measureType: Type,
    drawOptions: DrawOptions,
    measureStyleMap?: StyleLikeMap,
    modifying = false
  ): StyleLikeMap {
    const styleLikeMap: StyleLikeMap = {};
    const measureStyles = {
      lengthLabelStyle: lengthStyle,
      segmentLengthLabelStyle: segmentLengthStyle,
      areaLabelStyle: areaStyle,
      drawingDrawStyle: modifying
        ? finishedStyleFunction
        : measuringStyleFunction,
      invalidDrawStyle: modifying
        ? finishedStyleFunction
        : measuringStyleFunction,
      finishDrawStyle: finishedStyleFunction,
      invalidFinishDrawStyle: finishedStyleFunction,
      ...measureStyleMap
    };
    const drawStyles: DrawStyle[] = [
      "drawingDrawStyle",
      "invalidDrawStyle",
      "finishDrawStyle",
      "invalidFinishDrawStyle"
    ];
    drawStyles.forEach((drawStyle) => {
      styleLikeMap[drawStyle] = this.extendStyleFunctionWithLabels(
        drawStyle,
        measureStyles,
        measureType,
        drawOptions
      );
    });
    return styleLikeMap;
  }

  private extendStyleFunctionWithLabels(
    drawStyle: DrawStyle,
    measureStyleMap: StyleLikeMap,
    measureType: Type,
    drawOptions: DrawOptions
  ): StyleFunction {
    return (
      feature: Feature<Geometry> | RenderFeature,
      resolution: number
    ): CoreMeasureDrawStyle => {
      const geometryType = (feature.getGeometry() as Geometry).getType();
      // OpenLayers accepteert een pletora aan stijlen samengevoegd in StyleLike,
      // dit kan een Style zijn, een array van Styles, of een functie die een Style retourneert
      let style =
        measureStyleMap[drawStyle] instanceof Style ||
        Array.isArray(measureStyleMap[drawStyle])
          ? measureStyleMap[drawStyle]
          : (measureStyleMap[drawStyle] as Function).call(
              this,
              feature,
              resolution
            );
      if (measureType === "Circle" || measureType === "Point") {
        // Circles en Points kunnen geen metingen bevatten
        return style;
      }
      // Voeg labels toe als de geometrietype hetzelfde is en je aan het tekenen bent of het een afgeronde tekening betreft en geen punt is
      if (
        geometryType === measureType ||
        ((drawStyle === "finishDrawStyle" ||
          drawStyle === "invalidFinishDrawStyle") &&
          geometryType !== "Point")
      ) {
        // toon de segment lengte
        if (drawOptions.showSegmentLength) {
          style = CoreMeasureDrawStyleService.addLabelCallbackToStyle(
            feature,
            style,
            measureStyleMap.segmentLengthLabelStyle!,
            styleSegmentLabelFunction
          );
        }
        // toon de totale lengte
        if (drawOptions.showTotalLength) {
          style = CoreMeasureDrawStyleService.addLabelCallbackToStyle(
            feature,
            style,
            measureStyleMap.lengthLabelStyle!,
            styleLengthLabelFunction
          );
        }
        // vervolgens als je geen lijn tekent, dan toon ook de oppervlakte
        if (geometryType !== "LineString" && drawOptions.showArea) {
          style = CoreMeasureDrawStyleService.addLabelCallbackToStyle(
            feature,
            style,
            measureStyleMap.areaLabelStyle!,
            styleAreaLabelFunction,
            drawOptions.areaM2ToTextFunction
          );
        }
      }
      return style;
    };
  }

  // voeg aan de stijl de styling van het label en de callbackfunctie toe (voor het berekenen van lengte en oppervlakte)
  private static addLabelCallbackToStyle(
    feature: Feature<Geometry> | RenderFeature,
    style: CoreMeasureDrawStyle,
    measureStyle: Style,
    callback: (
      f: Feature<Geometry> | RenderFeature,
      labelStyle: Style,
      areaM2ToTextFunction?: (area: number) => string
    ) => Style | Style[],
    areaM2ToTextFunction?: (area: number) => string
  ): CoreMeasureDrawStyle {
    if (Array.isArray(style)) {
      style = style.concat(
        callback(feature, measureStyle, areaM2ToTextFunction)
      );
    } else if (style instanceof Style) {
      style = [style].concat(
        callback(feature, measureStyle, areaM2ToTextFunction)
      );
    }
    return style;
  }
}
