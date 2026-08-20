import { inject, Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { AdditionalSuggestion } from "@kadaster/ggc-search-location";
import { GgcLayerService } from "@kadaster/ggc-map";
import { LayerChangedEventTrigger } from "@kadaster/ggc-models";
import VectorLayer from "ol/layer/Vector";
import Feature from "ol/Feature";
import { Coordinate } from "ol/coordinate";
import { Point } from "ol/geom";

@Injectable({
  providedIn: "root"
})
export class AlternativeSuggestService {
  private meldingnummers: string[] = [];
  private readonly layerService = inject(GgcLayerService);

  private readonly mapIndex = "mapIndex-alternative-search";

  constructor() {
    this.layerService.getLayerChangedObservable().subscribe((event) => {
      if (
        event.mapIndex === this.mapIndex &&
        event.eventTrigger === LayerChangedEventTrigger.LAYER_LOADED &&
        event.layerId === "terugmeldingen-bag"
      ) {
        this.meldingnummers = this.getTerugmeldingFeatures().map(
          (feature: Feature) => {
            return feature.get("meldingsnummer_volledig");
          }
        );
      }
    });
  }

  search(query: string): Observable<AdditionalSuggestion[]> {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return of([]);
    }

    const suggestions: AdditionalSuggestion[] = this.meldingnummers
      .filter((meldingsnummer) =>
        meldingsnummer.toLowerCase().startsWith(normalizedQuery)
      )
      .map((meldingsnummer) => ({
        id: meldingsnummer,
        display_name: meldingsnummer,
        type: "terugmelding",
        collection: "terugmelding"
      }));

    return of(suggestions);
  }

  getCoordinateOfTerugmelding(meldingsnummer: string): Coordinate | undefined {
    const feature: Feature = this.getTerugmeldingFeatures().find(
      (feature: Feature) =>
        feature.get("meldingsnummer_volledig") === meldingsnummer
    );

    if (!feature) {
      return undefined;
    }

    return (feature.getGeometry() as Point).getCoordinates();
  }

  private getTerugmeldingFeatures() {
    const layer = this.layerService.getLayer(
      "terugmeldingen-bag",
      this.mapIndex
    ) as VectorLayer;
    const terugmeldingFeatures = layer.getSource()?.getFeatures();
    return terugmeldingFeatures ?? [];
  }
}
