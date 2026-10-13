import { Service } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { FeatureInfoComponentEvent } from "../model/feature-info-component-event";

@Service()
export class FeatureInfoEventService {
  readonly events$: Observable<FeatureInfoComponentEvent>;

  private readonly eventSubject = new Subject<FeatureInfoComponentEvent>();

  constructor() {
    this.events$ = this.eventSubject.asObservable();
  }

  /**
   * Emit een FeatureInfoEvent.
   */
  emit(event: FeatureInfoComponentEvent): void {
    this.eventSubject.next(event);
  }
}
