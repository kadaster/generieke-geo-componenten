import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { createCustomElement } from "@angular/elements";
import { createApplication } from "@angular/platform-browser";
import {GgcDatasetTreeComponent} from "../lib/dataset-tree/dataset-tree/ggc-dataset-tree.component";
import {GgcMapComponent} from "@kadaster/ggc-map/src/lib/map/ggc-map.component";

const GGC_DATASET_TREE_ELEMENT_TAG_NAME = "ggc-dataset-tree-element";
const GGC_MAP_ELEMENT_TAG_NAME = "ggc-map-element";

createApplication({
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
  .then((appRef) => {
    if (!customElements.get(GGC_DATASET_TREE_ELEMENT_TAG_NAME)) {
      customElements.define(
        GGC_DATASET_TREE_ELEMENT_TAG_NAME,
        createCustomElement(GgcDatasetTreeComponent, {
          injector: appRef.injector
        })
      );
    }
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
