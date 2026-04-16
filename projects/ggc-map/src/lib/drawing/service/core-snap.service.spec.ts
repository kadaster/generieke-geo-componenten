import { TestBed } from "@angular/core/testing";
import OlMap from "ol/Map";
import { Snap } from "ol/interaction";
import Feature from "ol/Feature";
import { CoreSnapService } from "./core-snap.service";
import { CoreMapService } from "../../map/service/core-map.service";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Geometry } from "ol/geom";
import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;

describe("CoreSnapService", () => {
  let service: CoreSnapService;
  let mapService: CoreMapService;

  const mapIndex = "testMap";

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoreSnapService);
    mapService = TestBed.inject(CoreMapService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should activate snapInteractions when called", () => {
    const getVectorSourceFromLayerSpy = spyOn<any>(
      mapService,
      "createLayerAndAddToMap"
    ).and.callFake(createVectorLayer);

    const getMapMock = {
      addInteraction: (_: Snap) => {},
      on: (_: any) => {}
    };

    const layerName = "drawLayer";
    const getMapSpy = spyOn(mapService, "getMap").and.returnValue(
      getMapMock as unknown as OlMap
    );
    const addInteractionSpy = spyOn(getMapMock, "addInteraction");

    service.startSnap(layerName, mapIndex, { pixelTolerance: 30 });

    expect(service["snapInteractions"].size).toBe(1);
    expect(getVectorSourceFromLayerSpy).toHaveBeenCalled();
    expect(getMapSpy).toHaveBeenCalled();
    expect(addInteractionSpy).toHaveBeenCalledWith(any(Snap));
  });

  it("should call initialize snap and addToSnapFeatures on start Snap only for drawLayer", () => {
    const snapOptions = {};
    const drawLayer = "layer3";

    spyOn(service, "initializeSnap");
    spyOn(service, "addToSnapFeatures");
    service.startSnap(drawLayer, mapIndex, snapOptions);
    expect(service.initializeSnap).toHaveBeenCalledTimes(1);
    expect(service.initializeSnap).toHaveBeenCalledWith("layer3", mapIndex);
    expect(service.addToSnapFeatures).toHaveBeenCalledTimes(1);
    expect(service.addToSnapFeatures).toHaveBeenCalledWith(
      jasmine.any(VectorLayer)
    );
    expect(
      service.snapInteractions.get(`${mapIndex}-${drawLayer}`)
    ).toBeDefined();
  });

  it("should call initialize snap on start Snap for snapDrawLayers", () => {
    const snapOptions = { snapDrawLayers: ["layer1", "layer2"] };

    spyOn(service, "initializeSnap");
    spyOn(service, "addToSnapFeatures");
    service.startSnap("layer3", mapIndex, snapOptions);
    expect(service.initializeSnap).toHaveBeenCalledTimes(2);
    expect(service.initializeSnap).toHaveBeenCalledWith("layer1", mapIndex);
    expect(service.initializeSnap).toHaveBeenCalledWith("layer2", mapIndex);
    expect(service.addToSnapFeatures).toHaveBeenCalledTimes(2);
    expect(service.addToSnapFeatures).toHaveBeenCalledWith(
      jasmine.any(VectorLayer)
    );
  });

  it("should call addToSnapFeatures and not initializeSnap on start Snap for snapLayers", () => {
    const snapOptions = { snapLayers: ["slayer1", "slayer2"] };

    spyOn(service, "addToSnapFeatures");
    spyOn(service, "initializeSnap");
    service.startSnap("layer3", mapIndex, snapOptions);
    expect(service.initializeSnap).not.toHaveBeenCalled();
    expect(service.addToSnapFeatures).toHaveBeenCalledTimes(2);
  });

  it("should remove snapInteraction from this.snapInteractions on stopSnap", () => {
    const snap = createSnapInteraction();
    const drawLayer = "layer";
    const fakeMap = createSpyObj("olMap", ["removeInteraction"]);
    spyOn(mapService, "getMap").and.returnValue(fakeMap);
    service.snapInteractions = new Map();
    service.snapInteractions.set(`${mapIndex}-${drawLayer}`, snap);
    service.stopSnap(mapIndex);

    expect(fakeMap.removeInteraction).toHaveBeenCalled();
    const snapInterAction = service.snapInteractions.get(
      `${mapIndex}-${drawLayer}`
    );
    expect(snapInterAction).toBeUndefined();
  });

  it("startSnapInteractionAgainIfExists, should NOT call startSnapInteraction when interaction for mapIndex does not exist", () => {
    const layerName = "TestLayer";
    const snapInteractionsMapSpy = spyOn(
      service["snapInteractions"],
      "get"
    ).and.returnValue(undefined);
    const startSnapInteractionSpy = spyOn(service, "startSnap");

    service["startSnapAgainIfExists"](layerName, mapIndex);

    expect(snapInteractionsMapSpy).toHaveBeenCalled();
    expect(startSnapInteractionSpy).not.toHaveBeenCalled();
  });

  it("startSnapInteractionAgainIfExists, should call startSnapInteraction when interaction for mapIndex does exist", () => {
    const snap = {} as Snap;
    const layerName = "TestLayer";
    const snapInteractionsMapSpy = spyOn(
      service["snapInteractions"],
      "get"
    ).and.returnValue(snap);

    const getMapMock = {
      addInteraction: jasmine.createSpy("addInteraction")
    };

    spyOn(mapService, "getMap").and.returnValue(getMapMock as unknown as OlMap);

    service["startSnapAgainIfExists"](layerName, mapIndex);

    expect(snapInteractionsMapSpy).toHaveBeenCalled();
    expect(getMapMock.addInteraction).toHaveBeenCalled();
  });

  function createSnapInteraction(): Snap {
    return new Snap({});
  }

  function createVectorLayer(): VectorLayer<VectorSource<Feature<Geometry>>> {
    return new VectorLayer({
      source: new VectorSource()
    });
  }
});
