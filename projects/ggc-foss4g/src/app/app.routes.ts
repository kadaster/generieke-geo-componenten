import { Routes } from "@angular/router";
import { GgcBasicViewerComponent } from "./ggc-basic-viewer/ggc-basic-viewer.component";
import { GgcMapSearchComponent } from "./ggc-map-search/ggc-map-search.component";

export const routes: Routes = [
  { path: "basic-viewer", component: GgcBasicViewerComponent },
  { path: "map-search", component: GgcMapSearchComponent }
];
