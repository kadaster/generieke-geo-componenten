import { Component, inject, signal } from "@angular/core";

import { Router, RouterOutlet } from "@angular/router";
import { MenuBarComponent } from "./menu-bar/menu-bar.component";
import { PiwikScriptLoaderService } from "./service/piwik-script-loader.service";

@Component({
  selector: "ggc-home-root",
  imports: [RouterOutlet, MenuBarComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss"
})
export class App {
  protected readonly title = signal("GGC Home");
  private readonly router = inject(Router);
  private readonly piwikScriptLoader = inject(PiwikScriptLoaderService);

  constructor() {
    this.piwikScriptLoader.loadPiwikScript();
  }

  focusContent(): void {
    if (this.router.url === "/example-index") {
      (
        document.querySelector(".col-md-9 a:nth-child(1)") as HTMLElement
      )?.focus();
    } else {
      document.getElementById("main-content")?.focus();
    }
  }
}
