import OlMap from "ol/Map";
import View from "ol/View";
import VectorSource from "ol/source/Vector";
import { CenterBase, CenterBaseOptions } from "./center-base";
import VectorLayer from "ol/layer/Vector";
import { Point } from "ol/geom";

describe("CenterBase", () => {
  let centerBase: CenterBase;
  let mapMock: OlMap;
  let crossHairOverlayMock: VectorLayer;
  beforeEach(() => {
    // Mock de kaart
    mapMock = new OlMap({
      view: new View({
        center: [100, 200], // Laten beginnen op een voorbeeldcentrum
        zoom: 10
      })
    });
    const options: CenterBaseOptions = {
      crossHairStyle: undefined
    };
    // Initialiseer de CenterDraw
    centerBase = new CenterBase(options);
    centerBase.setMap(mapMock); // Zet de kaart
    // Mock de crossHairOverlay
    crossHairOverlayMock = new VectorLayer({
      source: new VectorSource()
    });
    // @ts-ignore
    centerBase["crossHairOverlay"] = crossHairOverlayMock;
  });

  it("setMap() should attach correctly to a map and initialize overlays", () => {
    const crossHairOverlaySetMapSpy = spyOn(
      centerBase["crossHairOverlay"]!,
      "setMap"
    ).and.callThrough();
    centerBase.setMap(mapMock);

    // Controleer dat de crossHairoverlay correct de kaart hebben gekregen
    expect(crossHairOverlaySetMapSpy).toHaveBeenCalledWith(mapMock);

    // Controleer dat het centerPoint correct is geconfigureerd
    expect(centerBase["centerPoint"]).toBeDefined();
    expect(centerBase["centerPoint"].getCoordinates()).toEqual([100, 200]);

    // Controleer of een feature is toegevoegd aan de crosshair source
    const crossHairSource = centerBase[
      "crossHairOverlay"
    ]!.getSource() as VectorSource;

    expect(crossHairSource.getFeatures().length).toBe(1);
    expect(
      (crossHairSource.getFeatures()[0].getGeometry() as Point).getCoordinates()
    ).toEqual([100, 200]);
  });

  it("should calculate pixel distance using map coordinates", () => {
    const c1 = [0, 0];
    const c2 = [1, 1];

    // distance is 5
    const p1 = [0, 0];
    const p2 = [3, 4];

    spyOn(mapMock, "getPixelFromCoordinate").and.callFake((coord) => {
      if (coord === c1) return p1;
      if (coord === c2) return p2;
      return p1;
    });

    const result = (centerBase as any).calculatePixelDistanceOfCoordinates(
      c1,
      c2
    );
    expect(result).toBe(5);
  });
});
