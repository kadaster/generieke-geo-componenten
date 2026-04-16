import { TestBed } from "@angular/core/testing";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { DrawValidator } from "../draw-validator";

import { CoreDrawValidationService } from "./core-draw-validation.service";

describe("CoreDrawValidationService", () => {
  let service: CoreDrawValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreDrawValidationService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should not create drawValidators if the validatorFunctions array is empty", () => {
    spyOn(service["validators"], "set");
    service.addValidators("TESTMAP", new Feature<Geometry>(), []);
    expect(service["validators"].set).not.toHaveBeenCalled();
  });

  it("should clean up the validators", () => {
    const mapIndex = "TESTMAP";
    const drawValidator = new DrawValidator(new Feature<Geometry>(), []);
    service["validators"].set(mapIndex, [drawValidator]);
    spyOn(drawValidator, "finish");
    spyOn(drawValidator, "destroy");
    service.checkAndRemoveValidators(mapIndex);
    expect(drawValidator.finish).toHaveBeenCalled();
    expect(drawValidator.destroy).toHaveBeenCalled();
  });

  it("should add the validators to the map", () => {
    spyOn(service["validators"], "set").and.callThrough();
    service.addValidators("TESTMAP", new Feature<Geometry>(), [() => true]);
    expect(service["validators"].set).toHaveBeenCalled();
    expect(service["validators"].has("TESTMAP")).toBeTrue();
  });
});
