import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDrawEditBasicComponent } from "./example-draw-center-edit-basic.component";

describe("ExampleDrawEditBasicComponent", () => {
  let component: ExampleDrawEditBasicComponent;
  let fixture: ComponentFixture<ExampleDrawEditBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDrawEditBasicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDrawEditBasicComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
