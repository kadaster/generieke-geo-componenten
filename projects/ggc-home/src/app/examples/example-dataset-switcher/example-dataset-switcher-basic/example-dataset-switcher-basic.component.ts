import { Component, inject } from "@angular/core";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { ExampleFormatComponent } from "../../example-format/example-format.component";
import { ComponentInfo } from "../../component-info.model";
import {
  DatasetSwitcherButton,
  DatasetSwitcherEvent,
  GgcDatasetSwitcherComponent,
  Theme
} from "@kadaster/ggc-dataset-tree";
import { HttpClient } from "@angular/common/http";
import { Components } from "../../components.enum";
import { Tags } from "../../tags.enum";
import { Themes } from "../../themes.enum";

@Component({
  selector: "app-dataset-switcher",
  imports: [
    GgcDatasetSwitcherComponent,
    GgcMapComponent,
    ExampleFormatComponent
  ],
  templateUrl: "./example-dataset-switcher-basic.component.html",
  styleUrl: "./example-dataset-switcher-basic.component.scss"
})
export class ExampleDatasetSwitcherBasicComponent {
  readonly componentInfo: ComponentInfo = {
    route: "/dataset-switcher",
    title: "Dataset wisselen",
    introduction: "Eén of meerdere kaartlagen wisselen met een grafische knop.",
    components: [Components.GGC_DATASET_SWITCHER],
    theme: [Themes.KAARTWEERGAVE_KIEZEN],
    tags: [Tags.DATASET, Tags.LAYER],
    imageLocation:
      "code/examples/example-dataset-switcher/example-dataset-switcher-basic/example-dataset-switcher-basic.png"
  } as ComponentInfo;

  mapConfig: Webservice[];
  datasetSwitcherConfig: Theme[];

  datasetSwitcherButtons: DatasetSwitcherButton[] = [
    {
      name: "BRT-A standaard",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/brt-a-standaard.png"
    },
    {
      name: "BRT-A Grijs",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/brt-a-grijs.png"
    },
    {
      name: "BRT-A Pastel",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/brt-a-pastel.png"
    },
    {
      name: "BRT-A Water",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/brt-a-water.png"
    },
    {
      name: "Luchtfoto",
      imageUrl:
        "code/examples/example-dataset-switcher/thumbnails/luchtfoto.png"
    }
  ];
  private readonly httpClient = inject(HttpClient);

  constructor() {
    this.httpClient
      .get(
        "code/examples/example-dataset-switcher/example-dataset-switcher-kaartconfig.json"
      )
      .subscribe((data) => (this.mapConfig = data as Webservice[]));
    this.httpClient
      .get(
        "code/examples/example-dataset-switcher/example-dataset-switcher-treeconfig.json"
      )
      .subscribe((data) => (this.datasetSwitcherConfig = data as Theme[]));
  }

  logSwitchEvent(datasetSwitcherEvent: DatasetSwitcherEvent) {
    console.log(datasetSwitcherEvent);
  }
}
