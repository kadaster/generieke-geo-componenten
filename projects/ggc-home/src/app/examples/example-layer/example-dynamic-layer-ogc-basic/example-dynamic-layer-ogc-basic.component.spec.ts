import { Component, input } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting
} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { GgcLayerService, GgcMapService, Webservice } from "@kadaster/ggc-map";
import { EMPTY } from "rxjs";
import { ExampleDynamicLayerOgcBasicComponent } from "./example-dynamic-layer-ogc-basic.component";
import mapConfig from "./kaartconfig.json";

@Component({
  selector: "ggc-home-example-format",
  template: "<ng-content />"
})
class ExampleFormatStub {
  readonly title = input<string>();
  readonly pathModule = input<string>();
  readonly urlTSDocs = input<string>();
}

@Component({ selector: "ggc-map", template: "" })
class MapStub {
  readonly webServices = input<Webservice[]>();
  readonly mapIndex = input<string>();
}

describe("ExampleDynamicLayerOgcBasicComponent", () => {
  let fixture: ComponentFixture<ExampleDynamicLayerOgcBasicComponent>;
  let httpTestingController: HttpTestingController;
  const layerService = {
    setUrlParameters: vi.fn(),
    setVisibilityLayers: vi.fn(),
    getLayerChangedObservable: vi.fn().mockReturnValue(EMPTY)
  };
  const mapService = { zoomToCoordinate: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDynamicLayerOgcBasicComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: GgcLayerService, useValue: layerService },
        { provide: GgcMapService, useValue: mapService }
      ]
    })
      .overrideComponent(ExampleDynamicLayerOgcBasicComponent, {
        set: { imports: [ExampleFormatStub, MapStub] }
      })
      .compileComponents();
    fixture = TestBed.createComponent(ExampleDynamicLayerOgcBasicComponent);
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    httpTestingController
      .expectOne(
        "code/examples/example-layer/example-dynamic-layer-ogc-basic/kaartconfig.json"
      )
      .flush(mapConfig);
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
  });

  afterEach(() => {
    httpTestingController.verify();
    vi.clearAllMocks();
  });

  it("should configure the parcel layer as invisible before a parcel is selected", () => {
    const mapStub = fixture.debugElement
      .query(By.directive(MapStub))
      .injector.get(MapStub);

    expect(mapStub.webServices()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "geojson",
          layers: [
            expect.objectContaining({
              layerId: "perceel",
              visible: false
            })
          ]
        })
      ])
    );
    expect(layerService.setUrlParameters).not.toHaveBeenCalled();
    expect(layerService.setVisibilityLayers).not.toHaveBeenCalled();
  });

  it("should set the parcel parameters before showing the configured layer for each selection", async () => {
    const element: HTMLElement = fixture.nativeElement;
    const buttons = element.querySelectorAll("button");

    buttons[0].click();
    await fixture.whenStable();
    expect(layerService.setUrlParameters).toHaveBeenCalledWith(
      [
        {
          parameterName: "kadastrale_gemeente_waarde",
          parameterValue: "Apeldoorn"
        },
        { parameterName: "sectie", parameterValue: "U" },
        { parameterName: "perceelnummer", parameterValue: "9833" }
      ],
      "perceel",
      "mapName"
    );
    expect(layerService.setVisibilityLayers).toHaveBeenCalledWith(
      ["perceel"],
      true,
      "mapName"
    );
    expect(
      layerService.setUrlParameters.mock.invocationCallOrder[0]
    ).toBeLessThan(
      layerService.setVisibilityLayers.mock.invocationCallOrder[0]
    );
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");

    buttons[1].click();
    await fixture.whenStable();
    expect(layerService.setUrlParameters).toHaveBeenCalledWith(
      [
        {
          parameterName: "kadastrale_gemeente_waarde",
          parameterValue: "Apeldoorn"
        },
        { parameterName: "sectie", parameterValue: "U" },
        { parameterName: "perceelnummer", parameterValue: "7083" }
      ],
      "perceel",
      "mapName"
    );
    expect(layerService.setVisibilityLayers).toHaveBeenCalledTimes(2);
    expect(buttons[0].getAttribute("aria-pressed")).toBe("false");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("true");

    buttons[0].click();
    await fixture.whenStable();
    expect(layerService.setUrlParameters).toHaveBeenLastCalledWith(
      expect.arrayContaining([
        { parameterName: "perceelnummer", parameterValue: "9833" }
      ]),
      "perceel",
      "mapName"
    );
    expect(layerService.setVisibilityLayers).toHaveBeenCalledTimes(3);
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
    expect(buttons[1].getAttribute("aria-pressed")).toBe("false");
  });
});
