import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerAdvancedComponent } from "./example-layer-advanced.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerAdvancedComponent;
  let fixture: ComponentFixture<ExampleLayerAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerAdvancedComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
