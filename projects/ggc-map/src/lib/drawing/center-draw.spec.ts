import OlMap from "ol/Map";
import { Point, LineString, Polygon } from "ol/geom";
import VectorSource from "ol/source/Vector";
import Feature from "ol/Feature";
import { CenterDraw, CenterDrawOptions } from "./center-draw";
import View from "ol/View";
import VectorLayer from "ol/layer/Vector";

describe("CenterDraw", () => {
  let centerDraw: CenterDraw;
  let mapMock: OlMap;
  let crossHairOverlayMock: VectorLayer;

  beforeEach(() => {
    // Mock de kaart en opties
    mapMock = new OlMap({
      view: new View({
        center: [100, 200], // Laten beginnen op een voorbeeldcentrum
        zoom: 10
      })
    });
    const options: CenterDrawOptions = {
      type: "Polygon", // Test standaard als Polygon
      source: new VectorSource()
    };
    // Initialiseer de CenterDraw
    centerDraw = new CenterDraw(options);
    centerDraw.setMap(mapMock); // Zet de kaart
    // Mock de crossHairOverlay
    crossHairOverlayMock = new VectorLayer({
      source: new VectorSource()
    });

    // Mock de crossHairOverlay expliciet als onderdeel van centerDraw
    centerDraw["crossHairOverlay"] = crossHairOverlayMock;
  });

  it("should initialize with correct options", () => {
    expect(centerDraw["type"]).toBe("Polygon");
    expect(centerDraw["overlay"]).toBeDefined();
    expect(centerDraw["crossHairOverlay"]).toBeDefined();
  });

  it("setMap() should attach correctly to a map and initialize overlays", () => {
    const overlaySetMapSpy = spyOn(
      centerDraw["overlay"]!,
      "setMap"
    ).and.callThrough();
    const crossHairOverlaySetMapSpy = spyOn(
      centerDraw["crossHairOverlay"]!,
      "setMap"
    ).and.callThrough();

    centerDraw.setMap(mapMock);

    // Controleer dat de overlays correct de kaart hebben gekregen
    expect(overlaySetMapSpy).toHaveBeenCalledWith(mapMock);
    expect(crossHairOverlaySetMapSpy).toHaveBeenCalledWith(mapMock);

    // Controleer dat het centerPoint correct is geconfigureerd
    expect(centerDraw["centerPoint"]).toBeDefined();
    expect(centerDraw["centerPoint"].getCoordinates()).toEqual([100, 200]);

    // Controleer of een feature is toegevoegd aan de crosshair source
    const crossHairSource = centerDraw[
      "crossHairOverlay"
    ]!.getSource() as VectorSource;

    expect(crossHairSource.getFeatures().length).toBe(1);
    expect(
      (crossHairSource.getFeatures()[0].getGeometry() as Point).getCoordinates()
    ).toEqual([100, 200]);
  });

  it("setMap() should detach correctly from a map", () => {
    const overlaySetMapSpy = spyOn(
      centerDraw["overlay"]!,
      "setMap"
    ).and.callThrough();
    const crossHairOverlaySetMapSpy = spyOn(
      centerDraw["crossHairOverlay"]!,
      "setMap"
    ).and.callThrough();
    centerDraw.setMap(null);
    // Controleer dat de overlays van de kaart zijn ontkoppeld
    expect(overlaySetMapSpy).toHaveBeenCalledWith(null);
    expect(crossHairOverlaySetMapSpy).toHaveBeenCalledWith(null);
  });

  it("registerListener() should listen to view changes and call updateCenterPoint", () => {
    const updateCenterPointSpy = spyOn(
      centerDraw as any,
      "updateCenterPoint"
    ).and.callThrough();

    // Registreer de luisteraars
    centerDraw["registerListeners"]!(mapMock);

    // Trigger een verandering in de view
    mapMock.getView().dispatchEvent("change:center");

    // Controleer dat `updateCenterPoint` wordt aangeroepen
    expect(updateCenterPointSpy).toHaveBeenCalled();
  });

  it("updateCenterPoint() should update the center point with the map view center", () => {
    // Change the map view center
    const newCenter = [300, 400];
    mapMock.getView().setCenter(newCenter);
    // Call the updateCenterPoint method
    (centerDraw as any).updateCenterPoint();
    expect(centerDraw["centerPoint"]).toBeDefined();
    expect(centerDraw["centerPoint"].getCoordinates()).toEqual(newCenter);
  });

  it("updateCenterPoint() should update LineString geometry coordinates", () => {
    // Stel een LineString in als sketchGeometry
    const lineString = new LineString([
      [0, 0],
      [100, 100]
    ]);
    centerDraw["sketchGeometry"] = lineString;
    // Verander het centrum van de kaart
    const newCenter = [300, 400];
    mapMock.getView().setCenter(newCenter);
    // Roep de methode aan
    (centerDraw as any).updateCenterPoint();
    // Controleer of de LineString de nieuwe coördinaat heeft toegevoegd
    expect(lineString.getCoordinates()).toEqual([
      [0, 0],
      [300, 400]
    ]);
  });

  it("updateCenterPoint() should update Polygon geometry coordinates", () => {
    // Stel een Polygon in als sketchGeometry
    const polygon = new Polygon([
      [
        [0, 0],
        [100, 100],
        [200, 200],
        [0, 0] // Gesloten ring
      ]
    ]);
    centerDraw["sketchGeometry"] = polygon;
    // Verander het centrum van de kaart
    const newCenter = [400, 500];
    mapMock.getView().setCenter(newCenter);
    // Roep de methode aan
    (centerDraw as any).updateCenterPoint();
    // Controleer of de Polygon de nieuwe coördinaat heeft aangepast
    expect(polygon.getCoordinates()).toEqual([
      [
        [0, 0],
        [100, 100],
        [400, 500], // Middelpunt bijgewerkt
        [0, 0]
      ]
    ]);
  });

  it("updateCenterPoint() should do nothing if sketchGeometry is a Point", () => {
    // Stel een Point in als sketchGeometry
    const point = new Point([50, 50]);
    centerDraw["sketchGeometry"] = point;
    // Verander het centrum van de kaart
    const newCenter = [300, 400];
    mapMock.getView().setCenter(newCenter);
    // Roep de methode aan
    (centerDraw as any).updateCenterPoint();
    // Controleer dat de Point niet is aangepast (Point wordt niet beïnvloed door center updates in deze methode)
    expect(point.getCoordinates()).toEqual([50, 50]);
  });

  it("appendCoordinates() should call initializeSketch if sketchGeometry  is undefined", () => {
    const initialize = spyOn(centerDraw as any, "initializeSketch");
    centerDraw["type"] = "LineString"; // Stel het type in
    centerDraw["sketchGeometry"] = undefined; // Geen bestaande geometrie
    // Roep appendCoordinates aan
    centerDraw.appendCoordinates();
    expect(initialize).toHaveBeenCalled();
  });

  it("appendCoordinates() should initialize a Point geometry and set its coordinates", () => {
    const finishDrawing = spyOn(centerDraw, "finishDrawing");
    centerDraw["type"] = "Point"; // Stel het type in op Point
    // Roep appendCoordinates aan
    centerDraw.appendCoordinates();
    expect(centerDraw["sketchGeometry"]).toBeDefined();
    expect(centerDraw["sketchGeometry"]).toBeInstanceOf(Point);
    expect((centerDraw["sketchGeometry"] as Point).getCoordinates()).toEqual([
      100, 200
    ]);
    expect(finishDrawing).toHaveBeenCalled();
  });

  it("appendCoordinates() should add a coordinate to a LineString", () => {
    // Mock een LineString met bestaande coördinaten
    centerDraw["sketchGeometry"] = new LineString([
      [10, 15],
      [20, 25]
    ]);
    centerDraw.appendCoordinates();
    // Verifieer dat een nieuw coördinaat aan het einde van de array is toegevoegd
    expect(
      (centerDraw["sketchGeometry"]! as LineString).getCoordinates()
    ).toEqual([
      [10, 15],
      [20, 25],
      [100, 200]
    ]);
  });

  it("appendCoordinates() should add geometry to a Polygon when geometry is empty", () => {
    // Mock een Polygon met een buitenring
    centerDraw["sketchGeometry"] = new Polygon([]);
    // Roep de methode aan
    centerDraw.appendCoordinates();
    // Verifieer dat het nieuwe punt vóór het sluitpunt in de ring is toegevoegd
    expect(
      (centerDraw["sketchGeometry"]! as Polygon).getCoordinates()[0]
    ).toEqual([
      [100, 200],
      [100, 200],
      [100, 200]
    ]);
  });

  it("appendCoordinates() should add a coordinate to a Polygon", () => {
    // Mock een Polygon met een buitenring
    centerDraw["sketchGeometry"] = new Polygon([
      [
        [10, 20],
        [20, 30],
        [10, 20],
        [10, 20] // Gesloten ring
      ]
    ]);
    // Roep de methode aan
    centerDraw.appendCoordinates();
    // Verifieer dat het nieuwe punt vóór het sluitpunt in de ring is toegevoegd
    expect((centerDraw["sketchGeometry"]! as Polygon).getCoordinates()).toEqual(
      [
        [
          [10, 20],
          [20, 30],
          [100, 200], // Middelpunt toegevoegd
          [10, 20],
          [10, 20] // Sluitpunt
        ]
      ]
    );
  });

  it("removeLastPoint() should remove last point of Linestring", () => {
    // Stel een LineString geometrie in met meerdere punten
    centerDraw["sketchGeometry"] = new LineString([
      [10, 20],
      [20, 30],
      [100, 200]
    ]);
    centerDraw["previousCenter"] = [20, 30];

    // Roep de methode aan
    centerDraw.removeLastPoint();

    // Verifieer dat het laatste punt is verwijderd en vervangen door het middelpunt
    expect(
      (centerDraw["sketchGeometry"]! as LineString).getCoordinates()
    ).toEqual([
      [10, 20],
      [100, 200] // Middelpunt toegevoegd
    ]);

    expect(centerDraw["previousCenter"]).toBeUndefined();
  });

  it("removeLastPoint() should call abortDrawing when there are only two points left in a LineString", () => {
    // Stel een LineString geometrie in met meerdere punten
    centerDraw["sketchGeometry"] = new LineString([
      [10, 20],
      [100, 200]
    ]);
    const source = centerDraw["overlay"]!.getSource()!;
    spyOn(source, "clear");
    // Roep de methode aan
    centerDraw.removeLastPoint();
    // Verifieer abortDrawing is aangeroepen
    expect(centerDraw["sketchFeature"]).toBeUndefined();
    expect(centerDraw["sketchGeometry"]).toBeUndefined();
    expect(centerDraw["previousCenter"]).toBeUndefined();
    expect(source.clear).toHaveBeenCalledWith(true);
  });

  it("removeLastPoint() should not remove last point of Polygon", () => {
    // Stel een Polygon geometrie in met een gesloten ring
    centerDraw["sketchGeometry"] = new Polygon([
      [
        [10, 20],
        [20, 30], //laats toegevoegde punt
        [100, 200], //center
        [10, 20] // Gesloten ring
      ]
    ]);
    centerDraw["previousCenter"] = [20, 30];
    centerDraw.removeLastPoint();
    // Verifieer dat het één voorlaatste punt in de buitenste ring vervangt door het middelpunt
    expect(
      (centerDraw["sketchGeometry"]! as Polygon).getCoordinates()[0]
    ).toEqual([
      [10, 20],
      [100, 200], //center
      [10, 20] // Sluitpunt
    ]);

    expect(centerDraw["previousCenter"]).toBeUndefined();
  });

  it("removeLastPoint() from Polygon should call abortDrawing and reset properties when there are only three points left", () => {
    centerDraw["sketchGeometry"] = new Polygon([
      [
        [10, 20],
        [100, 200], //center
        [10, 20] // Gesloten ring
      ]
    ]);

    const source = centerDraw["overlay"]!.getSource()!;
    spyOn(source, "clear");

    centerDraw.removeLastPoint();

    expect(centerDraw["previousCenter"]).toBeUndefined();
    expect(centerDraw["sketchFeature"]).toBeUndefined();
    expect(centerDraw["sketchGeometry"]).toBeUndefined();
    expect(source.clear).toHaveBeenCalledWith(true);
  });

  it("finishDrawing() should remove a redundant point from LineString add it to the target source and finish the drawing", () => {
    centerDraw["sketchGeometry"] = new LineString([
      [10, 20],
      [30, 40],
      [100, 200]
    ]);
    centerDraw["sketchFeature"] = new Feature(centerDraw["sketchGeometry"]);
    centerDraw.finishDrawing();
    // controleer of de LineString correct is toegevoegd aan target source (laatste punt verwijderd)
    const geom = centerDraw["targetSource"]
      ?.getFeatures()[0]
      .getGeometry() as LineString;
    expect(geom.getCoordinates()).toEqual([
      [10, 20],
      [30, 40]
    ]);
    // Controleer dat de functie `dispatchEvent` is aangeroepen
    spyOn(centerDraw, "dispatchEvent");
    expect(centerDraw.dispatchEvent).toHaveBeenCalled;
  });
  it("finishDrawing() should remove a redundant point from Polygon add it to the target source and finish the drawing", () => {
    centerDraw["sketchGeometry"] = new Polygon([
      [
        [10, 20],
        [30, 40],
        [100, 200], //center
        [10, 20] // Sluitcoördinaat
      ]
    ]);
    centerDraw["sketchFeature"] = new Feature(centerDraw["sketchGeometry"]);
    centerDraw.finishDrawing();
    // controleer of de Polygon correct is toegevoegd aan target source (laatste punt verwijderd)
    const geom = centerDraw["targetSource"]
      ?.getFeatures()[0]
      .getGeometry() as Polygon;
    expect(geom.getCoordinates()[0]).toEqual([
      [10, 20],
      [30, 40],
      [10, 20]
    ]);
    // Controleer dat de functie `dispatchEvent` is aangeroepen
    spyOn(centerDraw, "dispatchEvent");
    expect(centerDraw.dispatchEvent).toHaveBeenCalled;
  });

  it("finishDrawing() should add a Point and finish the drawing", () => {
    centerDraw["sketchGeometry"] = new Point([10, 20]);
    centerDraw["sketchFeature"] = new Feature(centerDraw["sketchGeometry"]);
    centerDraw.finishDrawing();
    expect(centerDraw["targetSource"]?.getFeatures().length).toBe(1);
  });

  it("abortDrawing() should reset sketchGeometry and sketchFeature", () => {
    centerDraw["sketchGeometry"] = new LineString([
      [10, 20],
      [30, 40]
    ]);
    centerDraw["sketchFeature"] = new Feature(centerDraw["sketchGeometry"]);
    // Roep de methode aan
    const result = (centerDraw as any).abortDrawing();

    // Controleer dat de geometrie en feature zijn gereset
    expect(centerDraw["sketchGeometry"]).toBeUndefined();
    expect(centerDraw["sketchFeature"]).toBeUndefined();

    // Controleer dat de methode het verwijderde feature teruggeeft
    expect(result).toBeInstanceOf(Feature);
    expect((result?.getGeometry() as LineString).getCoordinates()).toEqual([
      [10, 20],
      [30, 40]
    ]);
  });
  it("abortDrawing() should clear the overlay", () => {
    // Mock de clear-functie van de overlay-bron
    const clearSpy = spyOn(centerDraw["overlay"]!.getSource()!, "clear");

    // Roep de methode aan
    (centerDraw as any).abortDrawing();

    // Controleer of de overlaybron correct gewist is
    expect(clearSpy).toHaveBeenCalledWith(true);
  });
});
