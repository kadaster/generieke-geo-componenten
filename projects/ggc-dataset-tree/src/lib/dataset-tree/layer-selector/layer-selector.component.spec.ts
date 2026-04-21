import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CoreDatasetTreeService } from "../../core/core-dataset-tree.service";
import { GgcDatasetTreeModelCreateService } from "../../core/ggc-dataset-tree-model-create.service";
import { Dataset } from "../../model/theme/dataset.model";

import { LayerSelectorComponent } from "./layer-selector.component";
import { DatasetTreeWebservice } from "../../model/theme/dataset-tree-webservice.model";
import { provideZoneChangeDetection } from "@angular/core";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { of } from "rxjs";

describe("LayerSelectorComponent", () => {
  let fixture: ComponentFixture<LayerSelectorComponent>;
  let component: LayerSelectorComponent;
  const service: DatasetTreeWebservice = new DatasetTreeWebservice([]);
  let datasetTreeMapConnectServiceSpy: jasmine.SpyObj<DatasetTreeMapConnectService>;

  beforeEach(waitForAsync(() => {
    datasetTreeMapConnectServiceSpy =
      jasmine.createSpyObj<DatasetTreeMapConnectService>(
        "DatasetTreeMapConnectService",
        ["getLayerChangedObservable"]
      );
    datasetTreeMapConnectServiceSpy.getLayerChangedObservable.and.returnValue(
      Promise.resolve(Promise.resolve(of()))
    );
    TestBed.configureTestingModule({
      imports: [LayerSelectorComponent],
      providers: [
        CoreDatasetTreeService,
        GgcDatasetTreeModelCreateService,
        provideZoneChangeDetection(),
        {
          provide: DatasetTreeMapConnectService,
          useValue: datasetTreeMapConnectServiceSpy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerSelectorComponent);
    component = fixture.componentInstance;

    component.hideTree = false;
    component.iconInfoUrl = "glyphicon glyphicon-info-sign";

    fixture.detectChanges();
  });

  it("should be create", () => {
    expect(component).toBeTruthy();
  });

  describe("infoUrl", () => {
    it("when there is an infoUrl available there should be an icon to view the url", async () => {
      component.datasets = [new Dataset("myDataset", [service], "infourl")];
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css(".info"));
      expect(element).toBeTruthy();
      expect(element.nativeElement.getAttribute("class")).toEqual(
        "ggc-dt-info glyphicon glyphicon-info-sign info"
      );
    });

    it("when there is no infoUrl available (empty string) there should not be an icon to view the url", () => {
      component.datasets = [new Dataset("myDataset", [service], "")];
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css(".info"));
      expect(element).toBeFalsy();
      expect(element).toMatch("");
      expect(element).toBeDefined();
    });

    it("when there is no infoUrl available (null) there should not be an icon to view the url", () => {
      component.datasets = [
        new Dataset("myDataset", [service], null as unknown as string)
      ];
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css(".info"));
      expect(element).toBeFalsy();
      expect(element).toBeNull();
      expect(element).toBeDefined();
    });

    it("when there is no infoUrl available (undefined) there should not be an icon to view the url", () => {
      component.datasets = [
        new Dataset("myDataset", [service], undefined as unknown as string)
      ];
      fixture.detectChanges();
      const element = fixture.debugElement.query(By.css(".info"));
      expect(element).toBeFalsy();
      expect(element).toBeDefined();
    });
  });
});
