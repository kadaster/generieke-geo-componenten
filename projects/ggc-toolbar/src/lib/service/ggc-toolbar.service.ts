import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

/**
 * Service voor het beheren van de actieve toolbar-item.
 *
 * `GgcToolbarService` houdt de status van het huidige actieve toolbar-item bij.
 */
@Injectable({
  providedIn: "root"
})
export class GgcToolbarService {
  private readonly activeToolbarItem = new BehaviorSubject<string | null>(null);

  setActiveToolbarItem(activeId: string | null) {
    this.activeToolbarItem.next(activeId);
  }

  getActiveToolbarItemObservable(): BehaviorSubject<string | null> {
    return this.activeToolbarItem;
  }
}
