import { TestBed } from "@angular/core/testing";
import {
  DatasetTreeEvent,
  DatasetTreeEventType
} from "../model/dataset-tree-event.model";
import { GgcDatasetTreeModelCreateService } from "./ggc-dataset-tree-model-create.service";

import { CoreDatasetTreeService } from "./core-dataset-tree.service";
import {
  DatasetTreeLayer,
  DatasetTreeWebservice
} from "../model/theme/dataset-tree-webservice.model";
import { Dataset } from "../model/theme/dataset.model";
import { DatasetTreeMapConnectService } from "../dataset-tree/service/dataset-tree-map-connect.service";
import { Theme } from "../model/theme/theme.model";
import { ViewerType } from "@kadaster/ggc-models";

describe("DatasetTreeService", () => {
  let service: CoreDatasetTreeService;
  let datasetTreeMapConnectServiceSpy: jasmine.SpyObj<DatasetTreeMapConnectService>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreDatasetTreeService, GgcDatasetTreeModelCreateService]
    });
    datasetTreeMapConnectServiceSpy =
      jasmine.createSpyObj<DatasetTreeMapConnectService>(
        "DatasetTreeMapConnectService",
        ["isVisible"]
      );

    TestBed.configureTestingModule({
      providers: [
        CoreDatasetTreeService,
        GgcDatasetTreeModelCreateService,
        {
          provide: DatasetTreeMapConnectService,
          useValue: datasetTreeMapConnectServiceSpy
        }
      ]
    });

    service = TestBed.inject(CoreDatasetTreeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("emitDatasetTreeEvent", () => {
    [
      {
        updatedVisibility: true,
        expectedType: DatasetTreeEventType.LAYER_ACTIVATED
      },
      {
        updatedVisibility: false,
        expectedType: DatasetTreeEventType.LAYER_DEACTIVATED
      }
    ].forEach(({ updatedVisibility, expectedType }) => {
      it("with layer added", (done) => {
        service
          .getEventsObservable()
          .subscribe((datasetTreeEvent: DatasetTreeEvent) => {
            expect(datasetTreeEvent.type).toBe(expectedType);
            expect(datasetTreeEvent.layerId).toBe("testId");
            expect(datasetTreeEvent.mapIndex).toBe("mapIndex");
            done();
          });
        service.emitDatasetTreeEvent("testId", "mapIndex", updatedVisibility);
      });
    });
  });

  describe("countLayersDataset", () => {
    const service1 = new DatasetTreeWebservice([
      new DatasetTreeLayer("id1"),
      new DatasetTreeLayer("id2")
    ]);
    const service2 = new DatasetTreeWebservice([new DatasetTreeLayer("id3")]);
    const service3inactive = new DatasetTreeWebservice([
      new DatasetTreeLayer("id4")
    ]);
    const dataset = new Dataset("name", [service1, service2], "infourl");
    const datasetInactive = new Dataset(
      "nameInactive",
      [service3inactive],
      "infourl"
    );

    const theme = new Theme("themeName", [dataset, datasetInactive]);

    it("should count all active layers of a dataset", async () => {
      datasetTreeMapConnectServiceSpy.isVisible.and.callFake((layerId) => {
        if (layerId == "id1") return Promise.resolve(true);
        if (layerId == "id2") return Promise.resolve(false);
        if (layerId == "id3") return Promise.resolve(true);
        return Promise.resolve(false);
      });
      expect(
        await service.countActiveLayersOfDataset(
          dataset,
          "mapIndex",
          ViewerType.TWEE_D
        )
      ).toBe(2);
      expect(service.countAllLayersOfDataset(dataset)).toBe(3);
    });

    it("should count all active layers of a dataset", async () => {
      datasetTreeMapConnectServiceSpy.isVisible.and.callFake((layerId) => {
        if (layerId == "id1") return Promise.resolve(true);
        if (layerId == "id2") return Promise.resolve(false);
        if (layerId == "id3") return Promise.resolve(true);
        if (layerId == "id4") return Promise.resolve(false);
        return Promise.resolve(false);
      });
      expect(
        await service.countActiveDatasetsOfTheme(
          theme,
          "mapIndex",
          ViewerType.TWEE_D
        )
      ).toBe(1);
      expect(service.countAllDatasetsOfTheme(theme)).toBe(2);
    });
  });
});
