import { vi } from "vitest";

export interface MapView {
  setResolution(resolution?: number): void;
  getResolution(): number;
  getResolutions(): number[];
  getMinZoom(): number;
  setMinZoom(z: number): void;
}

export class Map {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options?: unknown) {}

  addLayer(_layer?: unknown): void {
    /* noop */
  }
  removeLayer(_layer?: unknown): void {
    /* noop */
  }

  setTarget(): void {
    /* noop */
  }
  updateSize(): void {
    /* noop */
  }
  on(..._args: unknown[]): void {
    /* noop */
  }
  once(..._args: unknown[]): void {
    /* noop */
  }
  un(..._args: unknown[]): void {
    /* noop */
  }

  // _setView(_view?: unknown): void {
  //   /* noop */
  // }

  setView = vi.fn();

  getView(): MapView {
    return {
      setResolution: (_res?: number): void => {},
      getResolution: (): number => 6,
      getResolutions: (): number[] => [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15
      ],
      getMinZoom: (): number => 0,
      setMinZoom: (_z: number): void => {}
    };
  }

  getLayers(): {
    getArray: () => unknown[];
    on: (..._args: unknown[]) => void;
  } {
    return {
      getArray: (): unknown[] => [],
      on: (..._args: unknown[]): void => {}
    };
  }

  addControl(_c?: unknown): void {
    /* noop */
  }
  removeControl(_c?: unknown): void {
    /* noop */
  }

  addEventListener(..._args: unknown[]): void {
    /* noop */
  }
  removeEventListener(..._args: unknown[]): void {
    /* noop */
  }
  dispatchEvent(_event?: unknown): boolean {
    return true;
  }
}

export default Map;
