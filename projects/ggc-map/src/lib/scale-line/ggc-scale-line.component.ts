import type { ElementRef } from "@angular/core";
import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from "@angular/core";
import { ScaleLine } from "ol/control";
import { Options as ScaleLineOptions, Units } from "ol/control/ScaleLine";
import OlMap from "ol/Map";
import { GgcMapDetailsContainerComponent } from "../map-details-container/ggc-map-details-container.component";
import { CoreMapService } from "../map/service/core-map.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * Component dat een OpenLayers ScaleLine (schaalbalk) toevoegt aan een kaart.
 *
 * De schaal kan:
 * - standaard op de kaart worden getoond
 * - of binnen een MapDetailsContainerComponent, indien deze als parent aanwezig is.
 */
@Component({
  selector: "ggc-scale-line",
  templateUrl: "./ggc-scale-line.component.html",
  styleUrls: ["./ggc-scale-line.component.css"]
})

/**
 * Optionele injectie van de MapDetailsContainer.
 * Indien aanwezig wordt de ScaleLine daarin gerenderd
 * in plaats van in de standaard kaartoverlay.
 */
export class GgcScaleLineComponent implements OnInit, OnDestroy {
  mapDetailsContainer = inject(GgcMapDetailsContainerComponent, {
    optional: true
  });

  /**
   * Index van de kaart waaraan de schaalbalk
   * moet worden toegevoegd.
   */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  /**
   * Eenheden waarin de schaal wordt weergegeven.
   * Standaard: metrisch.
   */
  @Input() units: Units = "metric";

  /**
   * Referentie naar het HTML‑element
   * dat als target dient voor de ScaleLine.
   */
  @ViewChild("ggcScaleLine", { static: true }) ggcScaleLine: ElementRef;
  private map: OlMap;
  private scaleControl: ScaleLine;
  private readonly coreMapService = inject(CoreMapService);

  /**
   * Initialiseert de ScaleLine:
   * - maakt de control aan
   * - haalt de kaart op
   * - voegt de control toe aan de kaart
   */
  ngOnInit(): void {
    this.scaleControl = new ScaleLine(this.createScaleLineOptions());

    this.map = this.coreMapService.getMap(this.mapIndex);
    this.map.addControl(this.scaleControl);
  }

  /**
   * Maakt de configuratie‑opties aan voor de ScaleLine.
   *
   * Wanneer een MapDetailsContainer aanwezig is,
   * wordt het target gezet op het bijbehorende
   * native DOM‑element.
   */
  createScaleLineOptions(): ScaleLineOptions {
    const options: ScaleLineOptions = {
      units: this.units
    };
    // Wanneer de MapDetailsContainerComponent aanwezig is,
    // wordt de schaalbalk daarin gerenderd in plaats van
    // op de standaard kaartpositie.
    if (this.mapDetailsContainer) {
      options.target = this.ggcScaleLine.nativeElement;
    }
    return options;
  }

  /**
   * Verwijdert de ScaleLine control
   * van de kaart bij het vernietigen van het component.
   */
  ngOnDestroy(): void {
    if (this.map !== undefined) {
      this.map.removeControl(this.scaleControl);
    }
  }
}
