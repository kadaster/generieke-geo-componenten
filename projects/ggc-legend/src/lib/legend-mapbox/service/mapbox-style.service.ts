import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  IProperties,
  Layer,
  LayerType,
  LegendItem,
  MapboxStyle,
  MatchPattern,
  Pattern,
  StopsPattern,
  Filter,
  filterval
} from "../model/legend-mapbox.model";

export function exhaustiveGuard(_value: never): never {
  throw new Error(
    `ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`
  );
}

@Injectable({
  providedIn: "root"
})
export class MapboxStyleService {
  http = inject(HttpClient);

  getMapboxStyle(url: string): Observable<MapboxStyle> {
    return this.http.get<MapboxStyle>(url);
  }

  getLayersids(style: MapboxStyle): string[] {
    const ids: string[] = [];
    for (const layer of style.layers) {
      ids.push(layer.id);
    }
    return ids;
  }

  removeRasterLayers(style: MapboxStyle): MapboxStyle {
    style.layers = style.layers.filter(
      (layer) => layer.type !== LayerType.Raster
    );
    return style;
  }

  isPatternWithStops(
    paint: string | Pattern | undefined
  ): paint is StopsPattern {
    if (!paint) {
      return false;
    }
    return (paint as StopsPattern).stops !== undefined;
  }

  isPatternWithMatch(
    paint: string | Pattern | undefined
  ): paint is MatchPattern {
    if (!paint || typeof paint === "string") {
      return false;
    }
    return (
      (paint as MatchPattern) &&
      (paint as MatchPattern).length > 0 &&
      (paint as MatchPattern)[0] === "match"
    );
  }

  getItems(style: MapboxStyle, addLayerName: boolean): LegendItem[] {
    const legendItems: LegendItem[] = [];
    for (const layer of style.layers) {
      let props: IProperties = extractPropertiesFromFilter({}, layer.filter);
      const title = layer["source-layer"];
      let hasPattern = false;
      let pattern: Pattern | undefined = undefined;
      switch (layer.type) {
        case LayerType.Fill: {
          pattern =
            (layer.paint["fill-color"] as Pattern) ||
            (layer.paint["fill-pattern"] as Pattern);
          break;
        }
        case LayerType.Line: {
          pattern = layer.paint["line-color"] as Pattern;
          break;
        }
        case LayerType.Circle: {
          pattern = layer.paint["circle-color"] as Pattern;
          break;
        }
        case LayerType.Symbol: {
          if (layer.paint?.["text-color"]) {
            pattern = layer.paint["text-color"] as Pattern;
          }
          break;
        }
      }
      hasPattern = this.handlePattern(pattern, legendItems, layer);
      if (!hasPattern) {
        props = this.addTextLabels(layer, props);
        if (addLayerName && !legendItems.some((e) => e.title === title)) {
          legendItems.push(this.generateItem(title, layer, props));
        }
      }
    }
    return legendItems;
  }

  private handlePattern(
    pattern: Pattern | undefined,
    legendItems: LegendItem[],
    layer: Layer
  ): boolean {
    let props: IProperties = {};
    if (this.isPatternWithStops(pattern)) {
      pattern.stops.forEach((stop) => {
        props = {};
        props["" + pattern.property + ""] = stop[0];
        const title = stop[0];
        legendItems.push(this.generateItem(title, layer, props));
        return true;
      });
    } else if (this.isPatternWithMatch(pattern)) {
      this.domatch(pattern, layer, props, legendItems);
      return true;
    } else {
      console.warn("Invalid paint pattern detected:", pattern);
    }
    return false;
  }

  private domatch(
    pattern: MatchPattern,
    layer: Layer,
    props: IProperties,
    legendItems: LegendItem[]
  ) {
    if (pattern.length < 3) {
      console.warn("Invalid match pattern:", pattern);
      return undefined;
    }
    const matchField = pattern[1].slice(1);
    let title = "";
    let i = 0;
    for (const m of pattern) {
      if (i < 2) {
        console.warn("skip", m);
      } else if (m.startsWith("#")) {
        props = {};
        props = this.addTextLabels(layer, props);
        if (title !== "") {
          props[matchField] = title;
          if (!legendItems.some((e) => e.title === title)) {
            legendItems.push(this.generateItem(title, layer, props));
          }
          title = "";
        }
      } else {
        title = m + "";
      }
      i++;
    }
  }

  private addTextLabels(layer: Layer, props: IProperties): IProperties {
    if (
      layer.layout?.["text-field"] &&
      typeof layer.layout["text-field"] === "string"
    ) {
      const label = layer.layout["text-field"]
        .trim()
        .replace("{", "")
        .replace("}", "");
      props["" + label + ""] = label.substring(0, 6);
      props["size"] = "1";
    }
    return props;
  }

  private generateItem(
    title: string,
    layer: Layer,
    properties: IProperties
  ): LegendItem {
    return {
      name: layer.id,
      title: title,
      geoType: layer.type,
      style: [],
      sourceLayer: layer["source-layer"],
      feature: undefined,
      properties
    };
  }
}

function extractPropertiesFromFilter(prop: IProperties, filter: Filter) {
  function traverseFilter(filter: filterval): void {
    if (Array.isArray(filter)) {
      const operator = filter[0];
      const conditions = filter.slice(1);
      if (operator === "all" || operator === "any") {
        conditions.forEach(traverseFilter);
      } else {
        if (typeof filter[1] === "string") {
          //de eerste waarde is voldoende
          const key: string = filter[1];
          if (typeof filter[2] === "string" || typeof filter[2] === "number") {
            prop[key] = filter[2];
          } else {
            console.warn(
              `Unexpected filter value type for key "${key}":`,
              filter[2]
            );
          }
        } else {
          console.warn("Unexpected filter key type:", filter[1]);
        }
      }
    }
  }
  traverseFilter(filter);
  return prop;
}
