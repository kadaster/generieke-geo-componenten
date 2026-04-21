import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GgcToolbarItemDrawComponent } from "./ggc-toolbar-item-draw.component";
import SpyObj = jasmine.SpyObj;
import { provideZoneChangeDetection } from "@angular/core";
import { GgcDrawService } from "@kadaster/ggc-map/src/lib/drawing/service/ggc-draw.service";
import {
  ToolbarItemDrawComponentEvent,
  ToolbarItemDrawType
} from "../../event/toolbar-item-draw-event";
import { GgcToolbarConnectService } from "../../service/connect.service";
import { MapComponentDrawTypes } from "@kadaster/ggc-map";

describe("ToolbarItemDrawComponent", () => {
  let component: GgcToolbarItemDrawComponent;
  let fixture: ComponentFixture<GgcToolbarItemDrawComponent>;
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
      imports: [GgcToolbarItemDrawComponent],
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
    fixture = TestBed.createComponent(GgcToolbarItemDrawComponent);
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
    expect(spans.length).toEqual(9);
    expect(spans[0].nativeElement.className).toBe("fal fa-mouse-pointer");
    expect(spans[1].nativeElement.className).toBe("fas fa-circle");
    expect(spans[2].nativeElement.className).toBe("fal fa-project-diagram");
    expect(spans[3].nativeElement.className).toBe("fal fa-dot-circle");
    expect(spans[4].nativeElement.className).toBe("fal fa-vector-square");
    expect(spans[5].nativeElement.className).toBe("fal fa-draw-polygon");
    expect(spans[6].nativeElement.className).toBe("fal fa-hand-paper");
    expect(spans[7].nativeElement.className).toBe("fal fa-pencil-alt");
    expect(spans[8].nativeElement.className).toBe("fal fa-trash-alt");
  });

  it("should show custom button when overwritten", () => {
    component.deleteIcon = "fas fa-eraser";
    fixture.detectChanges();
    const spans = debugElement.queryAll(By.css("button>span"));
    expect(spans[8].nativeElement.className).toBe("fas fa-eraser");
  });

  describe("events", () => {
    let event: ToolbarItemDrawComponentEvent;

    beforeEach(() => {
      component.drawItemClicked.subscribe(
        (evt: ToolbarItemDrawComponentEvent) => (event = evt)
      );
    });

    it("should emit event with toolbarItemDrawName is stop when stopDrawing is called", () => {
      component.stopDrawing();

      expect(event.toolbarItemName).toBe(ToolbarItemDrawType.STOP);
    });

    it("should emit event with toolbarItemName is point when drawPoint is called", () => {
      component.draw("Point");

      expect(event.toolbarItemName).toBe(ToolbarItemDrawType.POINT);
    });

    it("should emit event with toolbarItemName is line when drawLine is called", () => {
      component.draw("Line");

      expect(event.toolbarItemName).toBe(ToolbarItemDrawType.LINE);
    });

    it("should emit event with toolbarItemName is rectangle when drawRectangle is called", () => {
      component.draw("Rectangle");

      expect(event.toolbarItemName).toBe(ToolbarItemDrawType.RECTANGLE);
    });

    it("should emit event with toolbarItemName is polygon when drawPolygon is called", () => {
      component.draw("Polygon");

      expect(event.toolbarItemName).toBe(ToolbarItemDrawType.POLYGON);
    });

    it("should emit event with toolbarItemName is clear when eraseDrawLayer is called", () => {
      component.eraseDrawLayer();

      expect(event.toolbarItemName).toBe(ToolbarItemDrawType.CLEAR);
    });
  });
});
