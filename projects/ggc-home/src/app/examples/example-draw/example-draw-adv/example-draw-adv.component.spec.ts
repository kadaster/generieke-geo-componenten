import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDrawAdvComponent } from "./example-draw-adv.component";

describe("ExampleDrawAdvComponent", () => {
  let component: ExampleDrawAdvComponent;
  let fixture: ComponentFixture<ExampleDrawAdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDrawAdvComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDrawAdvComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
