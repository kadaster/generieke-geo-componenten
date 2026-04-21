import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleSnappingBasicComponent } from "./example-snapping-basic.component";

describe("ExampleSnappingBasicComponent", () => {
  let component: ExampleSnappingBasicComponent;
  let fixture: ComponentFixture<ExampleSnappingBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleSnappingBasicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleSnappingBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
