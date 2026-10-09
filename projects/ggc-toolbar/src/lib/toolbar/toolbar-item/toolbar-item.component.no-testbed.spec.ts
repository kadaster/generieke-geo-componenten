import { Component } from "@angular/core";
import { GgcToolbarItemComponent } from "./ggc-toolbar-item.component";
import { ToolbarItemComponentEvent } from "../../event/toolbar-item-event";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

@Component({
  imports: [GgcToolbarItemComponent],
  template: `<ggc-toolbar-item (activeChanged)="capture($event)" />`
})
class ToolbarItemTestHostComponent {
  event?: ToolbarItemComponentEvent;

  capture(event: ToolbarItemComponentEvent): void {
    this.event = event;
  }
}

describe("ToolbarButtonComponent, no testbed", () => {
  let fixture: ComponentFixture<ToolbarItemTestHostComponent>;
  let hostComponent: ToolbarItemTestHostComponent;
  let component: GgcToolbarItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ToolbarItemTestHostComponent] });
    fixture = TestBed.createComponent(ToolbarItemTestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    component = fixture.debugElement.query(
      By.directive(GgcToolbarItemComponent)
    ).componentInstance;
  });

  it("when handleClick() method should change active value and throw ToolbarItemComponentEvent", () => {
    component.handleClick();
    fixture.detectChanges();

    expect(component["_active"]()).toBeTruthy();
    expect(hostComponent.event?.active).toBeTruthy();
    expect(hostComponent.event?.toolbarItemComponent).toBe(component);
  });
});
