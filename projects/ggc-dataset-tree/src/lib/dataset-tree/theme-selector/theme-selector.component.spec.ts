import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { LayerSelectorComponent } from "../layer-selector/layer-selector.component";

import { ThemeSelectorComponent } from "./theme-selector.component";
import { DatasetTreeMapConnectService } from "../service/dataset-tree-map-connect.service";
import { of } from "rxjs";

describe("ThemeSelectorComponent", () => {
  let component: ThemeSelectorComponent;
  let fixture: ComponentFixture<ThemeSelectorComponent>;

  let datasetTreeMapConnectServiceSpy: MockedObject<DatasetTreeMapConnectService>;

  beforeEach(waitForAsync(() => {
    const datasetTreeMapConnectServiceSpyPartial = {
      getLayerChangedObservable: vi
        .fn()
        .mockName("DatasetTreeMapConnectService.getLayerChangedObservable")
    };
    TestBed.configureTestingModule({
      imports: [ThemeSelectorComponent, LayerSelectorComponent],
      providers: [
        {
          provide: DatasetTreeMapConnectService,
          useValue: datasetTreeMapConnectServiceSpyPartial
        }
      ]
    }).compileComponents();
    datasetTreeMapConnectServiceSpy = TestBed.inject(
      DatasetTreeMapConnectService
    ) as unknown as MockedObject<DatasetTreeMapConnectService>;
    datasetTreeMapConnectServiceSpy.getLayerChangedObservable.mockReturnValue(
      Promise.resolve(Promise.resolve(of()))
    );
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
