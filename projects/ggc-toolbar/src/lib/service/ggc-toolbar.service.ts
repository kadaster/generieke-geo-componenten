import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

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
