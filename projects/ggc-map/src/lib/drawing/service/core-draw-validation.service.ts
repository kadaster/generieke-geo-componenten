import { Injectable } from "@angular/core";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { StyleLikeMap } from "../../model/draw-interaction-event.model";
import { ValidationFunction } from "../../model/draw-options";
import { DrawValidator } from "../draw-validator";

@Injectable({
  providedIn: "root"
})
export class CoreDrawValidationService {
  private validators: Map<string, DrawValidator[]> = new Map<
    string,
    DrawValidator[]
  >();

  addValidators(
    mapIndex: string,
    feature: Feature<Geometry>,
    validatorFunctions: ValidationFunction[],
    styles?: StyleLikeMap
  ): void {
    if (validatorFunctions.length > 0) {
      const drawValidator = new DrawValidator(feature, validatorFunctions);
      const validators: DrawValidator[] = this.validators.get(mapIndex) || [];

      drawValidator.styleMap = styles;
      validators.push(drawValidator);
      this.validators.set(mapIndex, validators);
    }
  }

  checkAndRemoveValidators(mapIndex: string): boolean {
    let isValid = true;
    const validators: DrawValidator[] = this.validators.get(mapIndex) || [];
    validators.forEach((drawValidator) => {
      isValid = isValid && drawValidator.finish();
      drawValidator.destroy();
    });
    this.validators.delete(mapIndex);
    return isValid;
  }
}
