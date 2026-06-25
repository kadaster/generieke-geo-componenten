import {Component, inject, VERSION} from "@angular/core";
import { Highlight } from "ngx-highlightjs";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { NgClass } from "@angular/common";
import {GgcLegendComponent} from "@kadaster/ggc-legend";
import {SessionStorageService} from "../service/session-storage.service";
import {Router} from "@angular/router";
import {GgcSearchLocationComponent, SearchLocationOptions} from "@kadaster/ggc-search-location";

@Component({
  selector: "app-quickstart",
  imports: [Highlight, GgcMapComponent, NgClass, GgcLegendComponent, GgcSearchLocationComponent],
  templateUrl: "./quickstart.component.html",
  styleUrl: "./quickstart.component.scss"
})
export class QuickstartComponent {
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly router = inject(Router);
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
            "legendUrl": "https://service.pdok.nl/lv/bgt/wmts/v1_0/standaardvisualisatie/legend.png"
          },
          layerName: "standaard",
          visible: true,
          zIndex: 1
        }
      ]
    }
  ] as Webservice[];

  protected readonly searchLocationOptions = {
    zoomToResult: true,
    markResult: true
  } as SearchLocationOptions;

  goToMapLayerVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Kaartlagen"]);
    this.router.navigate(['/example-index']);
  }

  goToLegendVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Legenda"]);
    this.router.navigate(['/example-index']);
  }

  goToZoekenVoorbeelden() {
    this.sessionStorageService.removeSessionStorage();
    this.sessionStorageService.setSelectedThemes(["Zoeken"]);
    this.router.navigate(['/example-index']);
  }
}
