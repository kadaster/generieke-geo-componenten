import { GgcToolbarItemComponent } from "./ggc-toolbar-item.component";
import { ToolbarItemComponentEvent } from "../../event/toolbar-item-event";
import { TestBed } from "@angular/core/testing";

describe("ToolbarButtonComponent, no testbed", () => {
  let event: ToolbarItemComponentEvent;
  let component: GgcToolbarItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [GgcToolbarItemComponent] });
    component = TestBed.runInInjectionContext(
      () => new GgcToolbarItemComponent()
    );
    component.activeChanged.subscribe(
      (toolbarItemComponentEvent: ToolbarItemComponentEvent) => {
        event = toolbarItemComponentEvent;
      }
    );
  });

  it("when handleClick() method should change active value and throw ToolbarItemComponentEvent", () => {
    component.handleClick();

    expect(component["_active"]()).toBeTruthy();
    expect(event.active).toBeTruthy();
    expect(event.toolbarItemComponent).toBe(component);
  });
});
