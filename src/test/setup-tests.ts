import "zone.js";
import "zone.js/testing";
import { vi, afterEach } from "vitest";

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

