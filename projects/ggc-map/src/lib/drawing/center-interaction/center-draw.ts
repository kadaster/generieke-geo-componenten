import { LineString, Point, Polygon } from "ol/geom";
import Feature from "ol/Feature";
import { DrawEvent, DrawOnSignature, Options } from "ol/interaction/Draw";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OlMap from "ol/Map";
import { EventsKey } from "ol/events";
import { GeometryType } from "ol/render/webgl/MixedGeometryBatch";
import { StyleLike } from "ol/style/Style";
import { Coordinate } from "ol/coordinate";
import { CenterBase } from "./center-base";

export interface CenterDrawOptions extends Options {
  crossHairStyle?: StyleLike;
}

export class CenterDraw extends CenterBase {
  // type voor on overgenomen uit ol>interaction>Draw.d.ts
  on: DrawOnSignature<EventsKey>;

  private sketchFeature: Feature | undefined;
  // Tijdelijke kaartlaag voor de actieve tekening
  private readonly overlay: VectorLayer | undefined;
  private readonly targetSource: VectorSource | undefined;
  private type: GeometryType;
  private previousCenter: Coordinate | undefined;

  constructor(options: CenterDrawOptions) {
    super({ crossHairStyle: options.crossHairStyle });
    this.type = options.type;
    this.overlay = new VectorLayer({
      source: new VectorSource({
        useSpatialIndex: false
      }),
      style: options.style,
      updateWhileInteracting: true,
      updateWhileAnimating: true,
      zIndex: 1
    });

    this.targetSource = options.source;
  }

  setMap(map: OlMap | null): void {
    super.setMap(map);
    this.overlay!.setMap(map);
  }

  protected updateCenterPoint() {
    super.updateCenterPoint();
    if (this.sketchFeature) {
      switch (this.sketchFeature?.getGeometry()!.getType()) {
        case "Point":
          //niks te doen
          break;
        case "LineString":
          this.updateLineString(
            this.sketchFeature?.getGeometry() as LineString
          );
          break;
        case "Polygon":
          this.updatePolygon(this.sketchFeature?.getGeometry() as Polygon);
          break;
      }
    }
  }

  private updateLineString(geometry: LineString) {
    const coords = geometry.getCoordinates();
    if (coords.length > 1) {
      coords.pop();
      geometry.setCoordinates(coords);
    }
    geometry.appendCoordinate(this.centerPoint.getCoordinates());
  }

  private updatePolygon(geometry: Polygon) {
    const coords = geometry.getCoordinates()[0];
    coords.splice(coords.length - 2, 1, this.centerPoint.getCoordinates());
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
    const sketchGeometry = this.sketchFeature?.getGeometry();
    if (!sketchGeometry && map) {
      this.initializeSketch(map);
    }
    if (center) {
      if (sketchGeometry instanceof Point) {
        //niets te doen
      } else if (sketchGeometry instanceof LineString) {
        // Coördinaten worden aan het einde van de bestaande array toegevoegd.
        sketchGeometry.appendCoordinate(center);
      } else if (sketchGeometry instanceof Polygon) {
        this.appendToPolygon(sketchGeometry, center);
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
    const centerCoordinates = this.centerPoint.getCoordinates();
    switch (this.type) {
      case "Point":
        this.sketchFeature = new Feature(new Point(centerCoordinates));
        this.finishDrawing();
        break;
      case "LineString":
        this.sketchFeature = new Feature(
          new LineString([centerCoordinates, centerCoordinates])
        );
        break;
      case "Polygon":
        this.sketchFeature = new Feature(
          new Polygon([
            [centerCoordinates, centerCoordinates, centerCoordinates]
          ])
        );
        break;
      default:
        this.sketchFeature = undefined;
    }
    this.overlay!.setMap(map);
    if (this.sketchFeature) {
      this.dispatchEvent(new DrawEvent("drawstart", this.sketchFeature));
      const overlaySource = this.overlay!.getSource()!;
      overlaySource.addFeature(this.sketchFeature);
    }
  }

  removeLastPoint() {
    const center = this.getMap()?.getView().getCenter();
    const sketchGeometry = this.sketchFeature?.getGeometry();
    if (sketchGeometry instanceof LineString) {
      const coords = sketchGeometry.getCoordinates();
      if (coords.length > 2) {
        coords.splice(coords.length - 2, 2, center!);
        sketchGeometry.setCoordinates(coords);
        this.previousCenter = undefined;
      } else {
        this.abortDrawing();
      }
    }
    if (sketchGeometry instanceof Polygon) {
      const coords = sketchGeometry.getCoordinates()[0];
      if (coords && coords.length > 3) {
        coords.splice(coords.length - 3, 1);
        sketchGeometry.setCoordinates([coords]);
        this.previousCenter = undefined;
      } else {
        this.abortDrawing();
      }
    }
  }

  finishDrawing(): void {
    // remove the redundant vertices in line and polygon
    const sketchGeometry = this.sketchFeature?.getGeometry();
    if (sketchGeometry instanceof LineString) {
      const coords = sketchGeometry.getCoordinates();
      coords.pop();
      sketchGeometry.setCoordinates(coords);
    }
    if (sketchGeometry instanceof Polygon) {
      const coords = sketchGeometry.getCoordinates()[0];
      coords.splice(coords.length - 2, 1);
      sketchGeometry.setCoordinates([coords]);
    }
    const sketchFeature = this.abortDrawing();
    if (!sketchFeature) {
      return;
    }
    this.dispatchEvent(new DrawEvent("drawend", sketchFeature));
    this.targetSource?.addFeature(sketchFeature);
  }

  /*
   * Geeft de Geometry die getekend wordt terug,
   * zonder de huidige positie van de cursor.
   */
  getSketchCoordinates() {
    const sketchGeometry = this.sketchFeature?.getGeometry();
    if (!sketchGeometry) return [];
    switch (sketchGeometry.getType()) {
      case "Point":
        return [(sketchGeometry as Point).getCoordinates()];
      case "LineString":
        return this.getWithoutLastCoord(sketchGeometry as LineString);
      case "Polygon":
        return this.getWithoutSecondToLastCoord(sketchGeometry as Polygon);
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
    this.previousCenter = undefined;
    this.overlay!.getSource()!.clear(true);
    return sketchFeature;
  }

  cleanup() {
    super.cleanup();
  }
}
