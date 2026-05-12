import { inject, Injectable } from "@angular/core";
import { CustomEventsService } from "@piwikpro/ngx-piwik-pro";

@Injectable({
  providedIn: "root"
})
export class EventTrackerService {
  private readonly customEventsServicePiwik = inject(CustomEventsService);

  trackEvent(eventName: string) {
    this.customEventsServicePiwik.trackEvent(
      "content",
      "click_intern",
      eventName
    );
  }
}
