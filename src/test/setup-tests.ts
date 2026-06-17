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
  // clear de history van de mocks na elke test.
  vi.clearAllMocks();
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
