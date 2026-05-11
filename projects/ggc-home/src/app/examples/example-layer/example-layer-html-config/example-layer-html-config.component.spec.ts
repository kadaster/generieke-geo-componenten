import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerHtmlConfig } from "./example-layer-html-config.component";

describe("ExampleLayerGeojsonComponent", () => {
  let component: ExampleLayerHtmlConfig;
  let fixture: ComponentFixture<ExampleLayerHtmlConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerHtmlConfig]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerHtmlConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
