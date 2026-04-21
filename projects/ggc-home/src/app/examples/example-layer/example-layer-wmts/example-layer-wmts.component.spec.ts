import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleLayerWmtsComponent } from "./example-layer-wmts.component";

describe("ExampleLayerWmtsComponent", () => {
  let component: ExampleLayerWmtsComponent;
  let fixture: ComponentFixture<ExampleLayerWmtsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleLayerWmtsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleLayerWmtsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
