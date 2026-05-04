import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleMapZoomScalePosition } from "./example-map-zoom-scale-position";

describe("ExampleMapZoomScalePosition", () => {
  let component: ExampleMapZoomScalePosition;
  let fixture: ComponentFixture<ExampleMapZoomScalePosition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleMapZoomScalePosition]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleMapZoomScalePosition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
