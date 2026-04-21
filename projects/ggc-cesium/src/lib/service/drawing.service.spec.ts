import { CoreViewerService } from "./core-viewer.service";
import { Subject } from "rxjs";
import { Viewer } from "@cesium/widgets";
import { inject, TestBed } from "@angular/core/testing";
import {
  Cartesian3,
  Color,
  Entity,
  HeightReference,
  PointGraphics,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin
} from "@cesium/engine";
import { createCesiumMock } from "../viewer/viewer-mock.spec";
import { GgcDrawingService } from "./ggc-drawing.service";
import { DrawingType } from "../model/enums";
import { CoreSelectionService } from "./core-selection.service";
import Spy = jasmine.Spy;
import objectContaining = jasmine.objectContaining;

describe("DrawingService", () => {
  let service: GgcDrawingService;
  let coreViewerServiceSpy: jasmine.SpyObj<CoreViewerService>;
  let coreSelectionServiceSpy: jasmine.SpyObj<CoreSelectionService>;
  let subject: Subject<Viewer | undefined>;
  let cesiumMock: Viewer;

  beforeEach(async () => {
    coreViewerServiceSpy = jasmine.createSpyObj("CoreViewerService", [
      "setViewer",
      "getViewerObservable"
    ]);
    coreSelectionServiceSpy = jasmine.createSpyObj("CoreSelectionService", [
      "destroySelection",
      "getSelection",
      "addSelection"
    ]);

    TestBed.configureTestingModule({
      providers: [
        GgcDrawingService,
        { provide: CoreViewerService, useValue: coreViewerServiceSpy },
        { provide: CoreSelectionService, useValue: coreSelectionServiceSpy }
      ]
    });
    subject = new Subject<Viewer | undefined>();
    coreViewerServiceSpy.getViewerObservable.and.returnValue(
      subject.asObservable()
    );

    service = TestBed.inject(GgcDrawingService);
    service["screenSpaceEventHandler"] = new ScreenSpaceEventHandler();

    cesiumMock = createCesiumMock() as Viewer;
    subject.next(cesiumMock);
    expect(coreViewerServiceSpy.getViewerObservable).toHaveBeenCalled();
  });

  it("should be created", inject(
    [GgcDrawingService],
    (service: GgcDrawingService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("should call initializeDrawingService() when a new Viewer is received", () => {
    const initializeCoreSelectionServiceSpy = spyOn<any>(
      service,
      "initializeDrawingService"
    ).and.callThrough();

    subject.next(cesiumMock);
    expect(initializeCoreSelectionServiceSpy).toHaveBeenCalled();
    expect(service["screenSpaceEventHandler"]).toBeDefined();
  });

  it("should call clearDrawingService() when undefined is received", () => {
    const clearCoreSelectionServiceSpy = spyOn<any>(
      service,
      "clearDrawingService"
    ).and.callThrough();
    const mousehandlerSpy = spyOn(
      service["screenSpaceEventHandler"],
      "destroy"
    );
    const drawEventSubjectSpy = spyOn(service["drawEventSubject"], "complete");

    subject.next(undefined);
    expect(mousehandlerSpy).toHaveBeenCalled();
    expect(drawEventSubjectSpy).toHaveBeenCalled();
    expect(clearCoreSelectionServiceSpy).toHaveBeenCalled();
  });

  describe("startDraw", () => {
    const earthPosition = new Cartesian3(
      3916334.1328511164,
      295640.1246988319,
      5008697.159853015
    );

    it("should call destroySelection() on the CoreSelectionService and add an InputAction to the screenSpaceEventHandler", () => {
      const setInputActionSpy = spyOn(
        service["screenSpaceEventHandler"],
        "setInputAction"
      );
      service.startDraw(DrawingType.Point);

      expect(coreSelectionServiceSpy.getSelection).toHaveBeenCalled();
      expect(coreSelectionServiceSpy.destroySelection).toHaveBeenCalled();
      expect(setInputActionSpy).toHaveBeenCalled();
    });

    it("should add a Point with default styling as an Entity in Cesium, return it and throw an event when addDrawing() is called", (done) => {
      service.getDrawEventObservable().subscribe((evt) => {
        expect(evt.location[0]).toEqual(4.317012899514346);
        expect(evt.location[1]).toEqual(52.085608763159264);
        expect(evt.terrainHeight).toEqual(44.26550618107624);
        done();
      });
      const entity = { id: "3" } as unknown as Entity;

      (cesiumMock.entities.add as Spy).and.returnValue(entity);

      service["addDrawing"](DrawingType.Point, earthPosition);

      expect(cesiumMock.entities.add).toHaveBeenCalledWith(
        objectContaining({
          position: earthPosition,
          point: service["defaultPointStyle"]
        })
      );
      expect(service["drawEntityIds"]).toHaveSize(1);
      expect(service["drawEntityIds"][0]).toEqual("3");
    });

    it("should add a custom Svg with an Entity in Cesium, return it and throw an event when addDrawing() is called", (done) => {
      service.getDrawEventObservable().subscribe((evt) => {
        expect(evt.location[0]).toEqual(4.317012899514346);
        expect(evt.location[1]).toEqual(52.085608763159264);
        expect(evt.terrainHeight).toEqual(44.26550618107624);
        done();
      });

      const entity = { id: "8" } as unknown as Entity;

      (cesiumMock.entities.add as Spy).and.returnValue(entity);

      const styleMap = new Map<DrawingType, PointGraphics | string>();
      styleMap.set(DrawingType.Svg, createCustomSvg());

      service.setDrawStyles(styleMap);

      service["addDrawing"](DrawingType.Svg, earthPosition);

      expect(cesiumMock.entities.add).toHaveBeenCalledWith(
        objectContaining({
          position: earthPosition,
          billboard: {
            image: createCustomSvg(),
            heightReference: HeightReference.CLAMP_TO_GROUND,
            verticalOrigin: VerticalOrigin.BOTTOM,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        })
      );
      expect(service["drawEntityIds"]).toHaveSize(1);
      expect(service["drawEntityIds"][0]).toEqual("8");
    });
  });

  describe("StopDraw and remove drawings", () => {
    it(
      "should remove the LEFT_CLICK ScreenSpaceEventType from the screenSpaceEventHandler and reset the " +
        "selections in the CoreSelectionService when stopDraw() is called ",
      () => {
        const removeInputActionSpy = spyOn(
          service["screenSpaceEventHandler"],
          "removeInputAction"
        );
        const leftClickSelection = {
          eventType: ScreenSpaceEventType.LEFT_CLICK,
          highlightColor: Color.BLACK
        };
        service["leftClickFromSelectionService"] = leftClickSelection;

        service.stopDraw();

        expect(removeInputActionSpy).toHaveBeenCalledWith(
          ScreenSpaceEventType.LEFT_CLICK
        );
        expect(coreSelectionServiceSpy.addSelection).toHaveBeenCalledWith(
          leftClickSelection
        );
      }
    );

    it("should remove the drawn entities from Cesium when removeDrawings() is called", () => {
      service["drawEntityIds"] = ["1", "2", "3"];

      service.removeAllDrawings();

      expect(cesiumMock.entities.removeById).toHaveBeenCalledTimes(3);
      service["drawEntityIds"].forEach((id) => {
        expect(cesiumMock.entities.removeById).toHaveBeenCalledWith(id);
      });
    });
  });
});

function createCustomSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="26.667" height="40" viewBox="0 0 26.667 40">
  <defs>
    <style>.a {
      fill: #fff;
    }

    .b, .d {
      fill: #70a326;
    }

    .c, .d {
      stroke: none;
    }</style>
  </defs>
  <g class="a">
    <path class="c"
          d="M 13.33336734771729 38.21394348144531 C 12.14045238494873 36.42692947387695 9.821549415588379 32.87455368041992 7.525362968444824 28.91543960571289 C 2.132092952728271 19.61631965637207 1.000002980232239 15.30912971496582 1.000002980232239 13.33333015441895 C 1.000002980232239 10.03897953033447 2.282892942428589 6.941810131072998 4.612352848052979 4.612349987030029 C 6.941812992095947 2.28289008140564 10.03898334503174 1 13.33333301544189 1 C 16.62768363952637 1 19.724853515625 2.28289008140564 22.05431365966797 4.612349987030029 C 24.38377380371094 6.941810131072998 25.66666221618652 10.03897953033447 25.66666221618652 13.33333015441895 C 25.66666221618652 15.31017017364502 24.53348350524902 19.6201000213623 19.13500213623047 28.92630958557129 C 16.83980941772461 32.88290023803711 14.52487945556641 36.42911148071289 13.33336734771729 38.21394348144531 Z" />
    <path class="d"
          d="M 13.33333301544189 2 C 10.30609321594238 2 7.460042953491211 3.178871154785156 5.319452285766602 5.319461822509766 C 3.178873062133789 7.460041046142578 2.000003814697266 10.30608940124512 2.000003814697266 13.33333015441895 C 2.000003814697266 14.84952926635742 2.829402923583984 18.82345008850098 8.384122848510742 28.40291023254395 C 10.21505546569824 31.56047058105469 12.06180191040039 34.45956039428711 13.33342170715332 36.40081024169922 C 14.60139846801758 34.46519470214844 16.44163131713867 31.57638359069824 18.27000427246094 28.42453002929688 C 23.83563232421875 18.83016967773438 24.66666221618652 14.85120964050293 24.66666221618652 13.33333015441895 C 24.66666221618652 10.30608940124512 23.48779296875 7.460041046142578 21.34720230102539 5.319461822509766 C 19.20662307739258 3.178871154785156 16.36057281494141 2 13.33333301544189 2 M 13.33333301544189 0 C 20.69712257385254 0 26.66666221618652 5.969539642333984 26.66666221618652 13.33333015441895 C 26.66666221618652 20.69713020324707 13.33333301544189 40 13.33333301544189 40 C 13.33333301544189 40 3.814697265625e-06 20.69713020324707 3.814697265625e-06 13.33333015441895 C 3.814697265625e-06 5.969539642333984 5.969533920288086 0 13.33333301544189 0 Z" />
  </g>
  <path class="b"
        d="M5.095,15.543.22,10.668a.75.75,0,0,1,0-1.061L1.28,8.547a.75.75,0,0,1,1.061,0l3.284,3.284L12.659,4.8a.75.75,0,0,1,1.061,0L14.78,5.858a.75.75,0,0,1,0,1.061L6.155,15.543A.75.75,0,0,1,5.095,15.543Z"
        transform="translate(5.94 4.687)" />
</svg>`;
}
