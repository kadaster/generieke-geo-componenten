import { inject, Injectable } from "@angular/core";
import { CustomEventsService } from "@piwikpro/ngx-piwik-pro";

@Injectable({
  providedIn: "root"
})
export class EventTrackerService {
  private readonly customEventsServicePiwik = inject(CustomEventsService);

  // Event category (Button), event action (Click), Custom event name (eventName)

  trackEvent(
    eventCategory: "content" | "Map" | "Checkbox",
    eventAction: "click_intern",
    eventName: string
  ) {
    this.customEventsServicePiwik.trackEvent(
      eventCategory,
      eventAction,
      eventName
    );
  }
}
