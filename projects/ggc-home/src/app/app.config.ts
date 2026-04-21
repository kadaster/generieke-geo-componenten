import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from "@angular/core";
import { provideRouter, withInMemoryScrolling } from "@angular/router";
import { provideHighlightOptions } from "ngx-highlightjs";

import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: "top",
        anchorScrolling: "enabled"
      })
    ),
    provideHighlightOptions({
      fullLibraryLoader: () => import("highlight.js")
    })
  ]
};
