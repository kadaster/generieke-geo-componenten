import {
  Component,
  computed,
  effect,
  inject,
  Input,
  signal
} from "@angular/core";
import { LegendUrl } from "@kadaster/ggc-models";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer } from "@angular/platform-browser";
import DOMPurify from "dompurify";

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

  /**
   * Checkt of de legenda url een svg is.
   */
  isSvg = computed(
    () =>
      this.legend?.legendUrl && /\.svg(?:\?.*)?$/i.test(this.legend.legendUrl)
  );

  /**
   * Indien svg wordt weergegeven, bevat deze de veilige svg content.
   */
  svgContent = signal<string>("");

  private readonly httpClient = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);

  constructor() {
    effect(() => {
      this.svgContent.set("");
      const url = this.legend.legendUrl;

      if (!url || !this.isSvg()) return;

      this.httpClient.get(url, { responseType: "text" }).subscribe((svg) => {
        const clean = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
          ADD_ATTR: ["role"]
        });
        this.svgContent.set(
          this.sanitizer.bypassSecurityTrustHtml(clean) as any
        );
      });
    });
  }
}
