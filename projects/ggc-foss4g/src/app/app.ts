import { Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { BasicViewerComponent } from "./basic-viewer/basic-viewer.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, BasicViewerComponent],
  templateUrl: "./app.html"
})
export class App {
  protected readonly title = signal("ggc-foss4g");
}
