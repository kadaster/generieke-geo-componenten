import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { GgcToolbarItemComponent } from "./ggc-toolbar-item.component";

describe("ToolbarButtonComponent", () => {
  let component: GgcToolbarItemComponent;
  let fixture: ComponentFixture<GgcToolbarItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcToolbarItemComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcToolbarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
