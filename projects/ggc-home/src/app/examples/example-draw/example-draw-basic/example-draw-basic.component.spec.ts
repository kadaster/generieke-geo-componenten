import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDrawBasicComponent } from "./example-draw-basic.component";

describe("ExampleDrawBasicComponent", () => {
  let component: ExampleDrawBasicComponent;
  let fixture: ComponentFixture<ExampleDrawBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDrawBasicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDrawBasicComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
