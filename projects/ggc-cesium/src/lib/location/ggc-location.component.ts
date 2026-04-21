import { Component, inject, Input } from "@angular/core";
import { GgcLocationService } from "../service/ggc-location.service";

/**
 * Component die een knop toont om naar de huidige locatie te zoomen in Cesium.
 *
 * Dit component maakt gebruik van LocationService om de locatie op te vragen
 * en de camera te verplaatsen.
 */
@Component({
  selector: "ggc-cesium-location",
  templateUrl: "./ggc-location.component.html",
  styleUrls: ["./ggc-location.component.scss"]
})
export class GgcLocationComponent {
  /**
   * Het icoon dat wordt weergegeven op de knop.
   * Standaard is dit `"fal fa-crosshairs"`.
   *
   * @example "fas fa-location-arrow"
   */
  @Input() icon = "fal fa-crosshairs";

  /**
   * Tooltiptekst die verschijnt bij hover over de knop.
   * Standaard is dit `"Zoom naar huidige locatie"`.
   */
  @Input() tooltip = "Zoom naar huidige locatie";

  /**
   * Injectie van LocationService om locatie-functionaliteit te gebruiken.
   */
  private locationService = inject(GgcLocationService);

  /**
   * Zoomt de Cesium-camera naar de huidige locatie van de gebruiker.
   *
   * Roept LocationService.zoomToCurrentLocation aan.
   */
  zoomToLocation(): void {
    this.locationService.zoomToCurrentLocation();
  }
}
