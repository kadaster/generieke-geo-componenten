import { Interaction } from "ol/interaction";
import { Geometry, LineString, Point, Polygon } from "ol/geom";
import Feature from "ol/Feature";
import { DrawEvent, DrawOnSignature, Options } from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import { EventsKey, listen, unlistenByKey } from "ol/events";
import { GeometryType } from "ol/render/webgl/MixedGeometryBatch";
import { StyleLike } from "ol/style/Style";
import { Coordinate } from "ol/coordinate";
import { crossHairImageStyle } from "./measure-styles";

export interface CenterDrawOptions extends Options {
  crossHairStyle?: StyleLike;
}

export class CenterDraw extends Interaction {
  // type voor on overgenomen uit ol>interaction>Draw.d.ts
  on: DrawOnSignature<EventsKey>;

  private sketchFeature: Feature | undefined;
  private sketchGeometry: Geometry | undefined;
  private centerPoint: Point;
  private changeCenterListener: EventsKey;
  // Tijdelijke kaartlaag voor de actieve tekening
  private readonly overlay: VectorLayer | undefined;
  // Tijdelijke kaartlaag voor de crosshair
  private readonly crossHairOverlay: VectorLayer | undefined;
  private readonly crossHairCenterOverlay: VectorLayer | undefined;
  private readonly targetSource: VectorSource | undefined;
  private readonly type: GeometryType;
  private previousCenter: Coordinate | undefined;

  constructor(options: CenterDrawOptions) {
    super();
    this.type = options.type;
    this.overlay = new VectorLayer({
      source: new VectorSource({
        useSpatialIndex: false
      }),
      style: options.style,
      updateWhileInteracting: true,
      zIndex: 1
    });
    this.targetSource = options.source;
    const style = options.crossHairStyle ?? crossHairImageStyle;

    this.crossHairOverlay = new VectorLayer({
      source: new VectorSource({
        useSpatialIndex: false
      }),
      style,
      updateWhileInteracting: true,
      zIndex: 2
    });

    this.crossHairCenterOverlay = new VectorLayer({
      source: new VectorSource({
        useSpatialIndex: false
      }),
      // style,
      updateWhileInteracting: true,
      zIndex: 3
    });
  }

  setMap(map: OlMap | null): void {
    super.setMap(map);
    if (map) {
      this.registerListeners(map);
      this.overlay!.setMap(map);
      this.crossHairOverlay!.setMap(map);
      this.crossHairCenterOverlay!.setMap(map);
      const center = map.getView().getCenter();
      if (center) {
        const crossHairSource = this.crossHairOverlay!.getSource()!;
        const crossHairCenterSource = this.crossHairCenterOverlay!.getSource()!;
        this.centerPoint = new Point(center);
        crossHairSource.addFeature(new Feature(this.centerPoint));
        crossHairCenterSource.addFeature(new Feature(this.centerPoint));
      }
    } else {
      this.crossHairOverlay!.setMap(map);
      this.crossHairCenterOverlay!.setMap(map);
      this.overlay!.setMap(map);
      unlistenByKey(this.changeCenterListener);
    }
  }

  private registerListeners(map: OlMap) {
    this.changeCenterListener = listen(
      map.getView(),
      "change:center",
      this.updateCenterPoint,
      this
    );
  }

  private updateCenterPoint() {
    const map = this.getMap();
    if (!map) {
      return;
    }
    const center = map.getView().getCenter();
    if (center) {
      this.centerPoint.setCoordinates(center);
      if (this.sketchGeometry) {
        switch (this.sketchGeometry.getType()) {
          case "Point":
            //niks te doen
            break;
          case "LineString":
            this.updateLineString(this.sketchGeometry as LineString);
            break;
          case "Polygon":
            this.updatePolygon(this.sketchGeometry as Polygon);
            break;
        }
      }
    }
  }

  private updateLineString(geometry: LineString) {
    const coords = geometry.getCoordinates();
    if (coords.length > 1) {
      coords.pop();
      geometry.setCoordinates(coords);
    }
    const center = this.getMap()?.getView().getCenter();
    if (center) {
      geometry.appendCoordinate(center);
    }
  }

  private updatePolygon(geometry: Polygon) {
    const coords = geometry.getCoordinates()[0];
    const center = this.getMap()?.getView().getCenter();
    coords.splice(coords.length - 2, 1, center!);
    geometry.setCoordinates([coords]);
  }

  appendCoordinates() {
    const map = this.getMap();
    const center = this.getMap()?.getView().getCenter();
    //punt niet toevoegen als het op dezelfde positie wordt geplaatst
    if (center == this.previousCenter) {
      return;
    }
    this.previousCenter = center;
    if (!this.sketchGeometry && map) {
      this.initializeSketch(map);
    }
    if (center) {
      if (this.sketchGeometry instanceof Point) {
        this.sketchGeometry.setCoordinates(center);
        this.finishDrawing();
      } else if (this.sketchGeometry instanceof LineString) {
        // Coördinaten worden aan het einde van de bestaande array toegevoegd.
        this.sketchGeometry.appendCoordinate(center);
      } else if (this.sketchGeometry instanceof Polygon) {
        this.appendToPolygon(this.sketchGeometry, center);
      }
    }
  }

  private appendToPolygon(geometry: Polygon, center: Coordinate) {
    // Coördinaten worden vóór het sluitende coördinaat van de
    // buitenring toegevoegd, om de ring geldig te houden.
    const coords = geometry.getCoordinates();
    if (coords.length == 0) {
      coords.push([center, center, center]);
    } else {
      coords[0].splice(coords[0].length - 2, 0, center);
    }
    geometry.setCoordinates(coords);
  }

  private initializeSketch(map: OlMap) {
    switch (this.type) {
      case "Point":
        this.sketchGeometry = new Point([]);
        break;
      case "LineString":
        this.sketchGeometry = new LineString([]);
        break;
      case "Polygon":
        this.sketchGeometry = new Polygon([]);
        break;
      default:
        this.sketchGeometry = new LineString([]);
    }
    this.overlay!.setMap(map);
    this.sketchFeature = new Feature(this.sketchGeometry);
    this.dispatchEvent(new DrawEvent("drawstart", this.sketchFeature));
    const overlaySource = this.overlay!.getSource()!;
    overlaySource.addFeature(this.sketchFeature);
  }

  removeLastPoint() {
    const center = this.getMap()?.getView().getCenter();
    if (this.sketchGeometry instanceof LineString) {
      const coords = this.sketchGeometry.getCoordinates();
      if (coords.length > 2) {
        coords.splice(coords.length - 2, 2, center!);
        this.sketchGeometry.setCoordinates(coords);
        this.previousCenter = undefined;
      } else {
        this.abortDrawing();
      }
    } else if (this.sketchGeometry instanceof Polygon) {
      const coords = this.sketchGeometry.getCoordinates()[0];
      if (coords && coords.length > 3) {
        coords.splice(coords.length - 3, 1);
        this.sketchGeometry.setCoordinates([coords]);
        this.previousCenter = undefined;
      } else {
        this.abortDrawing();
      }
    }
  }

  finishDrawing() {
    // verwijder overbodige vertices in lijn en polygon
    if (this.sketchGeometry instanceof LineString) {
      const coords = this.sketchGeometry.getCoordinates();
      coords.pop();
      this.sketchGeometry.setCoordinates(coords);
    }
    if (this.sketchGeometry instanceof Polygon) {
      const coords = this.sketchGeometry.getCoordinates()[0];
      coords.splice(coords.length - 2, 1);
      this.sketchGeometry.setCoordinates([coords]);
    }
    const sketchFeature = this.abortDrawing();
    if (!sketchFeature) {
      return null;
    }
    this.dispatchEvent(new DrawEvent("drawend", sketchFeature));
    this.targetSource?.addFeature(sketchFeature);
  }

  /*
   * Geeft de Geometry die getekend wordt terug,
   * zonder de huidige positie van de cursor.
   */
  getSketchCoordinates() {
    if (!this.sketchGeometry) return [];

    switch (this.sketchGeometry.getType()) {
      case "Point":
        return [(this.sketchGeometry as Point).getCoordinates()];

      case "LineString":
        return this.getWithoutLastCoord(this.sketchGeometry as LineString);

      case "Polygon":
        return this.getWithoutSecondToLastCoord(this.sketchGeometry as Polygon);

      default:
        console.warn("Unknown geometry type");
        return [];
    }
  }

  private getWithoutLastCoord(line: LineString): Coordinate[] {
    const coords = [...line.getCoordinates()];
    const index = coords.length - 1;
    coords.splice(index, 1);
    return coords;
  }

  private getWithoutSecondToLastCoord(polygon: Polygon): Coordinate[] {
    const rings = [...polygon.getCoordinates()];
    if (!rings || rings.length === 0) {
      return [];
    }
    const outerRing = [...rings[0]];
    const length = outerRing.length;
    /*
      Wanneer de polygon getekend wordt vult deze de coördinaten[] met 3 punten.
      Daarnaast is er ook nog het punt waar de pointer staat op de kaart.
      Om alleen de gezette punten terug te geven worden de laatste 2 punten verwijderd.
     */
    if (length <= 4) {
      outerRing.splice(-2);
      return outerRing.splice(-2);
    }
    /*
     Als je 3 punten hebt geplaatst is er een geldige polygon en kan de tekening ook worden afgerond,
     Hier verwijderen we alleen het voorlaatste punt (dit is de positie van de pointer op de kaart).
    */
    const index = outerRing.length - 2;
    outerRing.splice(index, 1);
    return outerRing;
  }

  private abortDrawing() {
    const sketchFeature = this.sketchFeature;
    this.sketchFeature = undefined;
    this.sketchGeometry = undefined;
    this.previousCenter = undefined;
    this.overlay!.getSource()!.clear(true);
    return sketchFeature;
  }
}
