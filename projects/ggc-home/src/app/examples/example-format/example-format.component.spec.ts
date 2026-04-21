import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleFormatComponent } from "./example-format.component";

describe("ExampleFormatComponent", () => {
  let component: ExampleFormatComponent;
  let fixture: ComponentFixture<ExampleFormatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleFormatComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleFormatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
