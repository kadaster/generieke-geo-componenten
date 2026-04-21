import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleToolbar } from "./example-toolbar-location.component";

describe("ExampleSearchLocationComponent", () => {
  let component: ExampleToolbar;
  let fixture: ComponentFixture<ExampleToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleToolbar]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleToolbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
