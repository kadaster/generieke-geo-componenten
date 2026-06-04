import { vi } from 'vitest';
import OlMap from 'ol/Map';
import View from 'ol/View';
import MapEvent from "ol/MapEvent";

export class MockGgcMapService {
  clearHighlightLayer = vi.fn();
  clearSelectionLayer = vi.fn();
  addFeaturesToHighlightLayer = vi.fn();
  changeHighlightLayerStyle = vi.fn();
  markFeature = vi.fn();
  getMap = vi.fn(() => {
    return createMapViewMock();
  });
  zoomToCoordinate = vi.fn();
}

export function createMapViewMock(): OlMap {
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

export function createFakeMapEvent(type = "zoomend"): MapEvent {
  return new MapEvent(type, createMapViewMock());
}
