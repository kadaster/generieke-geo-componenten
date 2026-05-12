import { inject, Injectable } from "@angular/core";
import { Collection } from "ol";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Snap } from "ol/interaction";
import VectorLayer from "ol/layer/Vector";
import { CoreMapService } from "../../map/service/core-map.service";
import { SnapOptions } from "../../model/snap-options";
import {
  createSnapExtendedEvent,
  createUnsnapExtendedEvent,
  SnapExtendedEvent
} from "../../model/snap-extended-event.model";
import { ObservableMapWrapper } from "@kadaster/ggc-models";
import { Subject } from "rxjs";
import { CoreDrawLayerService } from "./core-draw-layer.service";

@Injectable({
  providedIn: "root"
})
export class CoreSnapService {
  snapInteractions: Map<string, Snap> = new Map();

  private readonly coreMapService = inject(CoreMapService);
  private readonly coreDrawLayerService = inject(CoreDrawLayerService);
  private readonly snapFeatures: Collection<Feature<Geometry>> = new Collection(
    [],
    {
      unique: true
    }
  );
  private readonly initializedLayers: string[] = [];
  private readonly snapExtendedEventsMap = new ObservableMapWrapper<
    string,
    SnapExtendedEvent
  >(() => new Subject<SnapExtendedEvent>());

  startSnap(
    drawLayer: string,
    mapIndex: string,
    snapOptions: SnapOptions
  ): void {
    this.stopSnap(mapIndex);
    this.snapFeatures.clear();
    // wanneer er geen snapLayers of snapDrawLayers zijn opgegeven
    // dan alleen snappen naar zichzelf (=default)
    if (!snapOptions.snapDrawLayers && !snapOptions.snapLayers) {
      if (!this.isInitialized(drawLayer)) {
        this.initializeSnap(drawLayer, mapIndex);
      }
      this.addToSnapFeatures(
        this.coreDrawLayerService.getDrawLayer(drawLayer, mapIndex)
      );
    }
    //wanneer snaplayers bestaan de features toevoegen aan snapFeatures
    if (snapOptions.snapLayers) {
      snapOptions.snapLayers.forEach((snapLayer) => {
        this.addToSnapFeatures(
          this.coreMapService.getLayer(snapLayer, mapIndex) as VectorLayer
        );
      });
    }
    //als drawsnaplayers bestaan de features toevoegen aan snapfeatures
    if (snapOptions.snapDrawLayers) {
      snapOptions.snapDrawLayers.forEach((snapLayer) => {
        if (!this.isInitialized(snapLayer)) {
          this.initializeSnap(snapLayer, mapIndex);
        }
        this.addToSnapFeatures(
          this.coreDrawLayerService.getDrawLayer(snapLayer, mapIndex)
        );
      });
    }

    const snap = new Snap({
      features: this.snapFeatures,
      pixelTolerance: snapOptions.pixelTolerance ?? 10,
      vertex: snapOptions.vertex ?? true,
      edge: snapOptions.edge ?? true,
      intersection: snapOptions.intersection ?? false,
      segmenters: snapOptions.segmenters ?? undefined
    });

    this.snapInteractions.set(`${mapIndex}-${drawLayer}`, snap);
    this.coreMapService.getMap(mapIndex).addInteraction(snap);
    this.setSnap(mapIndex, snap);
  }

  stopSnap(mapIndex: string): void {
    const prefix = `${mapIndex}-`;
    this.snapInteractions.forEach((interaction, key) => {
      if (key.startsWith(prefix)) {
        this.coreMapService.getMap(mapIndex).removeInteraction(interaction);
        this.snapInteractions.delete(key);
      }
    });
  }

  startSnapAgainIfExists(layerName: string, mapIndex: string): void {
    // if SnapInteraction exists for mapIndex, add SnapInteraction again, so it's added as last interaction to the map.
    // SnapInteraction must be added after Modify- or DrawInteraction
    const interaction = this.snapInteractions.get(`${mapIndex}-${layerName}`);
    if (interaction) {
      this.coreMapService.getMap(mapIndex).addInteraction(interaction);
    }
  }

  initializeSnap(drawLayer: string, mapIndex: string) {
    const layer = this.coreDrawLayerService.getDrawLayer(drawLayer, mapIndex);
    if (layer) {
      this.initializedLayers.push(drawLayer);
      const sf = this.snapFeatures;
      layer.getSource()!.on("addfeature", function (evt) {
        if (evt.feature) {
          sf.push(evt.feature);
        }
      });
      layer.getSource()!.on("removefeature", function (evt) {
        if (evt.feature) {
          sf.remove(evt.feature);
        }
      });
    }
  }

  private isInitialized(drawLayer: string): boolean {
    return this.initializedLayers.includes(drawLayer);
  }

  addToSnapFeatures(snapLayer: VectorLayer) {
    if (snapLayer) {
      const features = snapLayer.getSource()!.getFeatures();
      this.snapFeatures.extend(features);
    }
  }

  setSnap(mapIndex: string, snap: Snap) {
    snap.on("snap", (event) => {
      this.snapExtendedEventsMap
        .getOrCreateSubject(mapIndex)
        .next(createSnapExtendedEvent(event));
    });
    snap.on("unsnap", (event) => {
      this.snapExtendedEventsMap
        .getOrCreateSubject(mapIndex)
        .next(createUnsnapExtendedEvent(event));
    });
  }

  getSnapExtendedEventsObservable(mapIndex: string) {
    return this.snapExtendedEventsMap.getOrCreateObservable(mapIndex);
  }
}
