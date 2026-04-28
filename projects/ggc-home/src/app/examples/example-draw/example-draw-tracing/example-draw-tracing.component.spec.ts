import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDrawTracingComponent } from "./example-draw-tracing.component";

describe("ExampleDrawTracingComponent", () => {
  let component: ExampleDrawTracingComponent;
  let fixture: ComponentFixture<ExampleDrawTracingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDrawTracingComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDrawTracingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
