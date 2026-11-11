import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
  TestRequest
} from "@angular/common/http/testing";
import {
  Component,
  input,
  NO_ERRORS_SCHEMA,
  output,
  provideZonelessChangeDetection,
  Type
} from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, RouterLink } from "@angular/router";
import { ViewerType, Webservice3DType } from "@kadaster/ggc-models";
import {
  CameraOptions,
  cameraOptionsTorentjeDenHaag,
  GeoJsonConfig,
  GgcSelectionService,
  TilesetConfig,
  ViewerOptions,
  Webservice
} from "@kadaster/ggc-map-3d";
import { EMPTY } from "rxjs";
import { vi } from "vitest";
import { Example3dBasicComponent } from "./example-3d-basic/example-3d-basic.component";
import { Example3dDatasetSwitcherComponent } from "./example-3d-dataset-switcher/example3d-dataset-switcher.component";
import { Example3dDatasetTreeLegendComponent } from "./example-3d-dataset-tree-legend/example3d-dataset-tree-legend.component";
import { Example3dFeatureInfoComponent } from "./example-3d-feature-info/example3d-feature-info.component";
import { Example3dFeatureInfoAutoConnectComponent } from "./example-3d-feature-info-auto-connect/example3d-feature-info-auto-connect.component";
import { Example3dLayer3dTilesComponent } from "./example-3d-layer-3d-tiles/example3d-layer-3d-tiles.component";
import { Example3dLayerCameraOptionsComponent } from "./example-3d-layer-camera-options/example3d-layer-camera-options.component";
import { Example3dLayerGeojsonComponent } from "./example-3d-layer-geojson/example3d-layer-geojson.component";
import { Example3dLayerWmtsComponent } from "./example-3d-layer-wmts/example3d-layer-wmts.component";
import { Example3dSearchComponent } from "./example-3d-search/example3d-search.component";

@Component({
  selector: "ggc-home-example-format",
  template: "<ng-content />"
})
class ExampleFormatStub {
  readonly title = input<string>();
  readonly pathModule = input<string>();
  readonly urlTSDocs = input<string>();
  readonly pathExtraConfig = input<string>();
  readonly extraConfigLabel = input<string>();
}

@Component({ selector: "ggc-map-3d-viewer", template: "" })
class ViewerStub {
  readonly viewerOptions = input<ViewerOptions>();
  readonly cameraOptions = input<CameraOptions>();
  readonly webServices = input<Webservice[]>();
  readonly hideLogo = input(false);
  readonly geoJsonConfigs = input<GeoJsonConfig[]>();
  readonly tilesetConfigs = input<TilesetConfig[]>();
  readonly ready = output<void>();
}

@Component({ selector: "ggc-dataset-tree", template: "" })
class DatasetTreeStub {
  readonly themes = input<unknown[]>();
  readonly viewerType = input<ViewerType>();
  readonly expandTreeOnInit = input(false);
}

@Component({ selector: "ggc-dataset-switcher", template: "" })
class DatasetSwitcherStub {
  readonly themes = input<unknown[]>();
  readonly viewerType = input<ViewerType>();
  readonly datasetSwitcherButtons = input<unknown[]>();
}

interface ExampleCase {
  name: string;
  component: Type<object>;
  cameraOptions: CameraOptions;
  extraConfig?: "treeconfig" | "switcherconfig";
}

const examples: ExampleCase[] = [
  {
    name: "example-3d-basic",
    component: Example3dBasicComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag
  },
  {
    name: "example-3d-feature-info-auto-connect",
    component: Example3dFeatureInfoAutoConnectComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag
  },
  {
    name: "example-3d-dataset-tree-legend",
    component: Example3dDatasetTreeLegendComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag,
    extraConfig: "treeconfig"
  },
  {
    name: "example-3d-dataset-switcher",
    component: Example3dDatasetSwitcherComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag,
    extraConfig: "switcherconfig"
  },
  {
    name: "example-3d-feature-info",
    component: Example3dFeatureInfoComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag
  },
  {
    name: "example-3d-layer-3d-tiles",
    component: Example3dLayer3dTilesComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag
  },
  {
    name: "example-3d-layer-camera-options",
    component: Example3dLayerCameraOptionsComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag,
    extraConfig: "treeconfig"
  },
  {
    name: "example-3d-layer-geojson",
    component: Example3dLayerGeojsonComponent,
    cameraOptions: {
      cameraPosition: { lat: 52.38277, lon: 4.64038, alt: 12776.57232 },
      orientation: { heading: 2, pitch: -90, roll: 0 }
    }
  },
  {
    name: "example-3d-layer-wmts",
    component: Example3dLayerWmtsComponent,
    cameraOptions: { cameraPosition: { lat: 51.946, lon: 5.591 } }
  },
  {
    name: "example-3d-search",
    component: Example3dSearchComponent,
    cameraOptions: cameraOptionsTorentjeDenHaag
  }
];

const webServices: Webservice[] = [
  {
    type: Webservice3DType.WMTS,
    url: "https://example.test/wmts",
    layers: [{ layerId: "background", layerName: "background" }]
  }
];

describe.each(examples)("$name startup", (exampleCase) => {
  let fixture: ComponentFixture<object>;
  let httpTestingController: HttpTestingController;
  let mapConfigRequest: TestRequest;
  let datasetConfigRequest: TestRequest | undefined;
  const selectionService = {
    addSelection: vi.fn().mockName("GgcSelectionService.addSelection"),
    getFeatureCollectionForCoordinateObservable: vi
      .fn()
      .mockName(
        "GgcSelectionService.getFeatureCollectionForCoordinateObservable"
      )
      .mockReturnValue(EMPTY)
  };
  const configRoot = `code/examples/example-3d/${exampleCase.name}`;

  beforeEach(async () => {
    selectionService.addSelection.mockClear();
    selectionService.getFeatureCollectionForCoordinateObservable.mockClear();
    await TestBed.configureTestingModule({
      imports: [exampleCase.component],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: GgcSelectionService, useValue: selectionService }
      ]
    })
      .overrideComponent(exampleCase.component, {
        set: {
          imports: [
            ExampleFormatStub,
            ViewerStub,
            DatasetTreeStub,
            DatasetSwitcherStub,
            RouterLink
          ],
          schemas: [NO_ERRORS_SCHEMA]
        }
      })
      .compileComponents();

    fixture = TestBed.createComponent(exampleCase.component);
    httpTestingController = TestBed.inject(HttpTestingController);
    TestBed.tick();
    mapConfigRequest = httpTestingController.expectOne(
      `${configRoot}/kaartconfig.json`
    );
    datasetConfigRequest = exampleCase.extraConfig
      ? httpTestingController.expectOne(
          `${configRoot}/${exampleCase.extraConfig}.json`
        )
      : undefined;
  });

  afterEach(() => {
    httpTestingController.verify();
    fixture.destroy();
  });

  it("should pass the initial camera to the viewer before it is ready", async () => {
    const viewer = fixture.debugElement
      .query(By.directive(ViewerStub))
      .injector.get(ViewerStub);

    expect(viewer.cameraOptions()).toEqual(exampleCase.cameraOptions);

    viewer.ready.emit();
    mapConfigRequest.flush(webServices);
    datasetConfigRequest?.flush([]);
    await fixture.whenStable();
    expect(viewer.cameraOptions()).toEqual(exampleCase.cameraOptions);
    if (exampleCase.component === Example3dFeatureInfoComponent) {
      expect(selectionService.addSelection).toHaveBeenCalledTimes(2);
    }
  });

  it("should update the viewer when its map configuration arrives after ready", async () => {
    const viewer = fixture.debugElement
      .query(By.directive(ViewerStub))
      .injector.get(ViewerStub);
    viewer.ready.emit();
    TestBed.tick();

    mapConfigRequest.flush(webServices);
    datasetConfigRequest?.flush([]);
    await fixture.whenStable();

    expect(viewer.webServices()).toEqual(webServices);
  });

  it("should retain map configuration that arrives before the viewer is ready", async () => {
    const viewer = fixture.debugElement
      .query(By.directive(ViewerStub))
      .injector.get(ViewerStub);

    mapConfigRequest.flush(webServices);
    datasetConfigRequest?.flush([]);
    await fixture.whenStable();
    expect(viewer.webServices()).toEqual(webServices);

    viewer.ready.emit();
    await fixture.whenStable();
    expect(viewer.webServices()).toEqual(webServices);
  });

  it("should cancel pending configuration requests on destruction", () => {
    fixture.destroy();

    expect(mapConfigRequest.cancelled).toBe(true);
    if (datasetConfigRequest) {
      expect(datasetConfigRequest.cancelled).toBe(true);
    }
  });

  it("should not read a failed map configuration resource", async () => {
    mapConfigRequest.flush("Configuration unavailable", {
      status: 500,
      statusText: "Internal Server Error"
    });
    datasetConfigRequest?.flush([]);
    await fixture.whenStable();

    const viewer = fixture.debugElement
      .query(By.directive(ViewerStub))
      .injector.get(ViewerStub);
    expect(viewer.webServices()).toBeUndefined();
  });

  if (exampleCase.extraConfig) {
    it("should update the dataset configuration when it arrives asynchronously", async () => {
      const themes = [{ themeName: "Test", datasets: [] }];

      if (!datasetConfigRequest) {
        throw new Error("Dataset configuration request missing");
      }
      mapConfigRequest.flush(webServices);
      datasetConfigRequest.flush(themes);
      await fixture.whenStable();

      const receivedThemes =
        exampleCase.extraConfig === "treeconfig"
          ? fixture.debugElement
              .query(By.directive(DatasetTreeStub))
              .injector.get(DatasetTreeStub)
              .themes()
          : fixture.debugElement
              .query(By.directive(DatasetSwitcherStub))
              .injector.get(DatasetSwitcherStub)
              .themes();
      expect(receivedThemes).toEqual(themes);
    });

    it("should not read a failed dataset configuration resource while retaining the map configuration", async () => {
      if (!datasetConfigRequest) {
        throw new Error("Dataset configuration request missing");
      }
      mapConfigRequest.flush(webServices);
      datasetConfigRequest.flush("Configuration unavailable", {
        status: 500,
        statusText: "Internal Server Error"
      });
      await fixture.whenStable();

      const viewer = fixture.debugElement
        .query(By.directive(ViewerStub))
        .injector.get(ViewerStub);
      expect(viewer.webServices()).toEqual(webServices);
      const receivedThemes =
        exampleCase.extraConfig === "treeconfig"
          ? fixture.debugElement
              .query(By.directive(DatasetTreeStub))
              .injector.get(DatasetTreeStub)
              .themes()
          : fixture.debugElement
              .query(By.directive(DatasetSwitcherStub))
              .injector.get(DatasetSwitcherStub)
              .themes();
      expect(receivedThemes).toEqual([]);
    });
  }
});
