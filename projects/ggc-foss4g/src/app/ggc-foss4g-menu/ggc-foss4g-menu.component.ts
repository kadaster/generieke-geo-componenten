import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";

@Component({
  selector: "app-ggc-foss4g-menu",
  imports: [],
  templateUrl: "./ggc-foss4g-menu.component.html",
  styleUrl: "./ggc-foss4g-menu.component.scss"
})
export class GgcFoss4gMenuComponent {
  private readonly router: Router = inject(Router);

  protected navigateTo(route: string) {
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
        this.router.navigate(["/opdracht1"]);
        break;
    }
  }
}
