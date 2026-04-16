import { DrawEvent } from "ol/interaction/Draw";
import Style, { StyleFunction, StyleLike } from "ol/style/Style";

/**
 * Event types voor tekeninteracties.
 */
export enum DrawInteractionEventTypes {
  /** Wordt getriggerd wanneer een tekening wordt afgerond. */
  DRAWEND = "drawend",
  /** Wordt getriggerd wanneer een tekening wordt afgerond. De eindstijl wordt
   * toegepast, worden validators gecontroleerd en wordt de berekende
   * meting als property op de feature gezet. */
  DRAWSTART = "drawstart"
}

/**
 * Ondersteunde tekentypen voor de kaartcomponent.
 */
export enum MapComponentDrawTypes {
  /** Rechthoek. */
  RECTANGLE = "rectangle",
  /** Polygoon. */
  POLYGON = "polygon",
  /** Lijn. */
  LINESTRING = "linestring",
  /** Punt. */
  POINT = "point",
  /** Cirkel. */
  CIRCLE = "circle"
}

/**
 * Event dat wordt uitgezonden bij teken-interacties op de kaart.
 *
 * @param type - Type van het tekeninteractie-event.
 * @param drawType - Type tekening dat getekend wordt of is afgerond.
 * @param mapIndex - Index van de kaart waarop het event plaatsvindt.
 * @param message - Beschrijvend bericht bij het event.
 * @param event - Het onderliggende OpenLayers `DrawEvent`.
 * @param valid - Geeft aan of de tekening geldig is conform de ingestelde validatiefuncties. Default: `true`.
 * @param measurement - Optioneel: de berekende oppervlakte of lengte als string.
 */
export class DrawInteractionEvent {
  constructor(
    public type: DrawInteractionEventTypes,
    public drawType: MapComponentDrawTypes,
    public mapIndex: string,
    public message: string,
    public event: DrawEvent,
    public valid = true,
    public measurement?: string
  ) {}
}

/**
 * Map met tekenstijlen voor de tekeninteractie.
 * Wordt meegegeven aan `setDrawStyle`.
 *
 * De `drawingDrawStyle` wordt toegepast tijdens het tekenen,
 * de `finishDrawStyle` nadat de tekening is afgerond.
 * Als er geen eigen stijl wordt meegegeven, wordt de standaard OpenLayers-styling gebruikt.
 */
export interface StyleLikeMap {
  /** Stijl voor de geometrie tijdens het tekenen. */
  drawingDrawStyle?: StyleLike;
  /** Stijl voor de geometrie na het afronden van de tekening. */
  finishDrawStyle?: StyleLike;
  /** Stijlfunctie voor een ongeldige geometrie na het afronden van de tekening. */
  invalidFinishDrawStyle?: StyleFunction;
  /** Stijl voor een ongeldige geometrie tijdens het tekenen. */
  invalidDrawStyle?: StyleLike;
  /** Stijl voor het oppervlaktelabel. Bestaat standaard uit een `textStyle` en een `imageStyle` voor de achtergrond. */
  areaLabelStyle?: Style;
  /** Stijl voor het totale lengte-label. Bestaat standaard uit een `textStyle` en een `imageStyle` voor de achtergrond. */
  lengthLabelStyle?: Style;
  /** Stijl voor de lengte-labels per segment. Bestaat standaard uit een `textStyle` en een `imageStyle` voor de achtergrond. */
  segmentLengthLabelStyle?: Style;
  /** Stijl voor de crosshair op de cursor. */
  crossHairStyle?: Style;
}
