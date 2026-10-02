import { Component, input } from "@angular/core";
import { Legend } from "../model/legend.model";

@Component({
  selector: "ggc-legend-empty",
  imports: [],
  templateUrl: "./legend-empty.component.html"
})
export class LegendEmptyComponent {
  /**
   * Als true, dan wordt de emptyLegendMessage weergegeven als er geen legenda beschikbaar is.
   */
  showEmptyLegendMessage = input(false);
  /**
   * De message die wordt weergegeven bij een lege agenda als showEmptyLegendMessage is true.
   */
  emptyLegendMessage = input<string>();
  /**
   * De legenda om weer te geven.
   */
  legend = input<Legend>();
}
