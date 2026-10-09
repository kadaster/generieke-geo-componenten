import { Service } from "@angular/core";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { StyleLikeMap } from "../../model/draw-interaction-event.model";
import { ValidationFunction } from "../../model/draw-options";
import { DrawValidator } from "../draw-validator";

export type DrawValidatorOwner = "draw" | "modify" | "move";

@Service()
export class CoreDrawValidationService {
  private validators = new Map<
    string,
    Map<DrawValidatorOwner, DrawValidator[]>
  >();

  addValidators(
    mapIndex: string,
    owner: DrawValidatorOwner,
    feature: Feature<Geometry>,
    validatorFunctions: ValidationFunction[],
    styles?: StyleLikeMap
  ): void {
    if (validatorFunctions.length > 0) {
      const drawValidator = new DrawValidator(feature, validatorFunctions);
      const validatorsByOwner =
        this.validators.get(mapIndex) ??
        new Map<DrawValidatorOwner, DrawValidator[]>();
      const validators = validatorsByOwner.get(owner) ?? [];

      drawValidator.styleMap = styles;
      validators.push(drawValidator);
      validatorsByOwner.set(owner, validators);
      this.validators.set(mapIndex, validatorsByOwner);
    }
  }

  checkAndRemoveValidators(
    mapIndex: string,
    owner: DrawValidatorOwner
  ): boolean {
    let isValid = true;
    const validators = this.takeValidators(mapIndex, owner);
    validators.forEach((drawValidator) => {
      isValid = isValid && drawValidator.finish();
      drawValidator.destroy();
    });
    return isValid;
  }

  destroyValidators(mapIndex: string, owner: DrawValidatorOwner): void {
    this.takeValidators(mapIndex, owner).forEach((drawValidator) =>
      drawValidator.destroy()
    );
  }

  private takeValidators(
    mapIndex: string,
    owner: DrawValidatorOwner
  ): DrawValidator[] {
    const validatorsByOwner = this.validators.get(mapIndex);
    const validators = validatorsByOwner?.get(owner) ?? [];
    validatorsByOwner?.delete(owner);
    if (validatorsByOwner?.size === 0) {
      this.validators.delete(mapIndex);
    }
    return validators;
  }
}
