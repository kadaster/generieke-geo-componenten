import { Component, inject, signal } from "@angular/core";

import { Router, RouterOutlet } from "@angular/router";
import { MenuBarComponent } from "./menu-bar/menu-bar.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, MenuBarComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss"
})
export class App {
  protected readonly title = signal("GGC Home");
  private readonly router = inject(Router);

  focusContent(): void {
    switch (this.router.url) {
      case "/example-index":
        (
          document.querySelector(".col-md-9 a:nth-child(1)") as HTMLElement
        )?.focus();
        break;
      default:
        document.getElementById("main-content")?.focus();
    }
  }
}
