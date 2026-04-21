import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { LayerSelectorComponent } from "../layer-selector/layer-selector.component";

import { ThemeSelectorComponent } from "./theme-selector.component";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { of } from "rxjs";

describe("ThemeSelectorComponent", () => {
  let component: ThemeSelectorComponent;
  let fixture: ComponentFixture<ThemeSelectorComponent>;

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
      imports: [ThemeSelectorComponent, LayerSelectorComponent],
      providers: [
        {
          provide: DatasetTreeMapConnectService,
          useValue: datasetTreeMapConnectServiceSpy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeSelectorComponent);
    component = fixture.componentInstance;
    component.themes = [];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
