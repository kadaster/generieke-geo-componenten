import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { FeatureInfoComponentEvent } from "@kadaster/ggc-feature-info";

@Injectable({
  providedIn: "root"
})
export class FeatureInfoEventService {
  readonly eventSubject = new Subject<FeatureInfoComponentEvent>();

  /**
   * Observable met FeatureInfoEvents.
   */
  readonly events$ = this.eventSubject.asObservable();

  /**
   * Emit een FeatureInfoEvent.
   */
  emit(event: FeatureInfoComponentEvent): void {
    this.eventSubject.next(event);
  }
}
