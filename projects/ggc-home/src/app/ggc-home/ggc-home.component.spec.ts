import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcHomeComponent } from "./ggc-home.component";
import { EventTrackerService } from "../service/event-tracker.service";

describe("ExampleFormatComponent", () => {
  let component: GgcHomeComponent;
  let eventTrackerService: EventTrackerService;
  let fixture: ComponentFixture<GgcHomeComponent>;
  let piwikTrackerServiceSpy: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcHomeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcHomeComponent);
    component = fixture.componentInstance;

    eventTrackerService = TestBed.inject(EventTrackerService);
    piwikTrackerServiceSpy = spyOn(
      eventTrackerService["customEventsServicePiwik"],
      "trackEvent"
    ).and.callThrough();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

});
