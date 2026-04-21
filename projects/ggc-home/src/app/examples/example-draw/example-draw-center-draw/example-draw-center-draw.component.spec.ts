import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDrawCenterDrawComponent } from "./example-draw-center-draw.component";

describe("ExampleDrawOptionsComponent", () => {
  let component: ExampleDrawCenterDrawComponent;
  let fixture: ComponentFixture<ExampleDrawCenterDrawComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDrawCenterDrawComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDrawCenterDrawComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
