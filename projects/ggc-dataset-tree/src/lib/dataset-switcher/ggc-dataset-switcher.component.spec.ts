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
    setVisibilityLayers: jasmine.Spy;
    isVisible: jasmine.Spy;
  };

  let connectServiceMock: jasmine.SpyObj<GgcDatasetTreeConnectService>;

  beforeEach(waitForAsync(() => {
    olLayerServiceMock = {
      setVisibilityLayers: jasmine.createSpy("setVisibilityLayers"),
      isVisible: jasmine.createSpy("isVisible")
    };

    connectServiceMock = jasmine.createSpyObj("GgcDatasetTreeConnectService", [
      "getGgcOLLayerService"
    ]);

    connectServiceMock.getGgcOLLayerService.and.resolveTo(olLayerServiceMock);

    TestBed.configureTestingModule({
      imports: [GgcDatasetSwitcherComponent],
      providers: [
        { provide: GgcDatasetTreeConnectService, useValue: connectServiceMock }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcDatasetSwitcherComponent);
    component = fixture.componentInstance;

    component.datasetSwitcherButtons = [
      new DatasetSwitcherButton("Theme A", ""),
      new DatasetSwitcherButton("Theme B", "")
    ];

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("ngOnChanges", () => {
    it("should do nothing when themes change is missing", () => {
      const spy = spyOn(component as any, "setInitialActiveTheme");

      component.ngOnChanges({});

      expect(spy).not.toHaveBeenCalled();
    });

    it("should NOT schedule initial activation when themes do not become available", fakeAsync(() => {
      const spy = spyOn(component as any, "setInitialActiveTheme");

      const themes = createThemes(["Theme A", "Theme B"]);
      component.themes = themes;

      component.ngOnChanges({
        themes: new SimpleChange(themes, themes, false)
      });

      tick(200);

      expect(spy).not.toHaveBeenCalled();
    }));

    it("should schedule initial activation when themes become available", fakeAsync(() => {
      const spy = spyOn(
        component as any,
        "setInitialActiveTheme"
      ).and.resolveTo();

      const themes = createThemes(["Theme A", "Theme B"]);
      component.themes = themes;

      component.ngOnChanges({ themes: new SimpleChange([], themes, false) });

      tick(100);

      expect(spy).toHaveBeenCalledWith(themes);
    }));
  });

  describe("initial active theme selection", () => {
    it("should pick the visible theme and emit event", fakeAsync(() => {
      const themes = createThemesWithLayers();
      component.themes = themes;

      olLayerServiceMock.isVisible.and.callFake(
        (layerId: string) => layerId === "b-1"
      );

      const emitted: DatasetSwitcherEvent[] = [];
      component.events.subscribe((e) => emitted.push(e));

      component.ngOnChanges({ themes: new SimpleChange([], themes, false) });

      tick(100);
      flushMicrotasks();

      expect(connectServiceMock.getGgcOLLayerService).toHaveBeenCalled();

      expect(component["activeTheme"]?.themeName).toBe("Theme B");
      expect(olLayerServiceMock.setVisibilityLayers).not.toHaveBeenCalled();

      expect(emitted.length).toBe(1);
      expect(emitted[0].value.themeName).toBe("Theme B");
    }));

    it("should fall back to first theme when none visible", fakeAsync(() => {
      const themes = createThemesWithLayers();
      component.themes = themes;

      olLayerServiceMock.isVisible.and.returnValue(false);

      const emitted: DatasetSwitcherEvent[] = [];
      component.events.subscribe((e) => emitted.push(e));

      component.ngOnChanges({ themes: new SimpleChange([], themes, false) });

      tick(100);
      flushMicrotasks();

      expect(component["activeTheme"]?.themeName).toBe("Theme A");

      expect(olLayerServiceMock.setVisibilityLayers).toHaveBeenCalledWith(
        ["a-1"],
        true,
        component.mapIndex
      );

      expect(emitted.length).toBe(1);
      expect(emitted[0].value.themeName).toBe("Theme A");
    }));
  });

  describe("handleChangeEvent", () => {
    it("should ignore invalid events", () => {
      const emitSpy = spyOn(component.events, "emit");

      component.handleChangeEvent({ target: {} } as any);

      expect(emitSpy).not.toHaveBeenCalled();
      expect(connectServiceMock.getGgcOLLayerService).not.toHaveBeenCalled();
    });

    it("should ignore unknown theme", () => {
      const emitSpy = spyOn(component.events, "emit");
      component.themes = createThemes(["Theme A"]);

      component.handleChangeEvent({ target: { id: "X" } } as any);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it("should switch theme and update visibility", fakeAsync(() => {
      const themes = createThemesWithLayers();
      component.themes = themes;
      component["activeTheme"] = themes[0];

      const emitSpy = spyOn(component.events, "emit").and.callThrough();

      component.handleChangeEvent({ target: { id: "Theme B" } } as any);

      flushMicrotasks();

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
    }));
  });

  describe("template basics", () => {
    it("should render radio buttons", fakeAsync(() => {
      const localFixture = TestBed.createComponent(GgcDatasetSwitcherComponent);
      const localComponent = localFixture.componentInstance;

      localComponent.datasetSwitcherButtons = [
        new DatasetSwitcherButton("Theme A", ""),
        new DatasetSwitcherButton("Theme B", "")
      ];

      localComponent.themes = createThemesWithLayers();
      localComponent["activeTheme"] = localComponent.themes[0];

      localFixture.detectChanges();
      tick();
      localFixture.detectChanges();

      const radios = localFixture.debugElement.queryAll(
        By.css("div .ggc-ds-switcher-radio-button")
      );

      expect(radios.length).toBe(2);
      expect(radios[0].properties.checked).toBe(true);
      expect(radios[1].properties.checked).toBe(false);
    }));
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
