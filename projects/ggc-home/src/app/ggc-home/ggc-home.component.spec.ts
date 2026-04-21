import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcHomeComponent } from "./ggc-home.component";

describe("ExampleFormatComponent", () => {
  let component: GgcHomeComponent;
  let fixture: ComponentFixture<GgcHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcHomeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
