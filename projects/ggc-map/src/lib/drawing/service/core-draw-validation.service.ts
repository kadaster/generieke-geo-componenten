import { Service } from "@angular/core";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { StyleLikeMap } from "../../model/draw-interaction-event.model";
import { ValidationFunction } from "../../model/draw-options";
import { DrawValidator } from "../draw-validator";

export type DrawValidatorInteractionType = "draw" | "modify" | "move";

@Service()
export class CoreDrawValidationService {
  private validators = new Map<
    string,
    Map<DrawValidatorInteractionType, DrawValidator[]>
  >();

  addValidators(
    mapIndex: string,
    interactionType: DrawValidatorInteractionType,
    feature: Feature<Geometry>,
    validatorFunctions: ValidationFunction[],
    styles?: StyleLikeMap
  ): void {
    if (validatorFunctions.length > 0) {
      const drawValidator = new DrawValidator(feature, validatorFunctions);
      const validatorsByInteractionType =
        this.validators.get(mapIndex) ??
        new Map<DrawValidatorInteractionType, DrawValidator[]>();
      const validators = validatorsByInteractionType.get(interactionType) ?? [];

      drawValidator.styleMap = styles;
      validators.push(drawValidator);
      validatorsByInteractionType.set(interactionType, validators);
      this.validators.set(mapIndex, validatorsByInteractionType);
    }
  }

  checkAndRemoveValidators(
    mapIndex: string,
    interactionType: DrawValidatorInteractionType
  ): boolean {
    let isValid = true;
    const validators = this.takeValidators(mapIndex, interactionType);
    validators.forEach((drawValidator) => {
      isValid = isValid && drawValidator.finish();
      drawValidator.destroy();
    });
    return isValid;
  }

  destroyValidators(
    mapIndex: string,
    interactionType: DrawValidatorInteractionType
  ): void {
    this.takeValidators(mapIndex, interactionType).forEach((drawValidator) =>
      drawValidator.destroy()
    );
  }

  private takeValidators(
    mapIndex: string,
    interactionType: DrawValidatorInteractionType
  ): DrawValidator[] {
    const validatorsByInteractionType = this.validators.get(mapIndex);
    const validators = validatorsByInteractionType?.get(interactionType) ?? [];
    validatorsByInteractionType?.delete(interactionType);
    if (validatorsByInteractionType?.size === 0) {
      this.validators.delete(mapIndex);
    }
    return validators;
  }
}
