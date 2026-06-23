import 'zone.js';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import { GgcSearchLocationComponent } from "@kadaster/ggc-search-location";
import {GgcMapComponent,GgcLayerBrtAchtergrondkaartComponent} from "@kadaster/ggc-map";

(async () => {
  const app = await createApplication({
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
    ]
  });

  const GgcSearchLocationElement = createCustomElement(GgcSearchLocationComponent, {
    injector: app.injector
  });

  const GgcMap = createCustomElement(GgcMapComponent, {
    injector: app.injector
  });

  const GgcLayerBrtAchtergrondkaart = createCustomElement(GgcLayerBrtAchtergrondkaartComponent, {
    injector: app.injector
  });

  customElements.define('ggc-search-location', GgcSearchLocationElement);
  customElements.define('ggc-map', GgcMap);
  customElements.define('ggc-layer-brt-achtergrondkaart', GgcLayerBrtAchtergrondkaart);
})();
