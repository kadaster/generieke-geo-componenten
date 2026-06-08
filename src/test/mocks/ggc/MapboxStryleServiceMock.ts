import { MapboxStyleService } from "../../../../projects/ggc-legend/src/lib/legend-mapbox/service/mapbox-style.service";

import { vi } from "vitest";


export function createMapboxStyleServiceMock(): MapboxStyleService {
  return {
    getMapboxStyle: vi.fn(),
    removeRasterLayers: vi.fn(),
    getItems: vi.fn(),
    getLayersids: vi.fn()
  } as unknown as MapboxStyleService;
}
