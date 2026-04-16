import { inject, Injectable } from "@angular/core";
import { SnapOptions } from "../../model/snap-options";
import { CoreSnapService } from "./core-snap.service";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";

/**
 * Service voor het beheren van snap-interacties op de kaart.
 *
 * Deze service biedt methoden voor het starten en stoppen van snap-interacties,
 * en het ophalen van snap-events.
 */
@Injectable({
  providedIn: "root"
})
export class GgcSnapService {
  private readonly coreSnapService = inject(CoreSnapService);

  /**
   * Start snappen op de opgegeven laag.
   *
   * @param layerName - Naam van de laag waarop gesnapped wordt.
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @param snapOptions - Opties voor de snap-interactie. Default: leeg object.
   */
  startSnap(
    layerName: string,
    mapIndex = DEFAULT_MAPINDEX,
    snapOptions: SnapOptions = {}
  ): void {
    this.coreSnapService.startSnap(layerName, mapIndex, snapOptions);
  }

  /**
   * Stopt snappen.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   */
  stopSnap(mapIndex = DEFAULT_MAPINDEX): void {
    this.coreSnapService.stopSnap(mapIndex);
  }

  /**
   * Geeft een `Observable` terug met uitgebreide snap-events voor de opgegeven kaart.
   *
   * @param mapIndex - Index van de kaart. Default: `DEFAULT_MAPINDEX`.
   * @returns `Observable` van snap-events.
   */
  getSnapExtendedEventsObservable(mapIndex: string = DEFAULT_MAPINDEX) {
    return this.coreSnapService.getSnapExtendedEventsObservable(mapIndex);
  }
}
