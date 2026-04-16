import { SnapEvent } from "ol/events/SnapEvent";

export class SnapExtendedEvent {
  action: "snap" | "unsnap";
  snappedTo: "vertex" | "line" | undefined;
  snapEvent: SnapEvent;
}

export function createSnapExtendedEvent(
  snapEvent: SnapEvent
): SnapExtendedEvent {
  const snapExtendedEvent = new SnapExtendedEvent();
  snapExtendedEvent.action = "snap";
  snapExtendedEvent.snappedTo = snapEvent.segment ? "line" : "vertex";
  snapExtendedEvent.snapEvent = snapEvent;
  return snapExtendedEvent;
}

export function createUnsnapExtendedEvent(
  snapEvent: SnapEvent
): SnapExtendedEvent {
  const snapExtendedEvent = new SnapExtendedEvent();
  snapExtendedEvent.action = "unsnap";
  snapExtendedEvent.snapEvent = snapEvent;
  return snapExtendedEvent;
}
