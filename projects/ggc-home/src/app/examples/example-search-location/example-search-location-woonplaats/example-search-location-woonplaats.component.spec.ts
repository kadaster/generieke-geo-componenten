import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleSearchLocationWoonplaatsComponent } from "./example-search-location-woonplaats.component";

describe("ExampleSearchLocationWoonplaatsComponent", () => {
  let component: ExampleSearchLocationWoonplaatsComponent;
  let fixture: ComponentFixture<ExampleSearchLocationWoonplaatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleSearchLocationWoonplaatsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleSearchLocationWoonplaatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
