import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcBasicViewerComponent } from "./ggc-basic-viewer.component";

describe("BasicViewerComponent", () => {
  let component: GgcBasicViewerComponent;
  let fixture: ComponentFixture<GgcBasicViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GgcBasicViewerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GgcBasicViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
