import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { createCustomElement } from "@angular/elements";
import { createApplication } from "@angular/platform-browser";
import { GgcMapComponent } from "../lib/map/ggc-map.component";

const GGC_MAP_ELEMENT_TAG_NAME = "ggc-map-element";

createApplication({
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
  .then((appRef) => {
    if (!customElements.get(GGC_MAP_ELEMENT_TAG_NAME)) {
      customElements.define(
        GGC_MAP_ELEMENT_TAG_NAME,
        createCustomElement(GgcMapComponent, {
          injector: appRef.injector
        })
      );
    }
  })
  .catch((error: unknown) => console.error(error));
