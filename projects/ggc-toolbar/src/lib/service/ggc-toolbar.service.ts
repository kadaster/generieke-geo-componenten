import { Service, Signal, signal } from "@angular/core";

/**
 * Service voor het beheren van de actieve toolbar-item.
 *
 * `GgcToolbarService` houdt de status van het huidige actieve toolbar-item bij.
 */
@Service()
export class GgcToolbarService {
  private readonly activeToolbarItemState = signal<string | null>(null);

  /**
   * Read the active toolbar item here; updates remain available through
   * `setActiveToolbarItem`. This replaces `getActiveToolbarItemObservable()`.
   */
  get activeToolbarItem(): Signal<string | null> {
    return this.activeToolbarItemState.asReadonly();
  }

  setActiveToolbarItem(activeId: string | null): void {
    this.activeToolbarItemState.set(activeId);
  }
}
