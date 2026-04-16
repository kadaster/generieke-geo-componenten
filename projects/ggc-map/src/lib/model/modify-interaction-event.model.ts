import { ModifyEvent } from "ol/interaction/Modify";

export enum ModifyInteractionEventTypes {
  MODIFYEND = "modifyend",
  MOVEEND = "moveend"
}

export class ModifyInteractionEvent {
  constructor(
    public type: ModifyInteractionEventTypes,
    public mapIndex: string,
    public message: string,
    public event: ModifyEvent,
    public valid = true
  ) {}
}
