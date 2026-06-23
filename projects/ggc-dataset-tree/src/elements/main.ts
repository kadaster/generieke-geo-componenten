import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { createCustomElement } from "@angular/elements";
import { createApplication } from "@angular/platform-browser";
import {GgcDatasetTreeComponent} from "../lib/dataset-tree/dataset-tree/ggc-dataset-tree.component";

const GGC_DATASET_TREE_ELEMENT_TAG_NAME = "ggc-dataset-tree-element";

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
  })
  .catch((error: unknown) => console.error(error));
