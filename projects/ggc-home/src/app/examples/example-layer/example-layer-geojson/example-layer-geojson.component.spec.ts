import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerGeojsonComponent } from "./example-layer-geojson.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerGeojsonComponent;
  let fixture: ComponentFixture<ExampleLayerGeojsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerGeojsonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerGeojsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
