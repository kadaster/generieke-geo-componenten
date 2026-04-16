import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import TileLayer from "ol/layer/Tile";
import WMTS from "ol/source/WMTS";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { AbstractBaseLayerComponent } from "../abstract-base-layer/abstract-base-layer.component";

/**
 * Door `<ggc-layer-brt-achtergrondkaart></ggc-layer-brt-achtergrondkaart>` op te
 * nemen in de HTML wordt de brt achtergrondkaart toegevoegd aan de kaart.
 *
 * @example
 * <ggc-layer-brt-achtergrondkaart [mapIndex]="'kaart1'"></ggc-layer-brt-achtergrondkaart>
 */
@Component({
  selector: "ggc-layer-brt-achtergrondkaart",
  template: ""
})
export class GgcLayerBrtAchtergrondkaartComponent
  extends AbstractBaseLayerComponent<any>
  implements OnInit, OnDestroy
{
  /**
   * Naam van de kaart waarin deze laag wordt geplaatst.
   */
  @Input() mapIndex: string;

  /**
   * Initialisatie van de WMTS-laag bij het laden van de component.
   * De BRT Achtergrondkaart wordt geconfigureerd met een tileGrid op basis van RD-coördinaten.
   */
  ngOnInit() {
    super.ngOnInit();

    const brtsource = new WMTS({
      projection: this.rdNewConfig.projectionCode,
      layer: "standaard",
      format: "image/png",
      url: "https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0?",
      matrixSet: this.rdNewConfig.matrixSet,
      style: "default",
      crossOrigin: "anonymous",
      tileGrid: new WMTSTileGrid({
        extent: this.rdNewConfig.extent,
        resolutions: this.rdNewConfig.resolutions,
        matrixIds: this.rdNewConfig.matrixIds
      })
    });

    this.setLayer(
      new TileLayer({
        source: brtsource,
        minResolution: 0.21 // BRT Achtergrondkaart is niet beschikbaar onder deze resolutie
      })
    );
    this.olLayer.set("ggc-layer-id", this.getLayerId());
  }

  /**
   * Opruimen van resources bij het vernietigen van de component.
   */
  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
