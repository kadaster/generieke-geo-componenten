import { inject, Injectable } from "@angular/core";
import * as proj4x from "proj4";
import { Observable, Subject, Subscription } from "rxjs";
import { GgcSearchLocationConnectService } from "./connect.service";
import {
  DEFAULT_MAPINDEX,
  defs,
  ObservableMapWrapper
} from "@kadaster/ggc-models";

const proj4 = (proj4x as any).default;

export type Coordinate = Array<number>;

/**
 * Service verantwoordelijk voor het ophalen en beheren van de geografische locatie van de gebruiker.
 *
 * De service maakt gebruik van de browser Geolocation API en zet coördinaten om naar het
 * Rijksdriehoekstelsel (EPSG:28992). Ook beheert het de visuele weergave van de locatie op de kaart.
 */
@Injectable({
  providedIn: "root"
})
export class GgcSearchLocationService {
  private readonly GEOLOCATION_LAYER_ID = "geolocation";
  private readonly connectService = inject(GgcSearchLocationConnectService);
  private readonly locationEventsMap = new ObservableMapWrapper<
    string,
    Coordinate
  >(() => new Subject<Coordinate>());
  private readonly geolocations: Map<string, number> = new Map<
    string,
    number
  >();
  private readonly subscriptions: Map<string, Subscription> = new Map<
    string,
    Subscription
  >();
  private readonly currentLocation: Subject<Coordinate> =
    new Subject<Coordinate>();
  private readonly geolocationPositionError: Subject<GeolocationPositionError> =
    new Subject<GeolocationPositionError>();

  constructor() {
    proj4.defs("EPSG:28992", defs);
    this.tryRegisterProj4();
  }

  private tryRegisterProj4() {
    import("ol/proj/proj4")
      .then((olProj4) => {
        olProj4.register(proj4);
      })
      .catch(() => {
        console.debug("proj4 van OpenLayers niet beschikbaar");
      });
  }

  /**
   * Retourneert een Observable die locatie-updates uitzendt voor een specifieke kaart.
   *
   * @param mapIndex - De index van de kaart waarvoor de events moeten worden opgehaald. Standaard `DEFAULT_MAPINDEX`.
   * @returns Een Observable die coördinaten in EPSG:28992 formaat uitzendt.
   */
  getLocationEventsObservable(
    mapIndex = DEFAULT_MAPINDEX
  ): Observable<Coordinate> {
    return this.locationEventsMap.getOrCreateObservable(mapIndex);
  }

  /**
   * Start het ophalen van de huidige locatie.
   *
   * Kan eenmalig de locatie ophalen of de locatie blijven volgen (tracken).
   * De resultaten worden naar de kaart gestuurd (indien aanwezig) en via de locationEvents verzonden.
   *
   * @param track - Indien `true`, blijft de service de locatie volgen via `watchPosition`.
   * @param mapIndex - De index van de kaart indien aanwezig.
   * @returns Een Promise die wordt afgerond zodra de initiële setup is voltooid.
   */
  async getLocation(track = false, mapIndex = DEFAULT_MAPINDEX): Promise<void> {
    const mapService = (await this.connectService.getMapService()) as any;
    if (mapService) {
      const map = mapService.getMap(mapIndex);
      if (map) {
        await this.setGeolocationLayerStyle(mapService, mapIndex);
      }
    }
    if (track) {
      if (!this.geolocations.has(mapIndex)) {
        this.geolocations.set(
          mapIndex,
          navigator.geolocation.watchPosition(
            (position: GeolocationPosition) =>
              this.processPositionSuccess(mapIndex, position),
            (error: GeolocationPositionError) => {
              this.stopTrackLocation(mapIndex);
              this.geolocationPositionError.next(error);
            }
          )
        );
      }
    } else {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) =>
          this.processPositionSuccess(mapIndex, position),
        (error: GeolocationPositionError) => {
          this.stopTrackLocation(mapIndex);
          this.geolocationPositionError.next(error);
        }
      );
    }
  }

  /**
   * Geeft toegang tot foutmeldingen die optreden tijdens het geolocatieproces.
   *
   * @returns Een Subject die `GeolocationPositionError` objecten uitzendt.
   */
  getGeolocationPositionErrorSubject(): Subject<GeolocationPositionError> {
    return this.geolocationPositionError;
  }

  /**
   * Stopt het volgen van de locatie voor een specifieke kaart.
   *
   * Ruimt zowel de browser geolocatie-watch als de actieve RxJS-subscripties op.
   *
   * @param mapIndex - De index van de kaart waarvoor tracking moet stoppen.
   */
  stopTrackLocation(mapIndex = DEFAULT_MAPINDEX): void {
    if (this.geolocations.has(mapIndex)) {
      navigator.geolocation.clearWatch(
        this.geolocations.get(mapIndex) as number
      );
      this.geolocations.delete(mapIndex);
    }

    if (this.subscriptions.has(mapIndex)) {
      (this.subscriptions.get(mapIndex) as Subscription).unsubscribe();
      this.subscriptions.delete(mapIndex);
    }
  }

  /**
   * Verwerkt een succesvolle positiebepaling door de coördinaten om te zetten naar EPSG:28992
   * en deze te distribueren naar de relevante subjects.
   *
   * @param mapIndex - De kaartindex waar de update betrekking op heeft.
   * @param position - De geografische positie vanuit de browser.
   */
  private processPositionSuccess(
    mapIndex: string,
    position: GeolocationPosition
  ) {
    const coordinates = proj4("EPSG:28992", [
      position.coords.longitude,
      position.coords.latitude
    ]);

    this.locationEventsMap.getOrCreateSubject(mapIndex).next(coordinates);
    this.currentLocation.next(coordinates);
  }

  private async loadOpenLayers() {
    const Fill = (await import(/* webpackMode: "eager" */ "ol/style/Fill"))
      .default;
    const Stroke = (await import(/* webpackMode: "eager" */ "ol/style/Stroke"))
      .default;
    const Style = (await import(/* webpackMode: "eager" */ "ol/style/Style"))
      .default;
    const CircleStyle = (
      await import(/* webpackMode: "eager" */ "ol/style/Circle")
    ).default;

    return { Fill, Stroke, Style, CircleStyle };
  }

  /**
   * Configureert de visuele stijl van de geolocatie-laag op de kaart.
   *
   * @param mapService - De MapService instantie.
   * @param mapIndex - De index van de kaart waarop de stijl moet worden toegepast.
   */
  private async setGeolocationLayerStyle(
    mapService: any,
    mapIndex: string
  ): Promise<void> {
    const { Fill, Stroke, Style, CircleStyle } = await this.loadOpenLayers();
    const geoLocationStyle = new Style({
      fill: new Fill({
        color: "rgba(0, 115, 149, 0.5)"
      }),
      stroke: new Stroke({
        color: "#007395",
        width: 5
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: "rgba(0, 115, 149, 0.5)"
        }),
        stroke: new Stroke({
          color: "#007395",
          width: 5
        })
      })
    });
    mapService
      .getExtraLayer(this.GEOLOCATION_LAYER_ID, mapIndex)
      ?.setStyle(geoLocationStyle);
  }
}
