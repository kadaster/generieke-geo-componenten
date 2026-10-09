import { inject, Service } from "@angular/core";
import { CustomEventsService } from "@piwikpro/ngx-piwik-pro";

@Service()
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
