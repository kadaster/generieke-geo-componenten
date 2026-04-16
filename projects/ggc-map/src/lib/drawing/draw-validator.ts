import { Feature } from "ol";
import { EventsKey } from "ol/events";
import { Geometry } from "ol/geom";
import { unByKey } from "ol/Observable";
import { StyleLikeMap } from "../model/draw-interaction-event.model";
import { ValidationFunction } from "../model/draw-options";

export class DrawValidator {
  private readonly eventsKey: EventsKey;
  private ignoreNextChange = false;
  private wasValid = true;
  private _styleMap: StyleLikeMap | undefined;
  private validators: ValidationFunction[];

  constructor(
    private feature: Feature<Geometry>,
    validationFunctions: ValidationFunction[]
  ) {
    this.eventsKey = this.feature.on("change", this.onDrawChange.bind(this));
    this.validators = validationFunctions;
  }

  destroy(): void {
    // Remove any references
    this._styleMap = undefined;
    this.validators = [];
    unByKey(this.eventsKey);
  }

  finish(): boolean {
    if (!this.validate(this.feature)) {
      this.feature.setStyle(this._styleMap?.invalidFinishDrawStyle);
      return false;
    }
    return true;
  }

  validate(feature: Feature<Geometry>): boolean {
    // Make a copy with slice because the splice method wil alter the original array
    return this.validators
      .slice(0)
      .reduce<boolean>((_prev, validator, _idx, validators): boolean => {
        if (!validator(feature)) {
          // Stop further validation by emptying the array
          validators.splice(0, validators.length);
          return false;
        }
        return true;
      }, true);
  }

  private onDrawChange(): void {
    if (this.ignoreNextChange) {
      this.ignoreNextChange = false;
      return;
    }
    const isValid = this.validate(this.feature);
    if (isValid !== this.wasValid) {
      // Ignore next change event to prevent event recursion
      this.ignoreNextChange = true;
      if (isValid) {
        this.feature.setStyle(this._styleMap?.drawingDrawStyle);
      } else if (this._styleMap?.invalidDrawStyle) {
        this.feature.setStyle(this._styleMap?.invalidDrawStyle);
      }
      this.wasValid = isValid;
    }
  }

  set styleMap(styleMap: StyleLikeMap | undefined) {
    this._styleMap = styleMap;
  }
}
