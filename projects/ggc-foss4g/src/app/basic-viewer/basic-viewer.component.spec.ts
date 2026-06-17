import { ComponentFixture, TestBed } from "@angular/core/testing";

import { BasicViewerComponent } from "./basic-viewer.component";

describe("BasicViewerComponent", () => {
  let component: BasicViewerComponent;
  let fixture: ComponentFixture<BasicViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BasicViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
