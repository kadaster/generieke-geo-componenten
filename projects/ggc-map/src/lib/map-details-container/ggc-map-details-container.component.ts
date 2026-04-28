import { Component } from "@angular/core";

/**
 * Containercomponent voor het tonen van detailinformatie
 * gerelateerd aan de kaart.
 *
 * Deze component fungeert als structurele wrapper en bevat
 * zelf geen logica. De inhoud wordt bepaald door de bijbehorende
 * template en eventueel ingesloten child‑componenten.
 *
 * @example
 * <ggc-map-details-container>
 *   <ggc-feature-info></ggc-feature-info>
 *   <ggc-selection-details></ggc-selection-details>
 * </ggc-map-details-container>
 */
@Component({
  selector: "ggc-map-details-container",
  templateUrl: "./ggc-map-details-container.component.html",
  styleUrls: ["./ggc-map-details-container.component.css"]
})
export class GgcMapDetailsContainerComponent {}
