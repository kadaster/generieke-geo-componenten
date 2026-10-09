import { Service } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";

export interface DatasetLegendToggle {
  mapIndex: string;
  expanded: boolean;
}

@Service()
export class CoreLegendService {
  private readonly expandAllSubject = new ReplaySubject<DatasetLegendToggle>();

  getExpandAllObservable(): Observable<DatasetLegendToggle> {
    return this.expandAllSubject.asObservable();
  }

  emitExpandAll(datasetLegendToggle: DatasetLegendToggle): void {
    this.expandAllSubject.next(datasetLegendToggle);
  }
}
