import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerGeojsonWfsComponent } from "./example-layer-geojson-wfs.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerGeojsonWfsComponent;
  let fixture: ComponentFixture<ExampleLayerGeojsonWfsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerGeojsonWfsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerGeojsonWfsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
