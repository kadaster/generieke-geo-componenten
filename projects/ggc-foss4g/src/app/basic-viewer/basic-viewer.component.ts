import { Component } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";

@Component({
  selector: "app-basic-viewer",
  imports: [GgcLayerBrtAchtergrondkaartComponent, GgcMapComponent],
  templateUrl: "./basic-viewer.component.html",
  styleUrl: "./basic-viewer.component.scss"
})
export class BasicViewerComponent {}
