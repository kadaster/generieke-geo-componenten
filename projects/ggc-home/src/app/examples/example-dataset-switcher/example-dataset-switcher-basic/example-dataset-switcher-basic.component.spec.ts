import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDatasetSwitcherBasicComponent } from "./example-dataset-switcher-basic.component";

describe("ExampleDatasetSwitcherBasicComponent", () => {
  let component: ExampleDatasetSwitcherBasicComponent;
  let fixture: ComponentFixture<ExampleDatasetSwitcherBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDatasetSwitcherBasicComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleDatasetSwitcherBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
