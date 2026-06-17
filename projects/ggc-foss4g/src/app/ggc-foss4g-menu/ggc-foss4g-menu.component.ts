import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

export type ExampleLinks = "basic-viewer" | "map-search";

@Component({
  selector: "app-ggc-foss4g-menu",
  imports: [],
  templateUrl: "./ggc-foss4g-menu.component.html",
  styleUrl: "./ggc-foss4g-menu.component.scss"
})
export class GgcFoss4gMenuComponent {
  private router: Router = inject(Router);

  protected navagateTo(route: ExampleLinks) {
    switch (route) {
      case "basic-viewer":
        this.router.navigate(["/basic-viewer"]);
        break;
      case "map-search":
        this.router.navigate(["/map-search"]);
        break;
      default:
        this.router.navigate(["/"]);
        break;
    }
  }
}
