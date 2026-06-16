import { ComponentFixture, TestBed } from "@angular/core/testing";

import { GgcMapDetailsContainerComponent } from "./ggc-map-details-container.component";

describe("MapDetailsContainerComponent", () => {
  let component: GgcMapDetailsContainerComponent;
  let fixture: ComponentFixture<GgcMapDetailsContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GgcMapDetailsContainerComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcMapDetailsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
