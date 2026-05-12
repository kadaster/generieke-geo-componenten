import { Component, inject, Input, OnDestroy, OnInit } from "@angular/core";
import OlMap from "ol/Map";
import { Subscription } from "rxjs";
import { CoreMapEventsService } from "../map/service/core-map-events.service";
import { CoreMapService } from "../map/service/core-map.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * Component dat het actuele schaalgetal (scale denominator)
 * van een OpenLayers‑kaart berekent en beschikbaar stelt.
 *
 * Het schaalgetal wordt opnieuw berekend bij iedere `zoomend`‑event
 * van de gekoppelde kaart.
 *
 * Voorbeeld: 1 : 25.000
 */
@Component({
  selector: "ggc-scale-denominator",
  templateUrl: "./ggc-scale-denominator.component.html"
})
export class GgcScaleDenominatorComponent implements OnInit, OnDestroy {
  /**
   * Index van de kaart waarvoor het schaalgetal
   * berekend moet worden.
   */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;
  protected currentScaleDenominator: number | undefined;
  private readonly coreMapService = inject(CoreMapService);
  private readonly mapEventsService = inject(CoreMapEventsService);
  private readonly INCHES_PER_METER = 39.37;
  private readonly POINTS_PER_INCH = 90.71446714322;
  private map: OlMap;
  private zoomendSubscription: Subscription;

  /**
   * Initialiseert het component:
   * - haalt de kaart op
   * - abonneert zich op zoom-events
   * - triggert herberekening van het schaalgetal
   */
  ngOnInit() {
    this.map = this.coreMapService.getMap(this.mapIndex);
    const zoomendObservable = this.mapEventsService.getZoomendObservableForMap(
      this.mapIndex
    );
    this.zoomendSubscription = zoomendObservable.subscribe(() => {
      this.calculateScaleDenominator();
    });
  }

  /**
   * Berekent het schaalgetal op basis van de huidige kaartresolutie.
   *
   * Formule:
   * schaal = resolutie (m/px) × inches/m × pixels/inch
   *
   * De PPI‑waarde is afgeleid van:
   * Nederlandse richtlijn tiling (bijlage B, Geonovum).
   */
  private calculateScaleDenominator(): void {
    // aantal ppi berekend op basis van aanname van 0.28 mm per pixel uit de Nederlandse richtlijn tiling, bijlage B:
    // https://www.geonovum.nl/uploads/standards/downloads/nederlandse_richtlijn_tiling_-_versie_1.1.pdf
    // ppi = aantal mm per inch (= 25.4mm) / mm per pixel (0.28mm) = 90.7142857142857
    // Deze berekende ppi blijkt net niet nauwkeurig genoeg, bij de hoge resoluties wijkt het schaalgetal een klein beetje af
    // van de verwachte waarde. Daarom ppi berekend aan de hand van de zoomniveaus uit het document, bijv. zoomniveau 3:
    // 1536000 = 430.080 *  39.37 * ? >>> ? = 90.71446714322

    const resolution = this.map.getView().getResolution();
    // schaalgetal = resolutie (m/pixel) * inches/m * pixels/inch
    if (resolution) {
      this.currentScaleDenominator = Math.round(
        resolution * this.INCHES_PER_METER * this.POINTS_PER_INCH
      );
    } else {
      this.currentScaleDenominator = undefined;
    }
  }

  /**
   * Ruimt resources op door de subscription
   * op het zoom-event te beëindigen.
   */
  ngOnDestroy(): void {
    if (this.zoomendSubscription) {
      this.zoomendSubscription.unsubscribe();
    }
  }
}
