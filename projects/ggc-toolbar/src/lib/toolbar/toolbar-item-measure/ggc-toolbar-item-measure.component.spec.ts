import type { MockedObject } from "vitest";
import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  ToolbarItemMeasureComponentEvent,
  ToolbarItemMeasureType
} from "../../event/toolbar-item-measure-event";

import { GgcToolbarItemMeasureComponent } from "./ggc-toolbar-item-measure.component";
import { provideZoneChangeDetection } from "@angular/core";
import { GgcDrawService } from "@kadaster/ggc-map/src/lib/drawing/service/ggc-draw.service";
import { GgcToolbarConnectService } from "../../service/connect.service";

describe("ToolbarItemMeasureComponent", () => {
  let component: GgcToolbarItemMeasureComponent;
  let fixture: ComponentFixture<GgcToolbarItemMeasureComponent>;
  let debugElement: DebugElement;

  let drawServiceSpy: MockedObject<GgcDrawService>;
  let connectServiceSpy: MockedObject<GgcToolbarConnectService>;

  beforeEach(() => {
    drawServiceSpy = {
      startDraw: vi.fn().mockName("GgcDrawService.startDraw"),
      stopDraw: vi.fn().mockName("GgcDrawService.stopDraw"),
      clearLayer: vi.fn().mockName("GgcDrawService.clearLayer")
    } as MockedObject<GgcDrawService>;

    connectServiceSpy = {
      getDrawService: vi
        .fn()
        .mockName("GgcToolbarConnectService.getDrawService")
    } as MockedObject<GgcToolbarConnectService>;

    connectServiceSpy.getDrawService.mockResolvedValue(drawServiceSpy);

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

    fixture = TestBed.createComponent(GgcToolbarItemMeasureComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;

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
    fixture.componentRef.setInput("measureLineIcon", "fas fa-map-signs");
    fixture.detectChanges();

    const spans = debugElement.queryAll(By.css("button>span"));
    expect(spans[1].nativeElement.className).toBe("fas fa-map-signs");
  });

  describe("events", () => {
    let event!: ToolbarItemMeasureComponentEvent;

    beforeEach(() => {
      component.measureItemClicked.subscribe(
        (evt: ToolbarItemMeasureComponentEvent) => (event = evt)
      );
    });

    it("should emit STOP when stopMeasure is called", async () => {
      component.stopMeasure();
      await Promise.resolve();
      expect(drawServiceSpy.stopDraw).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.STOP);
    });

    it("should emit LINE when measureLine is called", async () => {
      component.measureLine();
      await Promise.resolve();
      expect(drawServiceSpy.startDraw).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.LINE);
    });

    it("should emit POLYGON when measurePolygon is called", async () => {
      component.measurePolygon();
      await Promise.resolve();
      expect(drawServiceSpy.startDraw).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.POLYGON);
    });

    it("should emit CLEAR when eraseMeasureLayer is called", async () => {
      component.eraseMeasureLayer();
      await Promise.resolve();
      expect(drawServiceSpy.clearLayer).toHaveBeenCalled();
      expect(event.toolbarItemName).toBe(ToolbarItemMeasureType.CLEAR);
    });
  });
});
