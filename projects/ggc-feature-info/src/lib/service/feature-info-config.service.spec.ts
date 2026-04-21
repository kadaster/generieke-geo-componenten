import { TestBed } from "@angular/core/testing";

import { GgcFeatureInfoConfigService } from "./ggc-feature-info-config.service";
import { SortFilterConfig } from "../model/sort-filter-config.model";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import { CustomFeatureInfo } from "../model/custom-feature-info.model";
import { DatePipe, registerLocaleData } from "@angular/common";
import * as locales from "@angular/common/locales/nl";

let service: GgcFeatureInfoConfigService;

describe("FeatureInfoConfigService > ", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GgcFeatureInfoConfigService]
    });
    service = TestBed.inject(GgcFeatureInfoConfigService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("setSortFilterConfig should set sortFilterConfig", () => {
    const config = [new SortFilterConfig({ layerName: "naam1", tabIndex: 1 })];
    service.setConfig(config);

    expect(service["sortFilterConfigs"]).toBe(config);
  });

  describe("sortTabs", () => {
    it("sortTabs should sort the tabs according to tabIndex of sortFilterConfig", () => {
      const config = [
        new SortFilterConfig({ layerName: "third", tabIndex: 3 }),
        new SortFilterConfig({ layerName: "first", tabIndex: 1 }),
        new SortFilterConfig({ layerName: "second", tabIndex: 2 })
      ];
      const testData = [
        new FeatureInfoCollection("second", []),
        new FeatureInfoCollection("third", []),
        new FeatureInfoCollection("first", [])
      ];
      service.setConfig(config);

      service.sortTabs(testData);

      expect(testData[0].layerName).toBe("first");
      expect(testData[1].layerName).toBe("second");
      expect(testData[2].layerName).toBe("third");
    });

    it("sortTabs should only sort the tabs present in SortFilterConfig", () => {
      const config = [
        new SortFilterConfig({ layerName: "third", tabIndex: 3 }),
        new SortFilterConfig({ layerName: "first", tabIndex: 1 })
      ];
      const testData = [
        new FeatureInfoCollection("not first", []),
        new FeatureInfoCollection("third", []),
        new FeatureInfoCollection("last", []),
        new FeatureInfoCollection("first", [])
      ];
      service.setConfig(config);

      service.sortTabs(testData);

      expect(testData[0].layerName).toBe("first");
      expect(testData[1].layerName).toBe("third");
      expect(testData[2].layerName).toBe("not first");
      expect(testData[3].layerName).toBe("last");
    });

    it("sortTabs should not sort the tabs if no SortFilterConfig is set", () => {
      const testData = [
        new FeatureInfoCollection("three", []),
        new FeatureInfoCollection("two", []),
        new FeatureInfoCollection("one", [])
      ];

      service.sortTabs(testData);

      expect(testData[0].layerName).toBe("three");
      expect(testData[1].layerName).toBe("two");
      expect(testData[2].layerName).toBe("one");
    });

    it("custom sortFunction should be used when set for sorting tabs", () => {
      const testData = [
        new FeatureInfoCollection("z", []),
        new FeatureInfoCollection("a", []),
        new FeatureInfoCollection("c", []),
        new FeatureInfoCollection("j", [])
      ];
      service.setSortTabFunction(
        (a: FeatureInfoCollection, b: FeatureInfoCollection): number => {
          if (a.layerName < b.layerName) {
            return -1;
          }
          if (a.layerName > b.layerName) {
            return 1;
          }
          return 0;
        }
      );

      service.sortTabs(testData);

      expect(testData[0].layerName).toBe("a");
      expect(testData[1].layerName).toBe("c");
      expect(testData[2].layerName).toBe("j");
      expect(testData[3].layerName).toBe("z");
    });
  });

  describe("filterAndSortAttributes", () => {
    it("when config is not present for layerName, it should not filter and sort", () => {
      const testData = [
        { id: 1, a: "a", b: true },
        { id: 2, a: "a", b: false }
      ];

      const result = service.filterAndSortAttributes("Kaartlaag", testData);

      expect(result).toEqual(testData);
    });

    it("when config is present for layerName but only tabIndex is set, it should not filter and sort", () => {
      const config = [
        new SortFilterConfig({
          layerName: "Kaartlaag",
          tabIndex: 3
        })
      ];
      const testData = [
        { id: 1, a: "a", b: true },
        { id: 2, a: "a", b: false }
      ];
      service.setConfig(config);

      const result = service.filterAndSortAttributes("Kaartlaag", testData);

      expect(result).toEqual(testData);
    });

    it("and excludeAttributes is set, it should remove attributes", () => {
      const config = [
        new SortFilterConfig({
          layerName: "Kaartlaag",
          tabIndex: 3,
          hideUnorderedAttributes: false,
          excludeAttributes: ["b"]
        })
      ];
      const testData = [
        { id: 1, b: true, c: 3 },
        { id: 2, b: false, c: 4 }
      ];
      service.setConfig(config);

      const result: { [key: string]: any } = service.filterAndSortAttributes(
        "Kaartlaag",
        testData
      );

      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[0].b).toBeUndefined();
      expect(result[1].id).toBe(2);
      expect(result[1].b).toBeUndefined();
      expect(Object.keys(result[0])).toEqual(["id", "c"]);
      expect(Object.keys(result[1])).toEqual(["id", "c"]);
    });

    it("and attributeOrder is set, it return only these attributes in the specified order", () => {
      const config = [
        new SortFilterConfig({
          layerName: "Kaartlaag",
          tabIndex: 3,
          attributeOrder: ["toelichting", "b"]
        })
      ];
      const testData = [
        { id: 1, b: true, omschrijving: "eerste", toelichting: "tekst" },
        { id: 2, b: false, omschrijving: "tweede", toelichting: "test" }
      ];
      service.setConfig(config);

      const result = service.filterAndSortAttributes("Kaartlaag", testData);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({ toelichting: "tekst", b: true });
      expect(result[1]).toEqual({ toelichting: "test", b: false });
      expect(Object.keys(result[0])).toEqual(["toelichting", "b"]);
      expect(Object.keys(result[1])).toEqual(["toelichting", "b"]);
    });

    it("and attributeOrder is set and hideUnorderedAttributes is false, it return all attributes in the specified order", () => {
      const config = [
        new SortFilterConfig({
          layerName: "Kaartlaag",
          tabIndex: 3,
          attributeOrder: ["toelichting", "b"],
          hideUnorderedAttributes: false
        })
      ];
      const testData = [
        { id: 3, b: true, omschrijving: "eerste", toelichting: "tekst" },
        { id: 4, b: false, omschrijving: "tweede", toelichting: "test" }
      ];
      service.setConfig(config);

      const result = service.filterAndSortAttributes("Kaartlaag", testData);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        toelichting: "tekst",
        b: true,
        id: 3,
        omschrijving: "eerste"
      });
      expect(result[1]).toEqual({
        toelichting: "test",
        b: false,
        id: 4,
        omschrijving: "tweede"
      });
      expect(Object.keys(result[0])).toEqual([
        "toelichting",
        "b",
        "id",
        "omschrijving"
      ]);
      expect(Object.keys(result[1])).toEqual([
        "toelichting",
        "b",
        "id",
        "omschrijving"
      ]);
    });

    it(
      "and excludeAttributes and attributeOrder is set and hideUnorderedAttributes is false, " +
        "it return the not excluded attributes in the specified order",
      () => {
        const config = [
          new SortFilterConfig({
            layerName: "Kaartlaag",
            tabIndex: 3,
            attributeOrder: ["omschrijving", "b"],
            hideUnorderedAttributes: false,
            excludeAttributes: ["toelichting"]
          })
        ];
        const testData = [
          {
            id: 23,
            status: "nieuw",
            b: true,
            omschrijving: "eerste",
            toelichting: "tekst"
          },
          {
            id: 24,
            status: "oud",
            b: false,
            omschrijving: "tweede",
            toelichting: "test"
          }
        ];
        service.setConfig(config);

        const result = service.filterAndSortAttributes("Kaartlaag", testData);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({
          omschrijving: "eerste",
          b: true,
          id: 23,
          status: "nieuw"
        });
        expect(result[1]).toEqual({
          omschrijving: "tweede",
          b: false,
          id: 24,
          status: "oud"
        });
        expect(Object.keys(result[0])).toEqual([
          "omschrijving",
          "b",
          "id",
          "status"
        ]);
        expect(Object.keys(result[1])).toEqual([
          "omschrijving",
          "b",
          "id",
          "status"
        ]);
      }
    );

    it("when all attributes are excluded, it should return an array of empty objects", () => {
      const config = [
        new SortFilterConfig({
          layerName: "Kaartlaag",
          tabIndex: 3,
          attributeOrder: ["bestaat", "niet"],
          excludeAttributes: ["toelichting", "id", "status"]
        })
      ];
      const testData = [
        { id: 23, status: "nieuw", toelichting: "tekst" },
        { id: 24, status: "oud", toelichting: "test" }
      ];
      service.setConfig(config);

      const result = service.filterAndSortAttributes("Kaartlaag", testData);

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({});
      expect(result[1]).toEqual({});
      expect(Object.keys(result[0])).toEqual([]);
      expect(Object.keys(result[1])).toEqual([]);
    });

    it("when I replaceAttributeNames() is called and there is a substitute for the given key, it should return it", () => {
      const customAttributeNames = new Map<string, CustomFeatureInfo>();

      const idCustomName = new CustomFeatureInfo({
        customAttributeName: "nummer"
      });
      const toelichtingCustomName = new CustomFeatureInfo({
        customAttributeName: "omschrijving"
      });

      customAttributeNames.set("id", idCustomName);
      customAttributeNames.set("toelichting", toelichtingCustomName);

      const testData = [
        { id: 23, status: "nieuw", toelichting: "tekst" },
        { id: 24, status: "oud", toelichting: "test" }
      ];

      service.setCustomFeatureInfo(customAttributeNames);

      const result = service.filterAndSortAttributes(
        "nietBestaandeKaartlaag",
        testData
      );

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        nummer: 23,
        status: "nieuw",
        omschrijving: "tekst"
      });
      expect(result[1]).toEqual({
        nummer: 24,
        status: "oud",
        omschrijving: "test"
      });
    });

    it("when replaceAttributeNames() is called and there is NO substiute for the given key, it should return the given key", () => {
      const customAttributeNames = new Map<string, CustomFeatureInfo>();

      const identificatieCustomName = new CustomFeatureInfo({
        customAttributeName: "nummer"
      });
      const beschrijvingCustomName = new CustomFeatureInfo({
        customAttributeName: "omschrijving"
      });

      customAttributeNames.set("identificatie", identificatieCustomName);
      customAttributeNames.set("beschrijving", beschrijvingCustomName);

      const testData = [
        { id: 23, status: "nieuw", toelichting: "tekst" },
        { id: 24, status: "oud", toelichting: "test" }
      ];

      service.setCustomFeatureInfo(customAttributeNames);

      const result = service.filterAndSortAttributes(
        "nietBestaandeKaartlaag",
        testData
      );

      expect(result.length).toBe(2);
      expect(result[0]).toEqual({
        id: 23,
        status: "nieuw",
        toelichting: "tekst"
      });
      expect(result[1]).toEqual({ id: 24, status: "oud", toelichting: "test" });
    });

    it(
      "and excludeAttributes and attributeOrder is set, hideUnorderedAttributes is false and there are replacing customAttributes " +
        "it return the not excluded attributes in the specified order with the subtitute attribute names",
      () => {
        const config = [
          new SortFilterConfig({
            layerName: "Kaartlaag",
            tabIndex: 3,
            attributeOrder: ["omschrijving", "b"],
            hideUnorderedAttributes: false,
            excludeAttributes: ["toelichting"]
          })
        ];
        const testData = [
          {
            id: 23,
            status: "nieuw",
            b: true,
            omschrijving: "eerste",
            toelichting: "tekst"
          },
          {
            id: 24,
            status: "oud",
            b: false,
            omschrijving: "tweede",
            toelichting: "test"
          }
        ];

        const customAttributeNames = new Map<string, CustomFeatureInfo>();

        const idCustomName = new CustomFeatureInfo({
          customAttributeName: "identificatie"
        });
        const omschrijvingCustomName = new CustomFeatureInfo({
          customAttributeName: "beschrijving"
        });

        customAttributeNames.set("id", idCustomName);
        customAttributeNames.set("omschrijving", omschrijvingCustomName);

        service.setConfig(config);
        service.setCustomFeatureInfo(customAttributeNames);

        const result = service.filterAndSortAttributes("Kaartlaag", testData);

        expect(result.length).toBe(2);
        expect(result[0]).toEqual({
          beschrijving: "eerste",
          b: true,
          identificatie: 23,
          status: "nieuw"
        });
        expect(result[1]).toEqual({
          beschrijving: "tweede",
          b: false,
          identificatie: 24,
          status: "oud"
        });
        expect(Object.keys(result[0])).toEqual([
          "beschrijving",
          "b",
          "identificatie",
          "status"
        ]);
        expect(Object.keys(result[1])).toEqual([
          "beschrijving",
          "b",
          "identificatie",
          "status"
        ]);
      }
    );

    it(
      "when there are no CustomFeatureInfoModel objects and checkForCustomValue() is called," +
        " it should return the currentFeature it is called with",
      () => {
        const currentFeature: { [key: string]: any } = {
          test: "waarde",
          locatie: [123, 456]
        };
        const objectKeys = ["test", "locatie"];

        const displayFeature = service.checkForCustomValues(
          currentFeature,
          objectKeys
        );

        expect(currentFeature).toBe(displayFeature);
      }
    );

    it(
      "when checkForCustomValue() is called and there is a CustomFeatureInfoModel object containing a customAttributeFunction, but " +
        "not a customAttributeName it should return a displayFeature with a changed value based on the function given",
      () => {
        const customFeatureInfoMap = new Map<string, CustomFeatureInfo>();

        const tijdstipRegistratieCustomFeatureInfo = new CustomFeatureInfo({
          customAttributeValueFunction: changeTijdstipRegistratie
        });
        customFeatureInfoMap.set(
          "tijdstipregistratie",
          tijdstipRegistratieCustomFeatureInfo
        );

        service.setCustomFeatureInfo(customFeatureInfoMap);

        const currentFeature: { [key: string]: any } = {
          tijdstipregistratie: "2018-05-17T11:25:30.306",
          locatie: [123, 456]
        };
        const objectKeys = ["tijdstipregistratie", "locatie"];

        const displayFeature = service.checkForCustomValues(
          currentFeature,
          objectKeys
        );

        expect(displayFeature.tijdstipregistratie).toEqual(
          "mei 17, 2018, 11:25:30 a.m."
        );
        expect(displayFeature.locatie).toEqual([123, 456]);
      }
    );

    it(
      "when checkForCustomValue() is called and there is a CustomFeatureInfoModel object containing a customAttributeFunction, and " +
        "a customAttributeName it should return a displayFeature with a changed value based on the function given",
      () => {
        const customFeatureInfoMap = new Map<string, CustomFeatureInfo>();

        const bronhoudercodeFeatureInfo = new CustomFeatureInfo({
          customAttributeName: "bronhoudernummer",
          customAttributeValueFunction: changeBronhoudercodeValue
        });
        customFeatureInfoMap.set("bronhoudercode", bronhoudercodeFeatureInfo);
        service.setCustomFeatureInfo(customFeatureInfoMap);

        const currentFeature: { [key: string]: any } = {
          bronhoudernummer: 603,
          status: "Nieuw"
        };
        const objectKeys = ["bronhoudernummer", "status"];

        const displayFeature = service.checkForCustomValues(
          currentFeature,
          objectKeys
        );

        expect(displayFeature.bronhoudernummer).toEqual({
          bronhoudercode: 613
        });
        expect(displayFeature.status).toEqual("Nieuw");
      }
    );

    it(
      "when something goes wrong transforming the value in customAttributeValueFunction an error will be thrown" +
        " and the old value will be displayed",
      () => {
        const replaceValueMethod = "replaceValue";
        const consoleWarnSpy = spyOn(console, "warn");

        const date: string = new Date(2020, 1, 3, 12, 1, 10).toDateString();
        const currentFeature = {
          meldingsnummer: "123",
          tijdstipregistratie: date
        };
        const displayFeature: { [key: string]: any } = {
          meldingsnummer: "123"
        };

        service[replaceValueMethod](
          "tijdstipregistratie",
          functionThatCausesAnError,
          currentFeature,
          displayFeature
        );

        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(displayFeature.tijdstipregistratie).toBe(date);
      }
    );
  });
});

function changeTijdstipRegistratie(date: number | string): string {
  registerLocaleData(locales.default, "nl");
  const datePipe = new DatePipe("nl");
  return datePipe.transform(date, "MMMM d, y, h:mm:ss a") as string;
}

function changeBronhoudercodeValue(bronhoudercode: number | string): object {
  const n =
    typeof bronhoudercode === "number"
      ? bronhoudercode
      : Number.parseInt(bronhoudercode, 10);
  return { bronhoudercode: n + 10 };
}

function functionThatCausesAnError(dateObj: string): string {
  // Een verkeerde locale zal zorgen voor een error.
  const datePipe = new DatePipe("xy");
  return datePipe.transform(dateObj, "YYYY/MM//DD") as string;
}
