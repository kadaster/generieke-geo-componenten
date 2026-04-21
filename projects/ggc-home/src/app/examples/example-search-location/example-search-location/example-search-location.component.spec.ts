import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleSearchLocationComponent } from "./example-search-location.component";

describe("ExampleSearchLocationComponent", () => {
  let component: ExampleSearchLocationComponent;
  let fixture: ComponentFixture<ExampleSearchLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleSearchLocationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleSearchLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
