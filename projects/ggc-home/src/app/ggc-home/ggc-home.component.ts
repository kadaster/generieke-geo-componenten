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

@Component({
  selector: "app-ggc-home",
  templateUrl: "./ggc-home.component.html",
  styleUrl: "./ggc-home.component.scss",
  imports: [GgcMapComponent, GgcLayerBrtAchtergrondkaartComponent],
  encapsulation: ViewEncapsulation.None
})
export class GgcHomeComponent implements AfterViewInit {
  protected mapIndex = "banner";
  protected readonly tsdocsUrl = tsdocsUrl;
  protected readonly githubUrl = githubUrl;
  protected readonly githubReleasesUrl = githubReleasesUrl;
  private readonly mapService: GgcMapService = inject(GgcMapService);

  ngAfterViewInit() {
    this.mapService.zoomToCoordinate([138650, 487959], "banner-home", 5);
  }
}
