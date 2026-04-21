import { ComponentFixture, TestBed } from "@angular/core/testing";

import { QuickstartComponent } from "./quickstart.component";

describe("QuickstartComponent", () => {
  let component: QuickstartComponent;
  let fixture: ComponentFixture<QuickstartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickstartComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickstartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
