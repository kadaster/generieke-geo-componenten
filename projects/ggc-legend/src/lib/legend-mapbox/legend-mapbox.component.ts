import { Component, effect, inject, input, signal } from "@angular/core";
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
  style = input.required<VectorTileStyle>();
  protected legendContent = signal<
    { style: MapboxStyle; items: LegendItem[] } | undefined
  >(undefined);

  private readonly mapboxStyleService: MapboxStyleService =
    inject(MapboxStyleService);

  constructor() {
    effect((onCleanup) => {
      const styleUrl = this.style().url;
      if (!styleUrl) {
        console.warn("no style url supplied");
        this.legendContent.set(undefined);
        return;
      }

      const subscription = this.mapboxStyleService
        .getMapboxStyle(styleUrl)
        .subscribe((style) => {
          const mapboxStyle = this.mapboxStyleService.removeRasterLayers(style);
          const items = this.mapboxStyleService
            .getItems(mapboxStyle, true)
            .slice()
            .sort((a, b) => String(a.title).localeCompare(String(b.title)));
          this.legendContent.set({ style: mapboxStyle, items });
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }
}
