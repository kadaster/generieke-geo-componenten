import { Component, EventEmitter, Input, Output } from "@angular/core";
import OlMap from "ol/Map";
import { vi } from "vitest";
import View from "ol/View";

@Component({
  selector: "ggc-map",
  template: "",
  standalone: true
})
export class GgcMapComponentMock {
  @Input() mapTabIndex!: number;
  @Input() mapIndex!: string;
  @Input() maxZoomlevel!: number;
  @Input() webServices!: object;
  @Output() events = new EventEmitter();
}

@Component({
  selector: "ggc-layer-brt-achtergrondkaart",
  standalone: true,
  template: ""
})
export class GgcLayerBrtAchtergrondkaartComponentMock {
  @Input() mapIndex!: string;
}

export class GgcMapServiceMock {
  clearHighlightLayer = vi.fn();
  clearSelectionLayer = vi.fn();
  addFeaturesToHighlightLayer = vi.fn();
  changeHighlightLayerStyle = vi.fn();
  markFeature = vi.fn();
  getMap = vi.fn(() => {
    return createMapViewMock();
  });
  zoomToCoordinate = vi.fn();
  getLayerChangedObservable = vi.fn();
}

export class GgcLayerServiceMock {
  // alleen wat nodig is
}

function createMapViewMock(): OlMap {
  const viewMock = {
    getResolution(): void {
      /* mock */
    },
    adjustZoom(_delta: number, _optAnchor?): void {
      /* mock */
    },
    fit(_extent, _fitOptions): void {
      /* mock */
    },
    getCenter(): void {
      /* mock */
    }
  } as View;

  return {
    getView() {
      return viewMock;
    }
  } as OlMap;
}
