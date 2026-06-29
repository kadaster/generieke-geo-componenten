import { Component, inject, OnInit, VERSION } from "@angular/core";
import { Highlight } from "ngx-highlightjs";
import { GgcDrawService, GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { NgClass } from "@angular/common";
import { GgcLegendComponent } from "@kadaster/ggc-legend";
import { SessionStorageService } from "../service/session-storage.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  GgcSearchLocationComponent,
  SearchLocationOptions
} from "@kadaster/ggc-search-location";
import {
  DatasetSwitcherButton,
  GgcDatasetSwitcherComponent,
  GgcDatasetTreeComponent,
  Theme
} from "@kadaster/ggc-dataset-tree";
import {
  GgcToolbarComponent,
  GgcToolbarItemComponent,
  GgcToolbarItemDrawComponent,
  GgcToolbarItemMeasureComponent,
  ToolbarItemComponentEvent
} from "@kadaster/ggc-toolbar";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

@Component({
  selector: "app-quickstart",
  imports: [
    Highlight,
    GgcMapComponent,
    NgClass,
    GgcLegendComponent,
    GgcSearchLocationComponent,
    GgcDatasetTreeComponent,
    GgcDatasetSwitcherComponent,
    GgcToolbarComponent,
    GgcToolbarItemComponent,
    GgcToolbarItemMeasureComponent,
    GgcToolbarItemDrawComponent
  ],
  templateUrl: "./quickstart.component.html",
  styleUrl: "./quickstart.component.scss"
})
export class QuickstartComponent implements OnInit {
  currentStep = 1;
  angularVersion = VERSION.major;
  mapHtml = `<div style="height: 100vh;">
  <!-- De hoogte is nodig voor het tonen van de kaart -->
  <ggc-map [webServices]="webServices"></ggc-map>
</div>`;
  mapTypescript = `import { Component } from '@angular/core';
import { GgcMapComponent, Webservice } from '@kadaster/ggc-map';

@Component({
  selector: 'app-root',
  imports: [GgcMapComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly webServices = [
    {
      "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      "type": "wmts",
      "layers": [
        {
          "layerId": "brtAchtergrondkaartStandaard",
          "title": "BRT achtergrond kaart Standaard (WMTS)",
          "layerName": "standaard",
          "visible": true,
          "zIndex": 1
        }
      ]
    }] as Webservice[];
}
`;

  legendHtml = `<div style="display:flex; height:100vh;">
  <div style="width:250px; overflow-y:auto; background:#f3f3f3; padding:10px;">
    <ggc-legend></ggc-legend>
  </div>

  <div style="flex:1;">
    <ggc-map [webServices]="webServices"></ggc-map>
  </div>
</div>`;

  legendTypescript = `import { Component } from '@angular/core';
import { GgcLegendComponent } from '@kadaster/ggc-legend';
import { GgcMapComponent, Webservice } from '@kadaster/ggc-map';

@Component({
  selector: 'app-root',
  imports: [GgcMapComponent, GgcLegendComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly webServices = [
    {
      "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      "type": "wmts",
      "layers": [
        {
          "layerId": "brtAchtergrondkaartStandaard",
          "title": "BRT achtergrond kaart Standaard (WMTS)",
          "activeLegend": {
            "legendUrl": "https://service.pdok.nl/lv/bgt/wmts/v1_0/standaardvisualisatie/legend.png"
          },
          "layerName": "standaard",
          "visible": true,
          "zIndex": 1
        }
      ]
    }] as Webservice[];
}`;

  searchLocationHtml = `<ggc-search-location [searchLocationOptions]="searchLocationOptions"></ggc-search-location>
<div style="height:90vh;">
  <ggc-map [webServices]="webServices"></ggc-map>
</div>
`;

  searchLocationTypescript = `import { Component } from '@angular/core';
import { GgcMapComponent, Webservice } from '@kadaster/ggc-map';
import { GgcSearchLocationComponent, SearchLocationOptions } from '@kadaster/ggc-search-location';

@Component({
  selector: 'app-root',
  imports: [GgcMapComponent, GgcSearchLocationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly webServices = [
    {
      "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      "type": "wmts",
      "layers": [
        {
          "layerId": "brtAchtergrondkaartStandaard",
          "title": "BRT achtergrond kaart Standaard (WMTS)",
          "layerName": "standaard",
          "visible": true,
          "zIndex": 1
        }
      ]
    }] as Webservice[];

  protected readonly searchLocationOptions = {
    zoomToResult: true,
    markResult: true
  } as SearchLocationOptions;
}`;

  datasetTreeHtml = `<div style="display:flex; height:100vh;">
  <div style="width:250px; overflow-y:auto; background:#f3f3f3; padding:10px;">
    <ggc-dataset-tree
      [themes]="datasetTreeConfig"
      [expandTreeOnInit]="true"
    ></ggc-dataset-tree>
  </div>
  <div style="flex:1;">
    <ggc-map [webServices]="webServices"></ggc-map>
  </div>
</div>`;

  datasetTreeTypescript = `import { Component } from '@angular/core';
import { GgcDatasetTreeComponent, Theme } from '@kadaster/ggc-dataset-tree';
import { GgcMapComponent, Webservice } from '@kadaster/ggc-map';

@Component({
  selector: 'app-root',
  imports: [GgcMapComponent, GgcDatasetTreeComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly webServices = [
    {
      "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      "type": "wmts",
      "layers": [
        {
          "layerId": "brtAchtergrondkaartStandaard",
          "title": "BRT achtergrond kaart Standaard (WMTS)",
          "layerName": "standaard",
          "visible": true,
          "zIndex": -20
        }
      ]
    },
    {
      "url": "https://service.pdok.nl/kadaster/bestuurlijkegebieden/wms/v1_0",
      "type": "wms",
      "layers": [
        {
          "layerId": "provincies",
          "title": "Provincies",
          "layerName": "provinciegebied",
          "visible": false
        },
        {
          "layerId": "gemeenten",
          "title": "Gemeenten",
          "layerName": "gemeentegebied",
          "visible": true
        }
      ]
    }
  ] as Webservice[];

  protected readonly datasetTreeConfig = [
    {
      "themeName": "Achtergrond kaart",
      "datasets": [
        {
          "datasetName": "BRT Achtergrond",
          "services": [
            {
              "layers": [
                { "layerId": "brtAchtergrondkaartStandaard" }
              ]
            }
          ]
        }
      ]
    },
    {
      "themeName": "Een andere data verzameling",
      "datasets": [
        {
          "datasetName": "Bestuurlijke gebieden (wms)",
          "services": [
            {
              "layers": [
                { "layerId": "provincies" },
                { "layerId": "gemeenten" }
              ]
            }
          ]
        }
      ]
    }
  ] as Theme[];
}`;

  datasetSwitcherHtml = `<div style="display:flex; height:100vh;">
  <div style="width:250px; overflow-y:auto; background:#f3f3f3; padding:10px;">
    <ggc-dataset-switcher
    [themes]="datasetSwitcherConfig"
    [datasetSwitcherButtons]="datasetSwitcherButtons"
  ></ggc-dataset-switcher>
  </div>
  <div style="flex:1;">
    <ggc-map [webServices]="webServices"></ggc-map>
  </div>
</div>`;

  datasetSwitcherScss = `ggc-dataset-switcher ::ng-deep .ggc-ds-switcher-label {
  display: block;
  border-radius: 5px;
  border: solid 2px black;
  margin-left: 2.5rem;
}

ggc-dataset-switcher ::ng-deep .ggc-ds-switcher-label-img {
  display: none;
}

ggc-dataset-switcher ::ng-deep .ggc-ds-switcher-radio-button {
  top: unset;
  width: 24px;
  height: 24px;
  margin-top: 16px;
}

ggc-dataset-switcher ::ng-deep .ggc-ds-switcher-radio-button:first-child {
  margin-top: 26px;
}

ggc-dataset-switcher ::ng-deep .ggc-ds-switcher-label-txt {
  font-size: 1rem;
}`;

  datasetSwitcherTypescript = `import { Component } from '@angular/core';
import { GgcDatasetSwitcherComponent, DatasetSwitcherButton, Theme } from '@kadaster/ggc-dataset-tree';
import { GgcMapComponent, Webservice } from '@kadaster/ggc-map';

@Component({
  selector: 'app-root',
  imports: [GgcMapComponent, GgcDatasetSwitcherComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly webServices = [
    {
      "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      "type": "wmts",
      "layers": [
        {
          "layerId": "brt-achtergrondkaart-standaard",
          "title": "Standaard",
          "layerName": "standaard",
          "visible": true,
          "zIndex": -10,
          "minResolution": 0.21
        }
      ]
    },
    {
      "url": "https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0",
      "type": "wmts",
      "layers": [
        {
          "layerId": "luchtfoto_actueel_orthohr",
          "title": "Luchtfoto Actueel Ortho 8cm RGB",
          "layerName": "Actueel_orthoHR",
          "visible": false,
          "zIndex": -10,
          "minResolution": 0.0525
        }
      ]
    }
  ] as Webservice[];

  protected readonly datasetSwitcherConfig = [
    {
      "themeName": "BRT-A standaard",
      "datasets": [
        {
          "datasetName": "BRT Achtergrondkaart",
          "services": [
            {
              "layers": [
                {
                  "layerId": "brt-achtergrondkaart-standaard"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "themeName": "Luchtfoto",
      "datasets": [
        {
          "datasetName": "Luchtfoto",
          "services": [
            {
              "layers": [
                {
                  "layerId": "luchtfoto_actueel_orthohr"
                }
              ]
            }
          ]
        }
      ]
    }
  ] as Theme[];

  datasetSwitcherButtons: DatasetSwitcherButton[] = [
    {
      name: "BRT-A standaard",
      imageUrl:
        "-"
    },
    {
      name: "Luchtfoto",
      imageUrl:
        "-"
    }
  ];
}`;

  toolbarHtml = `  <ggc-toolbar class="toolbar-position">
    <ggc-toolbar-item
      icon="fas fa-ruler"
      (activeChanged)="changeMeasureState($event)"
      [title]="'Meten'"
    >
      @if (measureActive) {
        <ggc-toolbar-item-measure
          stopIcon="fas fa-mouse-pointer"
          measureLineIcon="fas fa-ruler-horizontal"
          measurePolygonIcon="fas fa-ruler-combined"
          moveIcon="far fa-hand-paper"
          editIcon="fas fa-pencil-alt"
          deleteIcon="fas fa-eraser"
        ></ggc-toolbar-item-measure>
      }
    </ggc-toolbar-item>
    <ggc-toolbar-item
      icon="fas fa-pencil-alt"
      (activeChanged)="changeDrawState($event)"
      [title]="'Tekenen'"
    >
      @if (drawActive) {
        <ggc-toolbar-item-draw
          stopIcon="fas fa-mouse-pointer"
          drawIcon="fas fa-circle"
          drawLineIcon="fas fa-project-diagram"
          drawCircleIcon="far fa-dot-circle"
          drawRectangleIcon="far fa-square"
          drawPolygonIcon="fas fa-draw-polygon"
          deleteIcon="fas fa-trash-alt"
          moveIcon="far fa-hand-paper"
          editIcon="fas fa-pencil-alt"
        ></ggc-toolbar-item-draw>
      }
    </ggc-toolbar-item>
  </ggc-toolbar>
<div style="height:90vh;">
  <ggc-map [webServices]="webServices"></ggc-map>
</div>`;
  toolbarTypescript = `import { Component, inject } from '@angular/core';
import {
  GgcToolbarComponent,
  GgcToolbarItemComponent,
  GgcToolbarItemDrawComponent,
  GgcToolbarItemMeasureComponent,
  ToolbarItemComponentEvent
} from "@kadaster/ggc-toolbar";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

import { GgcDrawService, GgcMapComponent, Webservice } from '@kadaster/ggc-map';

@Component({
  selector: 'app-root',
  imports: [GgcMapComponent, GgcToolbarComponent, GgcToolbarItemComponent, GgcToolbarItemMeasureComponent,
    GgcToolbarItemDrawComponent,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly webServices = [
    {
      "url": "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      "type": "wmts",
      "layers": [
        {
          "layerId": "brt-achtergrondkaart-standaard",
          "title": "Standaard",
          "layerName": "standaard",
          "visible": true,
          "zIndex": -10,
          "minResolution": 0.21
        }
      ]
    }
  ] as Webservice[];

  protected measureActive = false;
  protected drawActive = false;

  private readonly drawService = inject(GgcDrawService);

  changeMeasureState(event: ToolbarItemComponentEvent) {
    this.measureActive = event.active;
    this.drawActive = false;
    this.drawService.stopDraw(DEFAULT_MAPINDEX);
  }

  changeDrawState(event: ToolbarItemComponentEvent) {
    this.drawActive = event.active;
    this.measureActive = false;
    this.drawService.stopDraw(DEFAULT_MAPINDEX);
  }
}`;

  bootstrapFontawesomeHtml = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css" rel="stylesheet">`;

  protected readonly webServices = [
    {
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      type: "wmts",
      layers: [
        {
          layerId: "brtAchtergrondkaartStandaard",
          title: "BRT achtergrond kaart Standaard (WMTS)",
          activeLegend: {
            legendUrl:
              "https://service.pdok.nl/lv/bgt/wmts/v1_0/standaardvisualisatie/legend.png"
          },
          layerName: "standaard",
          visible: true,
          zIndex: 1
        }
      ]
    }
  ] as Webservice[];

  protected readonly webServicesDatasetTree = [
    {
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      type: "wmts",
      layers: [
        {
          layerId: "brtAchtergrondkaartStandaard",
          title: "BRT achtergrond kaart Standaard (WMTS)",
          layerName: "standaard",
          visible: true,
          zIndex: -20
        }
      ]
    },
    {
      url: "https://service.pdok.nl/kadaster/bestuurlijkegebieden/wms/v1_0",
      type: "wms",
      layers: [
        {
          layerId: "provincies",
          title: "Provincies",
          layerName: "provinciegebied",
          visible: false
        },
        {
          layerId: "gemeenten",
          title: "Gemeenten",
          layerName: "gemeentegebied",
          visible: true
        }
      ]
    }
  ] as Webservice[];

  protected readonly datasetTreeConfig = [
    {
      themeName: "Achtergrond kaart",
      datasets: [
        {
          datasetName: "BRT Achtergrond",
          services: [
            {
              layers: [{ layerId: "brtAchtergrondkaartStandaard" }]
            }
          ]
        }
      ]
    },
    {
      themeName: "Een andere data verzameling",
      datasets: [
        {
          datasetName: "Bestuurlijke gebieden (wms)",
          services: [
            {
              layers: [{ layerId: "provincies" }, { layerId: "gemeenten" }]
            }
          ]
        }
      ]
    }
  ] as Theme[];

  protected readonly webServicesDatasetSwitcher = [
    {
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      type: "wmts",
      layers: [
        {
          layerId: "brt-achtergrondkaart-standaard",
          title: "Standaard",
          layerName: "standaard",
          visible: true,
          zIndex: -10,
          minResolution: 0.21
        }
      ]
    },
    {
      url: "https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0",
      type: "wmts",
      layers: [
        {
          layerId: "luchtfoto_actueel_orthohr",
          title: "Luchtfoto Actueel Ortho 8cm RGB",
          layerName: "Actueel_orthoHR",
          visible: false,
          zIndex: -10,
          minResolution: 0.0525
        }
      ]
    }
  ] as Webservice[];

  protected readonly datasetSwitcherConfig = [
    {
      themeName: "BRT-A standaard",
      datasets: [
        {
          datasetName: "BRT Achtergrondkaart",
          services: [
            {
              layers: [
                {
                  layerId: "brt-achtergrondkaart-standaard"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      themeName: "Luchtfoto",
      datasets: [
        {
          datasetName: "Luchtfoto",
          services: [
            {
              layers: [
                {
                  layerId: "luchtfoto_actueel_orthohr"
                }
              ]
            }
          ]
        }
      ]
    }
  ] as Theme[];

  protected datasetSwitcherButtons: DatasetSwitcherButton[] = [
    {
      name: "BRT-A standaard",
      imageUrl: "-"
    },
    {
      name: "Luchtfoto",
      imageUrl: "-"
    }
  ];

  protected measureActive = false;
  protected drawActive = false;
  protected readonly searchLocationOptions = {
    zoomToResult: true,
    markResult: true
  } as SearchLocationOptions;

  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly drawService = inject(GgcDrawService);

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.currentStep = +params["step"] || 1;
    });
  }

  goToMapLayerVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Kaartlagen"]);
    this.router.navigate(["/example-index"]);
  }

  goToLegendVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Legenda"]);
    this.router.navigate(["/example-index"]);
  }

  goToZoekenVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Zoeken"]);
    this.router.navigate(["/example-index"]);
  }

  goToDatasetVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Kaartweergave kiezen"]);
    this.router.navigate(["/example-index"]);
  }

  goToToolbarVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Werkbalk"]);
    this.router.navigate(["/example-index"]);
  }

  changeMeasureState(event: ToolbarItemComponentEvent) {
    this.measureActive = event.active;
    this.drawActive = false;
    this.drawService.stopDraw(DEFAULT_MAPINDEX);
  }

  changeDrawState(event: ToolbarItemComponentEvent) {
    this.drawActive = event.active;
    this.measureActive = false;
    this.drawService.stopDraw(DEFAULT_MAPINDEX);
  }

  navigeerNaarHoofdstuk(step: number) {
    this.router.navigate([], {
      queryParams: { step },
      queryParamsHandling: "merge"
    });
  }

  volgendeHoofdstuk() {
    this.router.navigate([], {
      queryParams: { step: this.currentStep + 1 },
      queryParamsHandling: "merge"
    });

    const h2Elements = document.querySelectorAll("h2");
    if (h2Elements.length >= 1) {
      const secondH2 = h2Elements[0] as HTMLElement;

      secondH2.setAttribute("tabindex", "-1"); // nodig als h2 niet focusbaar is
      secondH2.focus();
      secondH2.scrollIntoView({ behavior: "smooth" });
    }
  }
}
