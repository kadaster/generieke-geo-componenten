import {
  AfterViewInit,
  Component,
  inject,
  ViewEncapsulation
} from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent,
  GgcMapService
} from "@kadaster/ggc-map";
import { githubReleasesUrl, githubUrl, tsdocsUrl } from "../constants/urls";
import { EventTrackerService } from "../service/event-tracker.service";

@Component({
  selector: "app-ggc-home",
  templateUrl: "./ggc-home.component.html",
  styleUrl: "./ggc-home.component.scss",
  imports: [GgcMapComponent, GgcLayerBrtAchtergrondkaartComponent],
  encapsulation: ViewEncapsulation.None
})
export class GgcHomeComponent implements AfterViewInit {
  readonly githubReleasesUrl = githubReleasesUrl;
  readonly githubUrl = githubUrl;
  readonly tsdocsUrl = tsdocsUrl;

  navItems = [
    {
      label: "Introductie",
      route: "#",
      piwikEvent: "introductie",
      externalLink: false
    },
    {
      label: "Voorbeelden",
      route: "/example-index",
      piwikEvent: "voorbeelden",
      externalLink: false
    },
    {
      label: "Quick start",
      route: "/quick-start",
      piwikEvent: "quick_start",
      externalLink: false
    },
    {
      label: "Technische documentatie (TS Docs)",
      route: this.tsdocsUrl,
      piwikEvent: "tsdocs",
      externalLink: true
    },
    {
      label: "GitHub",
      route: this.githubUrl,
      piwikEvent: "github",
      externalLink: true
    },
    {
      label: "Roadmap",
      route:
        "https://github.com/kadaster/generieke-geo-componenten/blob/main/ROADMAP.md",
      piwikEvent: "roadmap",
      externalLink: true
    },
    {
      label: "Releases & changelog",
      route: this.githubReleasesUrl,
      piwikEvent: "releases_en_changelog",
      externalLink: true
    }
  ];

  protected mapIndex = "banner";
  private readonly eventTrackerService = inject(EventTrackerService);
  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngAfterViewInit() {
    this.mapService.zoomToCoordinate([138650, 487959], "banner-home", 5);
  }

  trackPiwikEvent(label: string) {
    this.eventTrackerService.trackEvent("content", "click_intern", label);
  }
}
