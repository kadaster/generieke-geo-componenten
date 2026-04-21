import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDrawStyle } from "./example-draw-style.component";

describe("ExampleDrawOptionsComponent", () => {
  let component: ExampleDrawStyle;
  let fixture: ComponentFixture<ExampleDrawStyle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDrawStyle]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDrawStyle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
