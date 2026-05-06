import { TestBed, waitForAsync } from "@angular/core/testing";
import { EventTrackerService } from "./event-tracker.service";

describe("EventTrackerService", () => {
  let eventTrackerService: EventTrackerService;
  let piwikTrackerServiceSpy: any;

  beforeEach(waitForAsync(() => TestBed.configureTestingModule({})));

  beforeEach(() => {
    eventTrackerService = TestBed.inject(EventTrackerService);
    piwikTrackerServiceSpy = spyOn(
      eventTrackerService["customEventsServicePiwik"],
      "trackEvent"
    ).and.callThrough();
  });

  it("should be created", () => {
    expect(eventTrackerService).toBeTruthy();
  });

  it("should track an event", () => {
    eventTrackerService.trackEvent("Button", "testname");

    expect(piwikTrackerServiceSpy).toHaveBeenCalledWith(
      "Button",
      "Click",
      "testname"
    );
  });

  it("should track an event with the current state", () => {
    eventTrackerService.setCurrentFeedbackMode("new");
    eventTrackerService.trackEventWithFeedbackMode("Button", "testname");

    expect(piwikTrackerServiceSpy).toHaveBeenCalledWith(
      "Button",
      "Click",
      "testname (new)"
    );
  });
});
