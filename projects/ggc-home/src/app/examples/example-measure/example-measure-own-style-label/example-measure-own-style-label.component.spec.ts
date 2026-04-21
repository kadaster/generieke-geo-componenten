import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleMeasureOwnStyleLabel } from "./example-measure-own-style-label.component";

describe("ExampleDrawOptionsComponent", () => {
  let component: ExampleMeasureOwnStyleLabel;
  let fixture: ComponentFixture<ExampleMeasureOwnStyleLabel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleMeasureOwnStyleLabel]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleMeasureOwnStyleLabel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
