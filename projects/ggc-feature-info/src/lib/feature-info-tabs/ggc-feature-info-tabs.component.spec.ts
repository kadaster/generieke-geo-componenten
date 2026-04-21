import { SimpleChange } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { Feature } from "ol";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { GgcFeatureInfoTabsComponent } from "./ggc-feature-info-tabs.component";

describe("FeatureInfoTabsComponent", () => {
  let component: GgcFeatureInfoTabsComponent;
  let fixture: ComponentFixture<GgcFeatureInfoTabsComponent>;
  let sortFilterServiceSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcFeatureInfoTabsComponent],
      providers: [GgcFeatureInfoConfigService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcFeatureInfoTabsComponent);
    component = fixture.componentInstance;
    const featureInfoConfigService = TestBed.inject(
      GgcFeatureInfoConfigService
    );
    sortFilterServiceSpy = spyOn(featureInfoConfigService, "sortTabs");
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("component should not have tabs when featureInfoCollectionArray is empty", () => {
    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );

    fixture.detectChanges();

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(component["featureInfoCollectionArrayInternal"].length).toBe(0);
    expect(component["selectedTab"]).toBeUndefined();
    expect(component["selectedTabFeatureInfo"]).toBeUndefined();
    expect(component["lastSelectedTabOnClick"]).toBeUndefined();
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
      new FeatureInfoCollection("Naam1", [feature1, feature2])
    ];

    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(component["featureInfoCollectionArrayInternal"].length).toBe(1);
    expect(component["selectedTab"]).toBe("Naam1");
    expect(component["selectedTabFeatureInfo"]).toBeDefined();
    expect(component["lastSelectedTabOnClick"]).toBeUndefined();
    expect(sortFilterServiceSpy).toHaveBeenCalled();
  });

  it("when showEmptyTabs has default value, empty tabs will be removed from featureInfoCollectionArray", () => {
    const feature1 = new Feature({ test: "123" });
    const feature2 = new Feature({ test: "456" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Not empty", [feature1, feature2]),
      new FeatureInfoCollection("Empty", [])
    ];

    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(component["featureInfoCollectionArrayInternal"].length).toBe(1);
    expect(component["featureInfoCollectionArrayInternal"][0].layerName).toBe(
      "Not empty"
    );
  });

  it("when showEmptyTabs is true, empty tabs will not be removed from featureInfoCollectionArray", () => {
    component.showEmptyTabs = true;
    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Not empty", [feature1, feature2]),
      new FeatureInfoCollection("Empty", [])
    ];

    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(component["featureInfoCollectionArrayInternal"].length).toBe(2);
  });

  it("if lastSelectedTabOnClick is set, it should set it as active tab", () => {
    const activeTabName = "Clicked";
    component["lastSelectedTabOnClick"] = activeTabName;
    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    fixture.detectChanges();

    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Naam1", [feature1]),
      new FeatureInfoCollection("Clicked", [feature2])
    ];
    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(receivedEvent.value.layerName).toBe(activeTabName);
    expect(component["selectedTab"]).toBe(activeTabName);
    expect(component["selectedTabFeatureInfo"]).toBeDefined();
    expect(component["lastSelectedTabOnClick"]).toBe(activeTabName);
  });

  it("if lastSelectedTabOnClick is set and is not present in tabFeatureInfo, it should set the first tab as active tab", () => {
    component["lastSelectedTabOnClick"] = "Clicked";
    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    fixture.detectChanges();

    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("Tab1", [feature1]),
      new FeatureInfoCollection("Tab2", [feature2])
    ];
    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(receivedEvent.value.layerName).toBe("Tab1");
    expect(component["selectedTab"]).toBe("Tab1");
    expect(component["selectedTabFeatureInfo"]).toBeDefined();
  });

  it("onTabClicked should set lastSelectedTabOnClick and call setActiveTab", () => {
    const tabName = "TabB";

    let receivedEvent: FeatureInfoComponentEvent =
      {} as FeatureInfoComponentEvent;
    component.events.subscribe(
      (evt: FeatureInfoComponentEvent) => (receivedEvent = evt)
    );
    const feature1 = new Feature({ a: "b" });
    const feature2 = new Feature({ a: "1" });
    component.featureInfoCollectionArray = [
      new FeatureInfoCollection("TabA", [feature1]),
      new FeatureInfoCollection(tabName, [feature2])
    ];
    component.ngOnChanges({
      featureInfoCollectionArray: {} as SimpleChange
    });

    component.onTabClicked(tabName);

    expect(receivedEvent.type).toBe(FeatureInfoComponentEventType.SELECTEDTAB);
    expect(component["featureInfoCollectionArrayInternal"].length).toBe(2);
    expect(component["selectedTab"]).toBe(tabName);
    expect(component["selectedTabFeatureInfo"]).toBeDefined();
    expect(component["lastSelectedTabOnClick"]).toBe(tabName);
  });
});
