import { Component, DebugElement, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GgcToolbarItemComponent } from "../toolbar-item/ggc-toolbar-item.component";
import { GgcToolbarComponent } from "./ggc-toolbar.component";
import { provideZoneChangeDetection } from "@angular/core";

@Component({
  imports: [GgcToolbarItemComponent, GgcToolbarComponent],
  template: ` <ggc-toolbar class="toolbar-position">
    <ggc-toolbar-item [icon]="'fab fa-linux'" [title]="'test title'">
      <div>Hello World</div>
    </ggc-toolbar-item>
  </ggc-toolbar>`
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
class TestToolBar {
  @ViewChild(GgcToolbarComponent) toolbar: GgcToolbarComponent;
}

describe("ToolboxComponent", () => {
  let component: GgcToolbarComponent;
  let fixture: ComponentFixture<GgcToolbarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GgcToolbarComponent, TestToolBar, GgcToolbarItemComponent],
      providers: [provideZoneChangeDetection()]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GgcToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it(
    "When handleClick methode is activated, it should add the child content of ggc-toolbar-item " +
      "to the div element .ggc-toolbar-content ",
    () => {
      const testFixture = TestBed.createComponent(TestToolBar);

      testFixture.detectChanges();

      const componentInstance = testFixture.componentInstance;
      // simulate button click
      componentInstance.toolbar["children"].forEach((child) =>
        child.handleClick()
      );

      testFixture.detectChanges();

      const deC: DebugElement = testFixture.debugElement.query(
        By.css(".ggc-toolbar-content")
      );

      expect(deC.nativeNode.innerText).toBe("Hello World");
    }
  );
});
