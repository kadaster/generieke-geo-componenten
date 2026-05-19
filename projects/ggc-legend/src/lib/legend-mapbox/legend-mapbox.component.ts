import { Component, inject, Input } from "@angular/core";
import { MapboxLegendItemComponent } from "./mapbox-legend-item/mapbox-legend-item.component";
import { LegendItem, MapboxStyle } from "./model/legend-mapbox.model";
import { MapboxStyleService } from "./service/mapbox-style.service";
import { VectorTileStyle } from "@kadaster/ggc-models";

@Component({
  selector: "ggc-legend-mapbox",
  imports: [MapboxLegendItemComponent],
  templateUrl: "./legend-mapbox.component.html",
  styleUrls: ["./legend-mapbox.component.css"]
})
export class LegendMapboxComponent {
  protected mapboxStyle!: MapboxStyle;
  protected legendItems: LegendItem[] = [];
  private styleUrl!: string;

  private readonly mapboxStyleService: MapboxStyleService =
    inject(MapboxStyleService);

  /**
   * De style die moet worden weergegeven in dit legenda component.
   * @param style De weergegeven style
   */
  @Input()
  set style(style: VectorTileStyle) {
    this.styleUrl = style.url;
    this.generateLegend();
  }

  private generateLegend() {
    if (this.styleUrl) {
      this.mapboxStyleService
        .getMapboxStyle(this.styleUrl)
        .subscribe((style) => {
          this.mapboxStyle = this.mapboxStyleService.removeRasterLayers(style);
          this.legendItems = this.mapboxStyleService.getItems(
            this.mapboxStyle,
            true
          );
          this.legendItems = this.legendItems
            .slice() // kopie maken
            .sort((a, b) => String(a.title).localeCompare(String(b.title)));
        });
    } else {
      console.warn("no style url supplied");
    }
  }
}
