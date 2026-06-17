import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import {
  GgcLayerBrtAchtergrondkaartComponent,
  GgcMapComponent
} from "@kadaster/ggc-map";
import { GgcSearchLocationComponent } from "@kadaster/ggc-search-location";

export type ExampleLinks = "opdracht 1" | "opdracht 2" | "opdracht 3";

@Component({
  selector: "app-ggc-foss4g-menu",
  imports: [
    GgcLayerBrtAchtergrondkaartComponent,
    GgcMapComponent,
    GgcSearchLocationComponent
  ],
  templateUrl: "./ggc-foss4g-menu.component.html",
  styleUrl: "./ggc-foss4g-menu.component.scss"
})
export class GgcFoss4gMenuComponent {
  private router: Router = inject(Router);

  protected navagateTo(route: ExampleLinks) {
    switch (route) {
      case "opdracht 1":
        this.router.navigate(["/opdracht1"]);
        break;
      case "opdracht 2":
        this.router.navigate(["/opdracht2"]);
        break;
      case "opdracht 3":
        this.router.navigate(["/opdracht3"]);
        break;
      default:
        this.router.navigate(["/"]);
        break;
    }
  }
}
