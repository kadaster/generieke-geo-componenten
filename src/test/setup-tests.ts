import "zone.js";
import "zone.js/testing";
import { vi, afterEach } from "vitest";
import { provideZoneChangeDetection } from "@angular/core";

// beforeEach(() => {
//   TestBed.configureTestingModule({
//     providers: [provideZoneChangeDetection()]
//   });
// });

afterEach(() => {
  // clear de history van de mocks na elke test.
  vi.clearAllMocks();
});
