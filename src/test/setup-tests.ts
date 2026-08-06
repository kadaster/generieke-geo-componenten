import "zone.js";
import "zone.js/testing";
import { afterEach, vi } from "vitest";
import { getTestBed } from "@angular/core/testing";
import {
  BrowserTestingModule,
  platformBrowserTesting
} from "@angular/platform-browser/testing";

// Testbed initialiseren voor gebruik Vitest UI
const testBed = getTestBed();
if (!testBed.platform) {
  testBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
    teardown: { destroyAfterEach: true }
  });
}

afterEach(() => {
  // Herstel alle mocks/spies na elke test naar hun originele implementatie
  // (in plaats van enkel de call-history te wissen). Dit voorkomt dat een
  // vi.spyOn(...) uit de ene test (zonder mockRestore) de volgende test of
  // een ander spec-bestand beinvloedt.
  vi.restoreAllMocks();
});

globalThis.ResizeObserver = class {
  observe() {
    // mock
  }
  unobserve() {
    // mock
  }
  disconnect() {
    // mock
  }
} as any;
