import { inject, TestBed } from "@angular/core/testing";

import { GgcDatasetTreeModelCreateService } from "./ggc-dataset-tree-model-create.service";
import { Theme } from "../model/theme/theme.model";
import { Dataset } from "../model/theme/dataset.model";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../model/theme/dataset-tree-webservice.model";

describe("DatasetTreeModelCreateService", () => {
  const myLayer: DatasetTreeLayer = {
    layerId: "id1"
  };
  const myNotActiveLayer: DatasetTreeLayer = {
    layerId: "id2"
  };
  const myService: DatasetTreeWebservice = {
    layers: [myLayer, myNotActiveLayer]
  };
  const myDataset = new Dataset(
    "myDataset",
    [myService],
    "https://verbeterdekaart.nl"
  );
  const themeCollection = new Theme("themeCollection", [myDataset], []);
  const myTheme = new Theme("myTheme", [myDataset], []);
  const themeWithThemeAndDataset = new Theme(
    "themeWithThemeAndDataset",
    [myDataset],
    [themeCollection]
  );
  const themeWithOnlyTheme = new Theme(
    "themeWithOnlyTheme",
    [],
    [themeCollection]
  );

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GgcDatasetTreeModelCreateService]
    });
  });

  it("should be created", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      expect(service).toBeTruthy();
    }
  ));

  it("serviceFactory should return a service", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const serviceFromFactory = service.serviceFactory(myService);

      expect(serviceFromFactory).toBeDefined();
      expect(serviceFromFactory.layers.length).toBe(2);
      expect(serviceFromFactory.layers[0]).toEqual(
        jasmine.objectContaining({
          layerId: "id1"
        })
      );
      expect(serviceFromFactory.layers[1]).toEqual(
        jasmine.objectContaining({
          layerId: "id2"
        })
      );
    }
  ));

  it("datasetFactory should return a dataset", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const datasetFromFactory = service.datasetFactory(myDataset);
      expect(datasetFromFactory).toBeDefined();
      expect(datasetFromFactory.datasetName).toBe("myDataset");
      expect(datasetFromFactory.services.length).toBe(1);
    }
  ));

  it("themeFactory should return a theme", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const themeFromFactory = service.themeFactory(myTheme);
      expect(themeFromFactory).toBeDefined();
      expect(themeFromFactory.themeName).toBe("myTheme");
      expect(themeFromFactory.datasets.length).toBe(1);
    }
  ));

  it("themeArrayFactory should return an array of themes", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const themeArrayFromFactory = service.themeArrayFactory([myTheme]);
      expect(themeArrayFromFactory).toBeDefined();
      expect(themeArrayFromFactory.length).toBe(1);
      expect(themeArrayFromFactory[0].themeName).toBe("myTheme");
      expect(themeArrayFromFactory[0].datasets.length).toBe(1);
    }
  ));

  it("themeFactory should be able to return a theme containing other themes aswell as datasets", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const themeWithThemesAndDatasetFromFactory = service.themeFactory(
        themeWithThemeAndDataset
      );
      expect(themeWithThemesAndDatasetFromFactory).toBeDefined();
      expect(themeWithThemesAndDatasetFromFactory.themeName).toBe(
        "themeWithThemeAndDataset"
      );
      expect(themeWithThemesAndDatasetFromFactory.themes.length).toBe(1);
      expect(themeWithThemesAndDatasetFromFactory.themes[0].themeName).toBe(
        "themeCollection"
      );
      expect(themeWithThemesAndDatasetFromFactory.themes[0].themeName).toBe(
        "themeCollection"
      );
      expect(
        themeWithThemesAndDatasetFromFactory.themes[0].datasets[0].datasetName
      ).toBe("myDataset");
    }
  ));

  it("themeFactory should be able to able to return a theme that doesn't contain any datasets but only other themes", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const themeWithOnlyThemeFromFactory =
        service.themeFactory(themeWithOnlyTheme);
      expect(themeWithOnlyThemeFromFactory).toBeDefined();
      expect(themeWithOnlyThemeFromFactory.themeName).toBe(
        "themeWithOnlyTheme"
      );
      expect(themeWithOnlyThemeFromFactory.datasets.length).toBe(0);
      expect(themeWithOnlyThemeFromFactory.datasets).toEqual([]);
      expect(themeWithOnlyThemeFromFactory.themes.length).toBe(1);
      expect(themeWithOnlyThemeFromFactory.themes[0].themeName).toBe(
        "themeCollection"
      );
    }
  ));

  it("layerFactory should return a new Layer which is equal to the original Layer", inject(
    [GgcDatasetTreeModelCreateService],
    (service: GgcDatasetTreeModelCreateService) => {
      const originalLayer = new DatasetTreeLayer("testId");
      const layerFromFactory = service.layerFactory(originalLayer);

      expect(layerFromFactory).not.toBe(originalLayer);
      expect(layerFromFactory).toEqual(originalLayer);
      // or test equality with jasmine.objectContaining
      expect(layerFromFactory).toEqual(
        jasmine.objectContaining({
          layerId: "testId"
        })
      );
    }
  ));
});
