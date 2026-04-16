import { Subject } from "rxjs";
import { ObservableMapWrapper } from "./ObservableMapWrapper";

describe("ObservableMapWrapper", () => {
  it("should return the size", () => {
    const map = new ObservableMapWrapper<string, string>(() => new Subject());
    expect(map.size).toEqual(0);

    map.getOrCreateSubject("test").next("boink");
    expect(map.size).toEqual(1);
  });

  describe("has", () => {
    it("should return false if the map has not been set", () => {
      const map = new ObservableMapWrapper<string, string>(() => new Subject());
      expect(map.has("non-existant")).toBeFalse();
    });

    it("should return true if the map has not been set", () => {
      const map = new ObservableMapWrapper<string, string>(() => new Subject());
      map.getOrCreate("item");
      expect(map.has("item")).toBeTrue();
    });
  });

  describe("delete", () => {
    it("should delete the item", () => {
      const map = new ObservableMapWrapper<string, string>(() => new Subject());
      map.getOrCreate("item");
      expect(map.has("item")).toBeTrue();
      map.delete("item");
      expect(map.has("item")).toBeFalse();
    });
  });

  describe("get", () => {
    it("should return undefined if the map has not been set", () => {
      const map = new ObservableMapWrapper<string, string>(() => new Subject());
      const result = map.get("item");
      expect(result).toBeUndefined();
    });

    it("should return the item if the map has been set", () => {
      const map = new ObservableMapWrapper<string, string>(() => new Subject());
      map.getOrCreate("item");
      const result = map.get("item");
      expect(result).not.toBeUndefined();
    });

    it("should create the map and return the subject", () => {
      let created = false;
      const map = new ObservableMapWrapper<string, string>(() => {
        created = true;
        return new Subject();
      });
      const result = map.getOrCreateSubject("item");

      expect(result instanceof Subject).toBeTrue();
      expect(created).toBeTrue();
    });

    it("should create the map and return the observable", () => {
      let created = false;
      const map = new ObservableMapWrapper<string, string>(() => {
        created = true;
        return new Subject();
      });
      map.getOrCreateObservable("item");

      expect(created).toBeTrue();
    });
  });
});
