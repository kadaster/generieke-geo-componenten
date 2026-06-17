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
    vi.spyOn(feature, "on");
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
      vi.spyOn(feature, "on").mockImplementation(
        fakeOnChange as FeatureOnSignature<EventsKey>
      );
    });
    it("should call the validation function", () => {
      const spy = vi.fn();
      drawValidator = new DrawValidator(feature, [spy]);
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(spy).toHaveBeenCalledWith(feature);
    });

    it("should call the validation function once", () => {
      const spy = vi.fn();
      drawValidator = new DrawValidator(feature, [spy]);
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(drawValidator["ignoreNextChange"]).toEqual(true);
      callback();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("should stop validating if a validator fails", () => {
      const spy1 = vi.fn();
      const spy2 = vi.fn();
      spy1.mockReturnValue(false);
      drawValidator = new DrawValidator(feature, [spy1, spy2]);
      expect(feature.on).toHaveBeenCalled();
      callback();
      expect(spy1).toHaveBeenCalledTimes(1);
      expect(spy2).toHaveBeenCalledTimes(0);
    });

    it("reset the style if the validator succeeds", () => {
      const spy1 = vi.fn();
      spy1.mockReturnValue(true);
      vi.spyOn(feature, "setStyle");
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
    vi.spyOn(feature, "setStyle");

    drawValidator.finish();
    expect(feature.setStyle).toHaveBeenCalledWith(invalidFinishDrawStyle);
  });

  afterEach(() => {
    if (drawValidator) {
      drawValidator.destroy();
    }
  });
});
