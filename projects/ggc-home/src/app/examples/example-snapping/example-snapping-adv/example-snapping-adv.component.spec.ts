import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleSnappingAdvComponent } from "./example-snapping-adv.component";

describe("ExampleSnappingAdvComponent", () => {
  let component: ExampleSnappingAdvComponent;
  let fixture: ComponentFixture<ExampleSnappingAdvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleSnappingAdvComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleSnappingAdvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
