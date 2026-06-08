import "zone.js";
import "zone.js/testing";
import { vi, afterEach } from "vitest";

afterEach(() => {
  // clear de history van de mocks na elke test.
  vi.clearAllMocks();
});

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;
