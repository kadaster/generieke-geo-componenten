import type { Mock, MockedObject } from "vitest";
import { SimpleChange } from "@angular/core";
import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
  waitForAsync
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GgcDatasetTreeConnectService } from "../dataset-tree/service/connect.service";
import { Dataset } from "../model/theme/dataset.model";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../model/theme/dataset-tree-webservice.model";
import { Theme } from "../model/theme/theme.model";
import { GgcDatasetSwitcherComponent } from "./ggc-dataset-switcher.component";
import { DatasetSwitcherButton } from "./model/dataset-switcher-button.model";
import { DatasetSwitcherEvent } from "./model/dataset-switcher-event.model";

describe("GgcDatasetSwitcherComponent", () => {
  let component: GgcDatasetSwitcherComponent;
  let fixture: ComponentFixture<GgcDatasetSwitcherComponent>;

  let olLayerServiceMock: {
    setVisibilityLayers: Mock;
    isVisible: Mock;
  };

  let connectServiceMock: Pick<
    MockedObject<GgcDatasetTreeConnectService>,
    "getGgcOLLayerService"
  >;

  beforeEach(() => {
    olLayerServiceMock = {
      setVisibilityLayers: vi.fn(),
      isVisible: vi.fn()
    };

    connectServiceMock = {
      getGgcOLLayerService: vi
        .fn()
        .mockName("GgcDatasetTreeConnectService.getGgcOLLayerService")
        .mockResolvedValue(olLayerServiceMock)
    };

    TestBed.configureTestingModule({
      imports: [GgcDatasetSwitcherComponent],
      providers: [
        {
          provide: GgcDatasetTreeConnectService,
          useValue: connectServiceMock
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcDatasetSwitcherComponent);
    component = fixture.componentInstance;

    component.datasetSwitcherButtons = [
      new DatasetSwitcherButton("Theme A", ""),
      new DatasetSwitcherButton("Theme B", "")
    ];

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnChanges", () => {
    it("should do nothing when themes change is missing", () => {
      const spy = vi.spyOn(component as any, "setInitialActiveTheme");

      component.ngOnChanges({});

      expect(spy).not.toHaveBeenCalled();
    });

    it("should NOT schedule initial activation when themes do not become available", async () => {
      vi.useFakeTimers();
      const spy = vi.spyOn(component as any, "setInitialActiveTheme");

      const themes = createThemes(["Theme A", "Theme B"]);
      component.themes = themes;

      component.ngOnChanges({
        themes: new SimpleChange(themes, themes, false)
      });

      vi.advanceTimersByTime(200);

      await vi.runAllTimersAsync();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should schedule initial activation when themes become available", async () => {
      vi.useFakeTimers();

      const spy = vi
        .spyOn(component as any, "setInitialActiveTheme")
        .mockResolvedValue(undefined);

      const themes = createThemes(["Theme A", "Theme B"]);
      component.themes = themes;

      component.ngOnChanges({ themes: new SimpleChange([], themes, false) });

      vi.advanceTimersByTime(100);

      await vi.runAllTimersAsync();

      expect(spy).toHaveBeenCalledWith(themes);
    });
  });

  describe("initial active theme selection", () => {
    it("should pick the visible theme and emit event", async () => {
      vi.useFakeTimers();
      const themes = createThemesWithLayers();
      component.themes = themes;

      olLayerServiceMock.isVisible.mockImplementation(
        (layerId: string) => layerId === "b-1"
      );

      const emitted: DatasetSwitcherEvent[] = [];
      component.events.subscribe((e) => emitted.push(e));

      component.ngOnChanges({ themes: new SimpleChange([], themes, false) });

      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();

      expect(connectServiceMock.getGgcOLLayerService).toHaveBeenCalled();

      expect(component["activeTheme"]?.themeName).toBe("Theme B");
      expect(olLayerServiceMock.setVisibilityLayers).not.toHaveBeenCalled();

      expect(emitted.length).toBe(1);
      expect(emitted[0].value.themeName).toBe("Theme B");
    });

    it("should fall back to first theme when none visible", async () => {
      vi.useFakeTimers();
      const themes = createThemesWithLayers();
      component.themes = themes;

      olLayerServiceMock.isVisible.mockReturnValue(false);

      const emitted: DatasetSwitcherEvent[] = [];
      component.events.subscribe((e) => emitted.push(e));

      component.ngOnChanges({ themes: new SimpleChange([], themes, false) });

      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();

      expect(component["activeTheme"]?.themeName).toBe("Theme A");

      expect(olLayerServiceMock.setVisibilityLayers).toHaveBeenCalledWith(
        ["a-1"],
        true,
        component.mapIndex
      );

      expect(emitted.length).toBe(1);
      expect(emitted[0].value.themeName).toBe("Theme A");
    });
  });

  describe("handleChangeEvent", () => {
    it("should ignore invalid events", () => {
      const emitSpy = vi.spyOn(component.events, "emit");

      component.handleChangeEvent({ target: {} } as any);

      expect(emitSpy).not.toHaveBeenCalled();
      expect(connectServiceMock.getGgcOLLayerService).not.toHaveBeenCalled();
    });

    it("should ignore unknown theme", () => {
      const emitSpy = vi.spyOn(component.events, "emit");
      component.themes = createThemes(["Theme A"]);

      component.handleChangeEvent({ target: { id: "X" } } as any);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it("should switch theme and update visibility", async () => {
      vi.useFakeTimers();

      const themes = createThemesWithLayers();
      component.themes = themes;
      component["activeTheme"] = themes[0];

      const emitSpy = vi.spyOn(component.events, "emit");

      component.handleChangeEvent({ target: { id: "Theme B" } } as any);

      await vi.runAllTimersAsync();

      expect(connectServiceMock.getGgcOLLayerService).toHaveBeenCalled();

      expect(olLayerServiceMock.setVisibilityLayers).toHaveBeenCalledWith(
        ["a-1"],
        false,
        component.mapIndex
      );
      expect(olLayerServiceMock.setVisibilityLayers).toHaveBeenCalledWith(
        ["b-1"],
        true,
        component.mapIndex
      );

      expect(emitSpy).toHaveBeenCalled();
      expect(component["activeTheme"]?.themeName).toBe("Theme B");
    });
  });

  describe("template basics", () => {
    it("should render radio buttons", async () => {
      vi.useFakeTimers();

      const localFixture = TestBed.createComponent(GgcDatasetSwitcherComponent);
      const localComponent = localFixture.componentInstance;

      localComponent.datasetSwitcherButtons = [
        new DatasetSwitcherButton("Theme A", ""),
        new DatasetSwitcherButton("Theme B", "")
      ];

      localComponent.themes = createThemesWithLayers();
      localComponent["activeTheme"] = localComponent.themes[0];

      localFixture.detectChanges();
      vi.advanceTimersByTime(100);
      await vi.runAllTimersAsync();
      localFixture.detectChanges();

      const radios = localFixture.debugElement.queryAll(
        By.css("div .ggc-ds-switcher-radio-button")
      );

      expect(radios.length).toBe(2);
      expect(radios[0].properties.checked).toBe(true);
      expect(radios[1].properties.checked).toBe(false);
    });
  });
});

function createThemes(names: string[]): Theme[] {
  return names.map((n) => new Theme(n, [], []));
}

function createThemesWithLayers(): Theme[] {
  const themeA = new Theme(
    "Theme A",
    [
      new Dataset(
        "Dataset A",
        [new DatasetTreeWebservice([new DatasetTreeLayer("a-1")])],
        ""
      )
    ],
    []
  );

  const themeB = new Theme(
    "Theme B",
    [
      new Dataset(
        "Dataset B",
        [new DatasetTreeWebservice([new DatasetTreeLayer("b-1")])],
        ""
      )
    ],
    []
  );

  return [themeA, themeB];
}
