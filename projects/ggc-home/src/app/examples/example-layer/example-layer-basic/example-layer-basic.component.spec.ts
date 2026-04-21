import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerBasicComponent } from "./example-layer-basic.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerBasicComponent;
  let fixture: ComponentFixture<ExampleLayerBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerBasicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
