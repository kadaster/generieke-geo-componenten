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

  it("should receive events from the observable", (done) => {
    service
      .getViewerObservable()
      .pipe(skip(1))
      .subscribe((viewer) => {
        expect(viewer).toBeDefined();
        done();
      });

    service.setViewer({} as Viewer);
  });
});
