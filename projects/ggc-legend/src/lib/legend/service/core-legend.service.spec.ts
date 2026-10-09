import { TestBed } from "@angular/core/testing";
import { CoreLegendService, DatasetLegendToggle } from "./core-legend.service";

describe("CoreLegendService", () => {
  let coreLegendService: CoreLegendService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CoreLegendService] });
    coreLegendService = TestBed.inject(CoreLegendService);
  });

  it("replays all expand/collapse events to a late subscriber", () => {
    const toggleEvents: DatasetLegendToggle[] = [
      { mapIndex: "Jan", expanded: true },
      { mapIndex: "Jan", expanded: false }
    ];
    const replayedEvents: DatasetLegendToggle[] = [];

    toggleEvents.forEach((toggleEvent) =>
      coreLegendService.emitExpandAll(toggleEvent)
    );

    const subscription = coreLegendService
      .getExpandAllObservable()
      .subscribe((toggleEvent) => replayedEvents.push(toggleEvent));
    subscription.unsubscribe();

    expect(replayedEvents).toEqual(toggleEvents);
  });
});
