import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  ToolbarItemMeasureComponentEvent,
  ToolbarItemMeasureType
} from "../../event/toolbar-item-measure-event";

import { GgcToolbarItemMeasureComponent } from "./ggc-toolbar-item-measure.component";
import SpyObj = jasmine.SpyObj;
import { provideZoneChangeDetection } from "@angular/core";
import { GgcDrawService } from "@kadaster/ggc-map/src/lib/drawing/service/ggc-draw.service";
import { GgcToolbarConnectService } from "../../service/connect.service";
import { MapComponentDrawTypes } from "@kadaster/ggc-map";

describe("ToolbarItemMeasureComponent", () => {
  let component: GgcToolbarItemMeasureComponent;
  let fixture: ComponentFixture<GgcToolbarItemMeasureComponent>;
  let debugElement: DebugElement;
  let drawServiceSpy: SpyObj<GgcDrawService>;
  let connectServiceSpy: SpyObj<GgcToolbarConnectService>;

  beforeEach(waitForAsync(() => {
    drawServiceSpy = jasmine.createSpyObj("DrawService", [
      "startDraw",
      "stopDraw",
      "clearLayer"
    ]);

    connectServiceSpy = jasmine.createSpyObj("GgcToolbarConnectService", [
      "loadDrawService",
      "getDrawService",
      "loadMapComponentDrawTypes",
      "getMapComponentDrawTypes"
    ]);
    connectServiceSpy.loadDrawService.and.returnValue(Promise.resolve());
    connectServiceSpy.getDrawService.and.returnValue(drawServiceSpy);
    connectServiceSpy.loadMapComponentDrawTypes.and.returnValue(
      Promise.resolve()
    );
    connectServiceSpy.getMapComponentDrawTypes.and.returnValue(
      MapComponentDrawTypes
    );

    TestBed.configureTestingModule({
      imports: [GgcToolbarItemMeasureComponent],
      providers: [
        {
          provide: GgcToolbarConnectService,
          useValue: connectServiceSpy
        },
        provideZoneChangeDetection()
      ]
    }).compileComponents();
  }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(GgcToolbarItemMeasureComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should show default buttons when they are not overwritten", () => {
    const spans = debugElement.queryAll(By.css("button>span"));
    expect(spans.length).toEqual(6);
    expect(spans[0].nativeElement.className).toBe("fal fa-mouse-pointer");
    expect(spans[1].nativeElement.className).toBe("fal fa-ruler-horizontal");
    expect(spans[2].nativeElement.className).toBe("fal fa-ruler-combined");
    expect(spans[3].nativeElement.className).toBe("fal fa-hand-paper");
    expect(spans[4].nativeElement.className).toBe("fal fa-pencil-alt");
    expect(spans[5].nativeElement.className).toBe("fal fa-trash-alt");
  });

  it("should show custom button when overwritten", () => {
    fixture.componentInstance.measureLineIcon = "fas fa-map-signs";
    fixture.detectChanges();
    const spans = debugElement.queryAll(By.css("button>span"));
    expect(spans[1].nativeElement.className).toBe("fas fa-map-signs");
  });

  describe("events", () => {
    let event: ToolbarItemMeasureComponentEvent;

    beforeEach(() => {
      component.measureItemClicked.subscribe(
        (evt: ToolbarItemMeasureComponentEvent) => (event = evt)
      );
    });

    it("should emit event with toolbarItemName is stop when stopDrawing is called", () => {
      component.stopMeasure();

      expect(drawServiceSpy.stopDraw).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.STOP);
    });

    it("should emit event with toolbarItemName is line when measureLine is called", () => {
      component.measureLine();

      expect(drawServiceSpy.startDraw).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.LINE);
    });

    it("should emit event with toolbarItemName is polygon when measurePolygon is called", () => {
      component.measurePolygon();

      expect(drawServiceSpy.startDraw).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.POLYGON);
    });

    it("should emit event with toolbarItemName is clear when eraseMeasureLayer is called", () => {
      component.eraseMeasureLayer();

      expect(drawServiceSpy.clearLayer).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.CLEAR);
    });
  });
});
