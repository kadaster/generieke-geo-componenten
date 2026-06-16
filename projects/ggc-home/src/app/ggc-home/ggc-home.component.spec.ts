import { ComponentFixture, TestBed } from "@angular/core/testing";
import { GgcMapService, GgcLayerService } from "@kadaster/ggc-map";

import { GgcHomeComponent } from "./ggc-home.component";
import { type MockedObject, vi } from "vitest";
import { View } from "ol";

describe("GgcHomeComponent", () => {
  let component: GgcHomeComponent;
  let fixture: ComponentFixture<GgcHomeComponent>;

  const mockMap = {
    clearHighlightLayer: vi.fn(),
    clearSelectionLayer: vi.fn(),
    addFeaturesToHighlightLayer: vi.fn(),
    changeHighlightLayerStyle: vi.fn(),
    markFeature: vi.fn(),
    getMap: vi.fn(() => {
      return viewMock;
    }),
    zoomToCoordinate: vi.fn(),
    getLayerChangedObservable: vi.fn()
  };

  const viewMock = {
    getResolution: vi.fn(),
    adjustZoom: vi.fn(),
    fit: vi.fn(),
    getCenter: vi.fn,
    on: vi.fn(),
    setZoom: vi.fn()
  } as unknown as MockedObject<View>;

  const layerServiceMock = {
    // alleen wat nodig is
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GgcHomeComponent],
      providers: [
        { provide: GgcMapService, useValue: mockMap },
        { provide: GgcLayerService, useValue: layerServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
