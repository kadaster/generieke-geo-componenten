import { Component, Input } from "@angular/core";
import { Legend } from "../model/legend.model";

@Component({
  selector: "ggc-legend-empty",
  imports: [],
  templateUrl: "./legend-empty.component.html"
})
export class LegendEmptyComponent {
  /**
   * Als true, dan wordt de emptyLegendMessage weergegeven als er een legenda is.
   */
  @Input() showEmptyLegendMessage: boolean;
  /**
   * De message die wordt weergegeven bij een lege agenda als showEmptyLegendMessage is true.
   */
  @Input() emptyLegendMessage: string;
  /**
   * De legenda om weer te geven.
   */
  @Input() legend: Legend;
}
