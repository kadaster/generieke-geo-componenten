import { Component } from "@angular/core";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";

@Component({
  selector: "app-basic-viewer",
  imports: [GgcLayerBrtAchtergrondkaartComponent, GgcMapComponent],
  templateUrl: "./ggc-basic-viewer.component.html",
  styleUrl: "./ggc-basic-viewer.component.scss"
})
export class GgcBasicViewerComponent {}
