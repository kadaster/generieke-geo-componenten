import { GgcToolbarItemComponent } from "./ggc-toolbar-item.component";
import { ToolbarItemComponentEvent } from "../../event/toolbar-item-event";

describe("ToolbarButtonComponent, no testbed", () => {
  let event: ToolbarItemComponentEvent;
  let component: GgcToolbarItemComponent;

  beforeEach(() => {
    component = new GgcToolbarItemComponent();
    component.activeChanged.subscribe(
      (toolbarItemComponentEvent: ToolbarItemComponentEvent) => {
        event = toolbarItemComponentEvent;
      }
    );
  });

  it("when handleClick() method should change active value and throw ToolbarItemComponentEvent", () => {
    component.handleClick();

    expect(component["_active"]).toBeTruthy();
    expect(event.active).toBeTruthy();
    expect(event.toolbarItemComponent).toBe(component);
  });
});
