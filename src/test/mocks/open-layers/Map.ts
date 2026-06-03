export interface MapView {
  setResolution(resolution?: number): void;
  getResolution(): number;
  getMinZoom(): number;
  setMinZoom(z: number): void;
}

export class Map {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_options?: unknown) {}

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

  setView(_view?: unknown): void {
    /* noop */
  }

  getView(): MapView {
    return {
      setResolution: (_res?: number): void => {},
      getResolution: (): number => 6,
      getMinZoom: (): number => 3,
      setMinZoom: (_z: number): void => {}
    };
  }

  getLayers(): { getArray: () => unknown[] } {
    return {
      getArray: (): unknown[] => []
    };
  }

  addControl(_c?: unknown): void {
    /* noop */
  }
  removeControl(_c?: unknown): void {
    /* noop */
  }
}
