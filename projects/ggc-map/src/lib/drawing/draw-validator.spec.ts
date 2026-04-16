import { Feature } from "ol";
import { EventsKey } from "ol/events";
import { FeatureOnSignature } from "ol/Feature";
import { Geometry } from "ol/geom";
import Style from "ol/style/Style";
import { DrawValidator } from "./draw-validator";

describe("drawValidator", () => {
  let drawValidator: DrawValidator;

  const feature = new Feature<Geometry>();

  type Callback = () => any;

  it("should set the change listener", () => {
    spyOn(feature, "on").and.callThrough();
    drawValidator = new DrawValidator(feature, []);
    expect(feature.on).toHaveBeenCalled();
  });

  describe("callback test", () => {
    let callback: Callback;
    beforeEach(() => {
      const fakeOnChange = (type: "change", listener: Callback): EventsKey => {
        if (type === "change") {
          callback = listener;
        }
        return { target: feature, type, listener };
      };
      spyOn(feature, "on").and.callFake(
        fakeOnChange as FeatureOnSignature<EventsKey>
      );
    });
    it("should call the validation function", () => {
      const spy = jasmine.createSpy();
      drawValidator = new DrawValidator(feature, [spy]);
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(spy).toHaveBeenCalledWith(feature);
    });

    it("should call the validation function once", () => {
      const spy = jasmine.createSpy();
      drawValidator = new DrawValidator(feature, [spy]);
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(drawValidator["ignoreNextChange"]).toEqual(true);
      callback();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should stop validating if a validator fails", () => {
      const spy1 = jasmine.createSpy();
      const spy2 = jasmine.createSpy();
      spy1.and.returnValue(false);
      drawValidator = new DrawValidator(feature, [spy1, spy2]);
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(0);
    });

    it("reset the style if the validator succeeds", () => {
      const spy1 = jasmine.createSpy();
      spy1.and.returnValue(true);
      spyOn(feature, "setStyle");
      drawValidator = new DrawValidator(feature, [spy1]);
      drawValidator["wasValid"] = false;
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(feature.setStyle).toHaveBeenCalledWith(undefined);
    });
  });

  it("should validate and set the finishStyle", () => {
    const invalidFinishDrawStyle = () => new Style();
    drawValidator = new DrawValidator(feature, [() => false]);
    drawValidator.styleMap = { invalidFinishDrawStyle };
    spyOn(feature, "setStyle");

    drawValidator.finish();
    expect(feature.setStyle).toHaveBeenCalledWith(invalidFinishDrawStyle);
  });

  afterEach(() => {
    if (drawValidator) {
      drawValidator.destroy();
    }
  });
});
