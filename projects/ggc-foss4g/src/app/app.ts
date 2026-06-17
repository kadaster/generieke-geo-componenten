import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { GgcFoss4gMenuComponent } from "./ggc-foss4g-menu/ggc-foss4g-menu.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, GgcFoss4gMenuComponent],
  templateUrl: "./app.html"
})
export class App {}
