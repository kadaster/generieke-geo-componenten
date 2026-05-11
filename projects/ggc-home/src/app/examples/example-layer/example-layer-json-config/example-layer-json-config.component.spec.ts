import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerJsonConfig } from "./example-layer-json-config.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerJsonConfig;
  let fixture: ComponentFixture<ExampleLayerJsonConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerJsonConfig]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerJsonConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
