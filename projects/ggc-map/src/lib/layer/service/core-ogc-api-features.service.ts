import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FeatureCollection } from "geojson";
import { firstValueFrom } from "rxjs";
import { GeoJSON } from "ol/format";
import { Geometry } from "ol/geom";
import { Feature } from "ol";

interface OgcApiResponse {
  links?: { rel: string; href: string }[];
  features?: any[];
}

@Injectable({
  providedIn: "root"
})
export class CoreOgcApiFeaturesService {
  private readonly http = inject(HttpClient);
  private readonly geoJsonFormat = new GeoJSON();
  private readonly limitDefault = 100;
  private readonly maxFeaturesDefault = 5000;

  async fetchAllOgcApiFeatures(
    initialUrl: string,
    limit = this.limitDefault,
    maxFeatures = this.maxFeaturesDefault
  ): Promise<Feature<Geometry>[]> {
    const allFeatures: Feature<Geometry>[] = [];

    if (!this.isValidOgcApiFeatureUrl(initialUrl)) {
      return allFeatures;
    }

    let url = new URL(initialUrl);

    url.searchParams.set("limit", String(limit));

    while (allFeatures.length < maxFeatures) {
      const response = (await firstValueFrom(
        this.http.get<FeatureCollection>(url.toString())
      )) as OgcApiResponse;
      if (!response) {
        break;
      }

      const olFeatures = this.geoJsonFormat.readFeatures({
        type: "FeatureCollection",
        features: response.features ?? []
      });

      const remainingSlots = maxFeatures - allFeatures.length;
      const featuresToAdd = olFeatures.slice(0, remainingSlots);
      allFeatures.push(...featuresToAdd);

      if (allFeatures.length >= maxFeatures) {
        break;
      }

      const nextLink = response.links?.find((l) => l.rel === "next")?.href;
      if (!nextLink) {
        break;
      }
      url = new URL(nextLink);
    }

    return allFeatures;
  }

  private isValidOgcApiFeatureUrl(url: string): boolean {
    return url.includes("/collections/") && url.includes("/items");
  }
}
