import { Component, Input } from "@angular/core";
import { IconList } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-legend-icon",
  templateUrl: "./ggc-legend-icon.component.html",
  styleUrls: ["./ggc-legend-icon.component.css"]
})
export class GgcLegendIconComponent {
  /**
   * De iconlist die wordt weergegeven in het component
   */
  @Input() icons: IconList[];
}
