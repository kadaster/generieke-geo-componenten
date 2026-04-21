import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { GgcDatasetTreeModelCreateService } from "../../core/ggc-dataset-tree-model-create.service";
import { Dataset } from "../../model/theme/dataset.model";
import { Theme } from "../../model/theme/theme.model";
import { LayerSelectorComponent } from "../layer-selector/layer-selector.component";
import { ThemeSelectorComponent } from "../theme-selector/theme-selector.component";
import { GgcDatasetTreeComponent } from "./ggc-dataset-tree.component";
import { provideZoneChangeDetection } from "@angular/core";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../../model/theme/dataset-tree-webservice.model";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { of } from "rxjs";

describe("DatasetTreeComponent", () => {
  let component: GgcDatasetTreeComponent;
  let fixture: ComponentFixture<GgcDatasetTreeComponent>;
  let nativeElement: HTMLElement;

  let testRecursionTree = [];

  let datasetTreeMapConnectServiceSpy: jasmine.SpyObj<DatasetTreeMapConnectService>;

  function createTreeForTest(niveau: number, open = false): Theme[] {
    let i;
    const themeArray: Theme[] = [];
    const testLayer: DatasetTreeLayer = new DatasetTreeLayer("testLayer");
    const testLayer2: DatasetTreeLayer = new DatasetTreeLayer("testLayer2");
    const testServices: DatasetTreeWebservice = new DatasetTreeWebservice([
      testLayer,
      testLayer2
    ]);
    const testDataset: Dataset = new Dataset(
      "testDataset",
      [testServices],
      "www.testurl.nl"
    );
    let testTheme: Theme = new Theme("LaatsteTheme", [testDataset], [], open);
    for (i = niveau; i > 0; i--) {
      testTheme = new Theme("ThemeNiveau " + i, [], [testTheme], open);
    }
    themeArray.push(testTheme);
    return themeArray;
  }

  beforeEach(waitForAsync(() => {
    datasetTreeMapConnectServiceSpy =
      jasmine.createSpyObj<DatasetTreeMapConnectService>(
        "DatasetTreeMapConnectService",
        ["isVisible", "getTitle", "getLayerChangedObservable"]
      );
    datasetTreeMapConnectServiceSpy.isVisible.and.callFake((layerId) => {
      if (layerId == "testLayer") return Promise.resolve(true);
      if (layerId == "testLayer2") return Promise.resolve(false);
      return Promise.resolve(false);
    });
    datasetTreeMapConnectServiceSpy.getTitle.and.callFake((layerId) => {
      if (layerId == "testLayer") return Promise.resolve("testLayer");
      if (layerId == "testLayer2") return Promise.resolve("testLayer2");
      return Promise.resolve("");
    });
    datasetTreeMapConnectServiceSpy.getLayerChangedObservable.and.returnValue(
      Promise.resolve(of())
    );
    TestBed.configureTestingModule({
      imports: [
        GgcDatasetTreeComponent,
        LayerSelectorComponent,
        ThemeSelectorComponent
      ],
      providers: [
        {
          provide: DatasetTreeMapConnectService,
          useValue: datasetTreeMapConnectServiceSpy
        },
        GgcDatasetTreeModelCreateService,
        provideZoneChangeDetection()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcDatasetTreeComponent);
    component = fixture.componentInstance;
    component.themes = [];
    nativeElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should be created and have subscribed to datasetTreeService", () => {
    expect(component).toBeTruthy();
  });

  describe("Theme", () => {
    beforeEach(() => {
      nativeElement = fixture.debugElement.nativeElement;
      expect(nativeElement).toBeTruthy();
    });

    it("with 1 theme, the themeName should not be present", () => {
      component.themes = [new Theme("Dataset verzameling een", [], [], true)];

      fixture.detectChanges();

      expect(nativeElement.querySelectorAll("tr").length).toBe(1);
      expect(nativeElement.querySelectorAll("ggc-layer-selector").length).toBe(
        0
      );
    });

    it(
      "with multiple other themes inside an other theme, " +
        "it should find the themeName (up to 5 layers) and datasetName in deeper layers ",
      async () => {
        component.themes = createTreeForTest(5, true);

        fixture.detectChanges();
        // Making sure all child components are stable and all promises are handled
        await fixture.whenStable();
        fixture.detectChanges();

        const themeTrWithCounter: NodeListOf<HTMLButtonElement> =
          nativeElement.querySelectorAll(
            "tr.ggc-dt-btn-ts-collapse td:nth-child(1)"
          );
        expect(themeTrWithCounter.length).toBe(6);
        expect(themeTrWithCounter[0].innerText).toBe("ThemeNiveau 1 (1/1)");
        expect(themeTrWithCounter[1].innerText).toBe("ThemeNiveau 2 (1/1)");
        expect(themeTrWithCounter[2].innerText).toBe("ThemeNiveau 3 (1/1)");
        expect(themeTrWithCounter[3].innerText).toBe("ThemeNiveau 4 (1/1)");
        expect(themeTrWithCounter[4].innerText).toBe("ThemeNiveau 5 (1/1)");
        expect(themeTrWithCounter[5].innerText).toBe("LaatsteTheme (1/1)");

        const datasetButtons: NodeListOf<HTMLButtonElement> =
          nativeElement.querySelectorAll("tr.ggc-dt-btn-ls-collapse");
        expect(datasetButtons.length).toBe(1);
        expect(datasetButtons[0].innerText).toContain("testDataset (1/2)");
      }
    );

    it(
      "with multiple other themes inside an other theme, and showActiveCounters false" +
        "it should find the themeName and datasetName in deeper layers and should not show count of active dataset",
      async () => {
        testRecursionTree = createTreeForTest(5, true);

        component.showActiveCounters = false;
        component.themes = testRecursionTree;

        fixture.detectChanges();
        // Making sure all child components are stable and all promises are handled
        await fixture.whenStable();
        fixture.detectChanges();

        const buttons = nativeElement.querySelectorAll(
          "tr.ggc-dt-btn-ts-collapse, tr.ggc-dt-btn-ls-collapse"
        );
        expect(buttons.length).toBe(7);

        const themeButtons: NodeListOf<HTMLButtonElement> =
          nativeElement.querySelectorAll(
            "tr.ggc-dt-btn-ts-collapse td:nth-child(1)"
          );
        expect(themeButtons.length).toBe(6);
        expect(themeButtons[0].innerText).toBe("ThemeNiveau 1 (1)");
        expect(themeButtons[1].innerText).toBe("ThemeNiveau 2 (1)");
        expect(themeButtons[2].innerText).toBe("ThemeNiveau 3 (1)");
        expect(themeButtons[3].innerText).toBe("ThemeNiveau 4 (1)");
        expect(themeButtons[4].innerText).toBe("ThemeNiveau 5 (1)");
        expect(themeButtons[5].innerText).toBe("LaatsteTheme (1)");

        const datasetButtons: NodeListOf<HTMLButtonElement> =
          nativeElement.querySelectorAll(
            "tr.ggc-dt-btn-ls-collapse td:nth-child(1)"
          );
        expect(datasetButtons.length).toBe(1);
        expect(datasetButtons[0].innerText).toContain("testDataset");
      }
    );

    it("should have default font awesome icons", () => {
      testRecursionTree = createTreeForTest(2, true);

      component.themes = testRecursionTree;

      fixture.detectChanges();

      checkClassList(nativeElement, "span.ggc-dt-collapsed", [
        "ggc-dt-collapsed",
        "icons",
        "fas",
        "fa-angle-right"
      ]);

      checkClassList(nativeElement, "span.ggc-dt-expanded", [
        "ggc-dt-expanded",
        "icons",
        "fas",
        "fa-angle-left"
      ]);

      checkClassList(nativeElement, "span.ggc-dt-info", [
        "fa-info-circle",
        "fas",
        "ggc-dt-info",
        "info"
      ]);
    });

    it("should have custom glyphicons", () => {
      testRecursionTree = createTreeForTest(2);

      component.iconExpanded = "glyphicon-minus-sign";
      component.iconCollapsed = "glyphicon-plus-sign";
      component.iconInfoUrl = "glyphicon-custom-info-sign";
      component.iconUnchecked = "glyphicon-custom-uncheck-sign";
      component.iconChecked = "glyphicon-custom-check-sign";
      component.themes = testRecursionTree;

      fixture.detectChanges();
    });
  });

  function checkClassList(
    nativeElement: HTMLElement,
    querySelector: string,
    classes: string[]
  ) {
    const element = nativeElement.querySelector(querySelector);
    expect(element)
      .withContext(`Expected ${querySelector} to be present in DOM tree`)
      .not.toBeNull();
    if (element) {
      classes.forEach((cssClass) => {
        expect(element.classList.contains(cssClass))
          .withContext(
            `Expecting ${querySelector} to contain class ${cssClass}`
          )
          .toBeTrue();
      });
      expect(element.classList.length)
        .withContext(
          `Expecting ${querySelector}'s classlist to match '${classes.join(
            " "
          )}'`
        )
        .toEqual(classes.length);
    }
  }
});
