import { Feature } from "ol";
import { Geometry } from "ol/geom";

/**
 * Validatiefunctie voor een getekende feature.
 * Wordt aangeroepen bij elke muisbeweging tijdens het tekenen.
 *
 * @param feature - De getekende feature om te valideren.
 * @returns `true` als de feature geldig is, anders `false`.
 */
export type ValidationFunction = (feature: Feature<Geometry>) => boolean;

/**
 * Opties voor het configureren van een tekeninteractie.
 * Wordt meegegeven aan `startDraw`, `startModify` en `startMove`.
 *
 * Een aantal opties kan ook achteraf voor reeds afgeronde tekeningen worden
 * toegepast via `resetDrawStyle`: `showSegmentLength`, `showTotalLength`,
 * `showArea`, `areaM2ToTextFunction` en `validators`.
 */
export interface DrawOptions {
  /**
   * Het maximale aantal punten van het object.
   * Bij het bereiken van het maximum wordt de tekening automatisch afgerond.
   */
  maxPoints?: number;
  /**
   * Een array van validatiefuncties die het getekende object controleren.
   */
  validators?: ValidationFunction[];
  /**
   * Activeert tekenen via het middelpunt van de kaart in plaats van met de muis of touch-events.
   */
  centerDraw?: boolean;
  /**
   * Toont de lengte van elk afzonderlijk segment tijdens en na het tekenen.
   */
  showSegmentLength?: boolean;
  /**
   * Toont de totale lengte van alle segmenten samen tijdens en na het tekenen.
   */
  showTotalLength?: boolean;
  /**
   * Toont de oppervlakte van het polygoon tijdens en na het tekenen.
   */
  showArea?: boolean;
  /**
   * Overschrijft de standaardweergave van oppervlaktelabels bij het tekenen van polygonen.
   *
   * @param area - Oppervlakte in m².
   * @returns Weer te geven tekst voor het oppervlaktelabel.
   */
  areaM2ToTextFunction?: (area: number) => string;

  trace?: boolean;

  traceSourceId?: string;

  traceSnapTolerance?: number;
}
