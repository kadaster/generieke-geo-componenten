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
   * Toont de totale lengte van alle segmenten samen tijdens en na het tekenen. Styling via GgcDrawService.setDrawStyle().
   */
  showTotalLength?: boolean;
  /**
   * Toont de oppervlakte van het polygoon tijdens en na het tekenen. Styling via GgcDrawService.setDrawStyle().
   */
  showArea?: boolean;
  /**
   * Overschrijft de standaardweergave van oppervlaktelabels bij het tekenen van polygonen. Styling via GgcDrawService.setDrawStyle().
   *
   * @param area - Oppervlakte in m².
   * @returns Weer te geven tekst voor het oppervlaktelabel.
   */
  areaM2ToTextFunction?: (area: number) => string;

  /**
   * Schakelt trace-functionaliteit in tijdens het tekenen.
   *
   * Wanneer deze optie op `true` staat, kan de gebruiker
   * bestaande geometrieën volgen (tracen) tijdens het tekenen
   * van een nieuwe feature. Dit is handig om nieuwe geometrieën
   * nauwkeurig uit te lijnen met bestaande objecten.
   *
   * @defaultValue false
   *
   */
  trace?: boolean;

  /**
   * De ID van de vector source die gebruikt wordt voor tracing.
   *
   * Wanneer tracing is ingeschakeld (`trace: true`), bepaalt deze
   * optie welke bron de features bevat die gevolgd kunnen worden
   * tijdens het tekenen.
   */

  traceSourceId?: string;

  /**
   * De snapping-tolerantie (in pixels) bij tracing.
   *
   * @defaultValue 12
   */

  traceSnapTolerance?: number;
}
