import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GgcToolbarItemComponent } from "../toolbar-item/ggc-toolbar-item.component";
import { GgcToolbarComponent } from "./ggc-toolbar.component";
import { provideZoneChangeDetection } from "@angular/core";

@Component({
  imports: [GgcToolbarComponent, GgcToolbarItemComponent],
  template: `
    <ggc-toolbar>
      <ggc-toolbar-item [icon]="'fab fa-linux'" [title]="'test title'">
        <div>Hello World</div>
      </ggc-toolbar-item>
    </ggc-toolbar>
  `
})
class TestHostComponent {
  @ViewChild(GgcToolbarComponent)
  toolbar: GgcToolbarComponent;
}

describe("ToolboxComponent", () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZoneChangeDetection()]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it("should create", () => {
    expect(hostComponent).toBeTruthy();
  });

  it("should render item content after click", () => {
    const toolbar = hostComponent.toolbar;

    (toolbar as any).children.forEach((child: any) => child.handleClick());

    hostFixture.detectChanges();

    const content = hostFixture.debugElement.query(
      By.css(".ggc-toolbar-content")
    ).nativeElement;

    expect(content.textContent).toContain("Hello World");
  });
});
