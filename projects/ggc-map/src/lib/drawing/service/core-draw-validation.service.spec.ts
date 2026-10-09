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
    vi.spyOn(service["validators"], "set");
    service.addValidators("TESTMAP", "draw", new Feature<Geometry>(), []);
    expect(service["validators"].set).not.toHaveBeenCalled();
  });

  it("should clean up the validators", () => {
    const mapIndex = "TESTMAP";
    const drawValidator = new DrawValidator(new Feature<Geometry>(), []);
    service["validators"].set(mapIndex, new Map([["draw", [drawValidator]]]));
    vi.spyOn(drawValidator, "finish");
    vi.spyOn(drawValidator, "destroy");
    service.checkAndRemoveValidators(mapIndex, "draw");
    expect(drawValidator.finish).toHaveBeenCalled();
    expect(drawValidator.destroy).toHaveBeenCalled();
  });

  it("should add the validators to the map", () => {
    service.addValidators("TESTMAP", "draw", new Feature<Geometry>(), [
      () => true
    ]);
    expect(service["validators"].has("TESTMAP")).toBe(true);
    expect(service["validators"].get("TESTMAP")?.has("draw")).toBe(true);
  });

  it("destroys validators without finishing and preserves other interaction owners", () => {
    const drawValidator = new DrawValidator(new Feature<Geometry>(), [
      () => true
    ]);
    const modifyValidator = new DrawValidator(new Feature<Geometry>(), [
      () => true
    ]);
    vi.spyOn(drawValidator, "finish");
    vi.spyOn(drawValidator, "destroy");
    vi.spyOn(modifyValidator, "destroy");
    service["validators"].set(
      "TESTMAP",
      new Map([
        ["draw", [drawValidator]],
        ["modify", [modifyValidator]]
      ])
    );

    service.destroyValidators("TESTMAP", "draw");

    expect(drawValidator.finish).not.toHaveBeenCalled();
    expect(drawValidator.destroy).toHaveBeenCalled();
    expect(modifyValidator.destroy).not.toHaveBeenCalled();
    expect(service["validators"].get("TESTMAP")?.has("modify")).toBe(true);
  });
});
