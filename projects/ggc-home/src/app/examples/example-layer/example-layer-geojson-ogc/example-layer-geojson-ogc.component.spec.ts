import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerGeojsonOgcComponent } from "./example-layer-geojson-ogc.component";

describe("ExampleLayerGeojsonOgcComponent", () => {
  let component: ExampleLayerGeojsonOgcComponent;
  let fixture: ComponentFixture<ExampleLayerGeojsonOgcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerGeojsonOgcComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerGeojsonOgcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
