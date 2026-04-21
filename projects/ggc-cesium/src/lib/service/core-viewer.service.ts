import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { Viewer } from "@cesium/widgets";

@Injectable({
  providedIn: "root"
})
export class CoreViewerService {
  private viewerSubject = new BehaviorSubject<Viewer | undefined>(undefined);

  // the Viewer is created in viewer.component,
  // this method should only be called from viewer.component!
  setViewer(viewer: Viewer | undefined): void {
    this.viewerSubject.next(viewer);
  }

  getViewerObservable(): Observable<Viewer | undefined> {
    return this.viewerSubject.asObservable();
  }

  getViewer(): Viewer | undefined {
    return this.viewerSubject.getValue();
  }
}
