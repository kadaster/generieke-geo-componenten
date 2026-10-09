import { TestBed } from "@angular/core/testing";

import { CoreViewerService } from "./core-viewer.service";
import { Viewer } from "@cesium/widgets";
import { skip } from "rxjs";

describe("CoreViewerService", () => {
  let service: CoreViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreViewerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should receive events from the observable", async () => {
    service
      .getViewerObservable()
      .pipe(skip(1))
      .subscribe((viewer) => {
        expect(viewer).toBeDefined();
      });

    service.setViewer({} as Viewer);
  });

  it("should return the current viewer", () => {
    const viewer = {} as Viewer;

    expect(service.getViewer()).toBeUndefined();

    service.setViewer(viewer);

    expect(service.getViewer()).toBe(viewer);
  });

  it("should preserve initial and repeated emissions from the viewer observable", () => {
    const viewer = {} as Viewer;
    const emittedViewers: (Viewer | undefined)[] = [];
    const subscription = service
      .getViewerObservable()
      .subscribe((nextViewer) => emittedViewers.push(nextViewer));

    service.setViewer(viewer);
    service.setViewer(viewer);
    subscription.unsubscribe();

    expect(emittedViewers).toEqual([undefined, viewer, viewer]);
  });
});
