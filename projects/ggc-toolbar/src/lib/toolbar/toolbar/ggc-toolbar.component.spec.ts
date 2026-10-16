import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { GgcToolbarItemComponent } from "../toolbar-item/ggc-toolbar-item.component";
import { GgcToolbarComponent } from "./ggc-toolbar.component";
import { provideZonelessChangeDetection } from "@angular/core";
import { GgcToolbarService } from "../../service/ggc-toolbar.service";

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
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
  });

  it("should create", () => {
    expect(hostComponent).toBeTruthy();
  });

  it("should render item content after click", () => {
    const items = hostFixture.debugElement.queryAll(
      By.directive(GgcToolbarItemComponent)
    );

    items[0].componentInstance.handleClick();
    hostFixture.detectChanges();

    const content = hostFixture.debugElement.query(
      By.css(".ggc-toolbar-content")
    );
    const tabPane = hostFixture.debugElement.query(By.css(".tab-pane"));

    expect(content).not.toBeNull();
    expect(content.nativeElement.textContent).toContain("Hello World");
    expect(tabPane.nativeElement.classList).toContain("active");
    expect(tabPane.nativeElement.classList).not.toContain("d-sm-none");
  });

  it("should deactivate toolbar items when the active item is cleared", () => {
    const item = hostFixture.debugElement.query(
      By.directive(GgcToolbarItemComponent)
    ).componentInstance as GgcToolbarItemComponent;
    const toolbarService = TestBed.inject(GgcToolbarService);

    item.handleClick();
    hostFixture.detectChanges();
    expect(
      hostFixture.debugElement.query(By.css(".ggc-toolbar-item.active"))
    ).not.toBeNull();

    toolbarService.setActiveToolbarItem("search");
    toolbarService.setActiveToolbarItem(null);
    hostFixture.detectChanges();

    expect(
      hostFixture.debugElement.query(By.css(".ggc-toolbar-item.active"))
    ).toBeNull();
  });

  it("should release projected item subscriptions when destroyed", () => {
    const item = hostFixture.debugElement.query(
      By.directive(GgcToolbarItemComponent)
    ).componentInstance as GgcToolbarItemComponent;
    const toolbarService = TestBed.inject(GgcToolbarService);
    const setActiveToolbarItemSpy = vi.spyOn(
      toolbarService,
      "setActiveToolbarItem"
    );

    hostFixture.destroy();
    item.handleClick();

    expect(setActiveToolbarItemSpy).not.toHaveBeenCalled();
  });
});
