import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerAdvanced2Component } from "./example-layer-advanced2.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerAdvanced2Component;
  let fixture: ComponentFixture<ExampleLayerAdvanced2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerAdvanced2Component]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerAdvanced2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
