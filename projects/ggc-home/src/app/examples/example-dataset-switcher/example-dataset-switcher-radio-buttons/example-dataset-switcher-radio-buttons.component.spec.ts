import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExampleDatasetSwitcherRadioButtonsComponent } from "./example-dataset-switcher-radio-buttons.component";

describe("ExampleDatasetSwitcherRadioButtonsComponent", () => {
  let component: ExampleDatasetSwitcherRadioButtonsComponent;
  let fixture: ComponentFixture<ExampleDatasetSwitcherRadioButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleDatasetSwitcherRadioButtonsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(
      ExampleDatasetSwitcherRadioButtonsComponent
    );
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
