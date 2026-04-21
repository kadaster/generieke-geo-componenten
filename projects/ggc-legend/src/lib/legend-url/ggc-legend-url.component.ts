import { Component, Input } from "@angular/core";
import { LegendUrl } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-legend-url",
  templateUrl: "./ggc-legend-url.component.html"
})
export class GgcLegendUrlComponent {
  /**
   * De legenda url van de legenda die wordt weergegeven in dit component
   */
  @Input() legend: LegendUrl;
  /**
   * De naam van de laag die wordt weergegeven. Deze wordt gebruikt als alternatieve tekst.
   */
  @Input() layerName: string;
}
