import { Injectable } from "@angular/core";
import { ReplaySubject } from "rxjs";

export interface DatasetLegendToggle {
  mapIndex: string;
  expanded: boolean;
}

@Injectable({
  providedIn: "root"
})
export class CoreLegendService {
  expandAll$: ReplaySubject<DatasetLegendToggle> =
    new ReplaySubject<DatasetLegendToggle>();
}
