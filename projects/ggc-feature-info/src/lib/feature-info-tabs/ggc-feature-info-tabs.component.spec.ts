import type { Mock } from "vitest";
import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import { of } from "rxjs";
import { FeatureCollectionForCoordinate } from "@kadaster/ggc-models";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoMapConnectService } from "../service/feature-info-map-connect.service";
import { GgcFeatureInfoTabsComponent } from "./ggc-feature-info-tabs.component";

describe("FeatureInfoTabsComponent", () => {
  let component: GgcFeatureInfoTabsComponent;
  let fixture: ComponentFixture<GgcFeatureInfoTabsComponent>;
  let sortFilterServiceSpy: Mock;
  let featureInfoMapConnectServiceSpy: {
    getCurrentFeatureCollectionForMapSelection: Mock;
    getObservableForMapSelection: Mock;
    clearHighlightLayer: Mock;
  };

  beforeEach(() => {
    featureInfoMapConnectServiceSpy = {
      getCurrentFeatureCollectionForMapSelection: vi.fn(),
      getObservableForMapSelection: vi.fn().mockResolvedValue(of()),
      clearHighlightLayer: vi.fn()
    };
    TestBed.configureTestingModule({
      imports: [GgcFeatureInfoTabsComponent],
      providers: [
        GgcFeatureInfoConfigService,
        {
          provide: FeatureInfoMapConnectService,
          useValue: featureInfoMapConnectServiceSpy
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcFeatureInfoTabsComponent);
    component = fixture.componentInstance;
    const featureInfoConfigService = TestBed.inject(
      GgcFeatureInfoConfigService
    );
    sortFilterServiceSpy = vi.spyOn(featureInfoConfigService, "sortTabs");
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("component should not have tabs when featureInfoCollectionArray is empty", () => {
    let receivedEvent: FeatureInfoComponentEvent = {
      type: FeatureInfoComponentEventType.SELECTEDTAB,
      message: "",
      value: ""
    } as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );

    fixture.detectChanges();

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(component["selectedTab"]()).toBeUndefined();
    expect(component["selectedTabFeatureInfo"]()).toBeUndefined();
    expect(component["lastSelectedTabOnClick"]()).toBeUndefined();
    expect(sortFilterServiceSpy).not.toHaveBeenCalled();
  });

  it("component should have tabs when featureInfoCollectionArray is set", () => {
    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    fixture.detectChanges();
    const feature1 = new Feature({ test: "123" });
    const feature2 = new Feature({ test: "456" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Naam1", [feature1, feature2], "titel", "id")
    ];

    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(component["featureInfoCollectionArrayInternal"]().length).toBe(1);
    expect(component["selectedTab"]()).toBe("id");
    expect(component["selectedTabFeatureInfo"]()).toBeDefined();
    expect(component["lastSelectedTabOnClick"]()).toBeUndefined();
    expect(sortFilterServiceSpy).toHaveBeenCalled();
  });

  it("should use the current value of the selection for initial feature-info", async () => {
    const feature = new Feature({ test: "123" });
    const currentFeatureCollection = new FeatureCollectionForCoordinate();
    currentFeatureCollection.featureCollectionForLayers.push({
      layerId: "id",
      layerTitle: "titel",
      features: [feature]
    });
    featureInfoMapConnectServiceSpy.getCurrentFeatureCollectionForMapSelection.mockResolvedValue(
      currentFeatureCollection
    );

    fixture.detectChanges();
    await fixture.whenStable();

    expect(
      featureInfoMapConnectServiceSpy.getCurrentFeatureCollectionForMapSelection
    ).toHaveBeenCalled();
    expect(component["featureInfoCollectionArrayInternal"]().length).toBe(1);
    expect(component["selectedTab"]()).toBe("id");
    expect(component["selectedTabFeatureInfo"]()?.features).toEqual([feature]);
  });

  it("when showEmptyTabs has default value, empty tabs will be removed from featureInfoCollectionArray", () => {
    const feature1 = new Feature({ test: "123" });
    const feature2 = new Feature({ test: "456" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection(
        "Not empty",
        [feature1, feature2],
        "titel",
        "id"
      ),
      new FeatureInfoCollection("Empty", [], "titel", "id")
    ];

    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(component["featureInfoCollectionArrayInternal"]().length).toBe(1);
    expect(component["featureInfoCollectionArrayInternal"]()[0].layerName).toBe(
      "Not empty"
    );
  });

  it("when showEmptyTabs is true, empty tabs will not be removed from featureInfoCollectionArray", () => {
    component.showEmptyTabs = true;
    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection(
        "Not empty",
        [feature1, feature2],
        "titel",
        "id"
      ),
      new FeatureInfoCollection("Empty", [], "titel", "id")
    ];

    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(component["featureInfoCollectionArrayInternal"]().length).toBe(2);
  });

  it("if lastSelectedTabOnClick is set, it should set it as active tab", () => {
    const activeTabId = "idClicked";
    component["lastSelectedTabOnClick"].set(activeTabId);
    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    fixture.detectChanges();

    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Naam1", [feature1], "titelNaam1", "idNaam1"),
      new FeatureInfoCollection(
        "Clicked",
        [feature2],
        "titelClicked",
        "idClicked"
      )
    ];
    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(receivedEvent.value.layerTitle).toBe("titelClicked");
    expect(receivedEvent.value.layerId).toBe("idClicked");
    expect(component["selectedTab"]()).toBe("idClicked");
    expect(component["selectedTabFeatureInfo"]()).toBeDefined();
    expect(component["lastSelectedTabOnClick"]()).toBe(activeTabId);
  });

  it("if lastSelectedTabOnClick is set and is not present in tabFeatureInfo, it should set the first tab as active tab", () => {
    component["lastSelectedTabOnClick"].set("idClicked");
    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    fixture.detectChanges();

    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Tab1", [feature1], "titel", "id1"),
      new FeatureInfoCollection("Tab2", [feature2], "titel", "id2")
    ];
    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(receivedEvent.value.layerName).toBe("Tab1");
    expect(component["selectedTab"]()).toBe("id1");
    expect(component["selectedTabFeatureInfo"]()).toBeDefined();
  });

  it("onTabClicked should set lastSelectedTabOnClick and call setActiveTab", () => {
    const tabId = "idb";

    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("TabA", [feature1], "titel", "ida"),
      new FeatureInfoCollection("TabB", [feature2], "titel", tabId)
    ];
    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    component.onTabClicked(tabId);

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(component["featureInfoCollectionArrayInternal"]().length).toBe(2);
    expect(component["selectedTab"]()).toBe(tabId);
    expect(component["selectedTabFeatureInfo"]()?.layerId).toBe(tabId);
    expect(component["lastSelectedTabOnClick"]()).toBe(tabId);
  });
});
