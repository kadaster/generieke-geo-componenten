import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleMeasure } from "./example-measure.component";

describe("ExampleDrawOptionsComponent", () => {
  let component: ExampleMeasure;
  let fixture: ComponentFixture<ExampleMeasure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleMeasure]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleMeasure);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
