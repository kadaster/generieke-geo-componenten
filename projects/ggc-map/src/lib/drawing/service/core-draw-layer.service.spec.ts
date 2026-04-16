import { TestBed } from "@angular/core/testing";
import { CoreMapService } from "../../map/service/core-map.service";
import { CoreDrawLayerService } from "./core-draw-layer.service";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";

describe("CoreDrawLayerService", () => {
  const mapIndex = "TEST_MAP";
  const layerName = "TestLayer";
  let service: CoreDrawLayerService;
  let coreMapService: CoreMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreDrawLayerService);
    coreMapService = TestBed.inject(CoreMapService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("get layer", () => {
    it("getDrawLayer should return layer for mapIndex", () => {
      const layer = createVectorLayer();
      service["drawLayers"].set(`${mapIndex}-${layerName}`, layer);

      const result = service.getDrawLayer(layerName, mapIndex);
      expect(result).toBe(layer);
    });
  });

  function createVectorLayer(): VectorLayer<VectorSource<Feature<Geometry>>> {
    return new VectorLayer({
      source: new VectorSource()
    });
  }
});
