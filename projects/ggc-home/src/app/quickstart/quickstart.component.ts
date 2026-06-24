import { Component, VERSION } from "@angular/core";
import { Highlight } from "ngx-highlightjs";
import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-quickstart",
  imports: [Highlight, GgcMapComponent, NgClass],
  templateUrl: "./quickstart.component.html",
  styleUrl: "./quickstart.component.scss"
})
export class QuickstartComponent {
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

  protected readonly webServices = [
    {
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      type: "wmts",
      layers: [
        {
          layerId: "brtAchtergrondkaartStandaard",
          title: "BRT achtergrond kaart Standaard (WMTS)",
          layerName: "standaard",
          visible: true,
          zIndex: 1
        }
      ]
    }
  ] as Webservice[];

  goToStep(step: number) {
    this.currentStep = step;
  }
}
