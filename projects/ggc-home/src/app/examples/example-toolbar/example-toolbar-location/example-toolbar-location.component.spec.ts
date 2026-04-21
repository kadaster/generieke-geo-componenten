import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleToolbarLocation } from "./example-toolbar-location.component";

describe("ExampleSearchLocationComponent", () => {
  let component: ExampleToolbarLocation;
  let fixture: ComponentFixture<ExampleToolbarLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleToolbarLocation]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleToolbarLocation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
