import { TestBed } from "@angular/core/testing";
import { EventTrackerService } from "./event-tracker.service";
import { vi } from "vitest";

describe("EventTrackerService", () => {
  let eventTrackerService: EventTrackerService;
  let piwikTrackerServiceSpy: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventTrackerService]
    });
    eventTrackerService = TestBed.inject(EventTrackerService);

    piwikTrackerServiceSpy = vi.spyOn(
      eventTrackerService["customEventsServicePiwik"],
      "trackEvent"
    );
  });

  it("should be created", () => {
    expect(eventTrackerService).toBeTruthy();
  });

  it("should track an event", () => {
    eventTrackerService.trackEvent("testname");

    expect(piwikTrackerServiceSpy).toHaveBeenCalledWith(
      "content",
      "click_intern",
      "testname"
    );
  });
});
