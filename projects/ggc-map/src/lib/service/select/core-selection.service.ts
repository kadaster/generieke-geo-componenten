import { Injectable } from "@angular/core";
import { Coordinate } from "ol/coordinate";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { Observable, Subject } from "rxjs";
import {
  MapComponentEvent,
  MapComponentEventTypes
} from "../../model/map-component-event.model";
import {
  CurrentAndPreviousSelection,
  FeatureCollectionForCoordinate
} from "./selection-state.model";
import { SelectionModeTypes } from "./selection-type.enum";

@Injectable({
  providedIn: "root"
})
export class CoreSelectionService {
  static readonly messageClearSelection = "Selectie is gewist";
  static readonly messageMapClicked =
    "Er is geklikt in de kaart en de feature info wordt opgehaald.";
  static readonly messageSelectionUpdated =
    "Nieuwe feature info van een kaartlaag toegevoegd aan de selectie.";
  static readonly messageCoordinateDoesNotMatch =
    "Er is iets mis gegaan in de CoreSelectionService: het coordinaat van de kaartlaag komt" +
    " niet overeen met het verwachte coordinaat van het klik-event in de kaart.";

  private selectionModeMap: Map<string, SelectionModeTypes> = new Map();
  private allSelections: Map<string, CurrentAndPreviousSelection> = new Map();
  // subject for emitting events and observable for subscribing to events. An observable cannot emit events.
  private subjectMap: Map<string, Subject<MapComponentEvent>> = new Map();
  private observableMap: Map<string, Observable<MapComponentEvent>> = new Map();

  destroySelectionForMap(mapIndex: string): void {
    if (this.subjectMap.has(mapIndex)) {
      this.observableMap.delete(mapIndex);
      this.subjectMap.delete(mapIndex);
    }
    this.selectionModeMap.delete(mapIndex);
    this.allSelections.delete(mapIndex);
  }

  setSelectionModeFormapIndex(
    singleSelect: SelectionModeTypes,
    mapIndex: string
  ): void {
    // 'set' adds the key+value or updates the value when the key already exists
    this.selectionModeMap.set(mapIndex, singleSelect);
  }

  isMultiSelectMode(mapIndex: string): boolean {
    if (this.selectionModeMap.has(mapIndex)) {
      return (
        this.selectionModeMap.get(mapIndex) === SelectionModeTypes.MULTI_SELECT
      );
    }
    return false;
  }

  getObservableForMap(mapIndex: string): Observable<MapComponentEvent> {
    this.createIfNotExistsSubjectAndObservableForMap(mapIndex);
    return this.observableMap.get(mapIndex) as Observable<MapComponentEvent>;
  }

  clearSelectionForMap(mapIndex: string) {
    this.allSelections.set(mapIndex, new CurrentAndPreviousSelection());
    this.emitEvent(
      mapIndex,
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_CLEARSELECTION,
        mapIndex,
        CoreSelectionService.messageClearSelection
      )
    );
  }

  setSelectionForLayer(
    features: Feature<Geometry>[],
    layerName: string,
    mapIndex: string
  ): void {
    const currentAndPreviousSelection = this.getAllSelectionsForMap(mapIndex);
    const currentSelection =
      currentAndPreviousSelection.current ||
      new FeatureCollectionForCoordinate();
    const featureCollection = currentSelection.featureCollectionForLayers.find(
      (i) => i.layerName === layerName
    );
    if (featureCollection) {
      featureCollection.features = features;
    } else {
      currentSelection.featureCollectionForLayers.push({ layerName, features });
    }
    currentAndPreviousSelection.current = currentSelection;
    this.emitEvent(
      mapIndex,
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
        mapIndex,
        CoreSelectionService.messageMapClicked,
        layerName,
        currentAndPreviousSelection.current
      )
    );
  }

  handleSingleclickEventForMap(coordinate: Coordinate, mapIndex: string): void {
    const currentAndPreviousSelection = this.getAllSelectionsForMap(mapIndex);
    if (this.isMultiSelectMode(mapIndex)) {
      currentAndPreviousSelection.previous =
        currentAndPreviousSelection.current;
    }
    currentAndPreviousSelection.current = new FeatureCollectionForCoordinate(
      coordinate
    );
    this.emitEvent(
      mapIndex,
      new MapComponentEvent(
        MapComponentEventTypes.SELECTIONSERVICE_MAPCLICKED,
        mapIndex,
        CoreSelectionService.messageMapClicked,
        undefined,
        currentAndPreviousSelection.current
      )
    );
  }

  clearFeatureInfoForLayer(mapIndex: string, layerName: string): void {
    const currentAndPreviousSelection = this.getAllSelectionsForMap(mapIndex);
    const currentSelection = currentAndPreviousSelection.current;
    if (currentSelection == null) {
      return;
    }
    const featureCollection = currentSelection.featureCollectionForLayers.find(
      (i) => i.layerName === layerName
    );
    if (featureCollection) {
      currentSelection.featureCollectionForLayers =
        currentSelection.featureCollectionForLayers.filter(
          (obj) => obj !== featureCollection
        );
    }
    // emit the event async by calling it from setTimeout
    setTimeout(() => {
      this.emitEvent(
        mapIndex,
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
          mapIndex,
          CoreSelectionService.messageSelectionUpdated,
          layerName,
          currentAndPreviousSelection.current
        )
      );
    });
  }

  handleFeatureInfoForLayer(
    mapIndex: string,
    coordinate: Coordinate,
    features: Feature<Geometry>[],
    layerName: string
  ): void {
    const currentAndPreviousSelection = this.getAllSelectionsForMap(mapIndex);
    const currentSelection = currentAndPreviousSelection.current;
    if (currentSelection && currentSelection.coordinate === coordinate) {
      if (this.isMultiSelectMode(mapIndex)) {
        // multiselect
        let layerInPreviousSelection;
        if (currentAndPreviousSelection.previous) {
          // als er een vorige selectie was, zoeken of de vorige kaartlaag voorkwam in de selectie
          layerInPreviousSelection =
            currentAndPreviousSelection.previous.featureCollectionForLayers.find(
              (layerselection) => layerselection.layerName === layerName
            );
        }
        if (layerInPreviousSelection) {
          // in de vorige selectie is de kaartlaag aanwezig, dus controleren of features al geselecteerd waren
          const multiSelectFeatures = this.getMultiSelectFeatures(
            layerInPreviousSelection.features,
            features
          );
          currentSelection.featureCollectionForLayers.push({
            layerName,
            features: multiSelectFeatures
          });
        } else {
          // kaartlaag niet aanwezig in vorige selectie, dus toegevoegen aan nieuwe selectie
          currentSelection.featureCollectionForLayers.push({
            layerName,
            features
          });
        }
      } else {
        // singleselect, altijd de nieuwe features toevoegen aan de selectie
        currentSelection.featureCollectionForLayers.push({
          layerName,
          features
        });
      }
      this.emitEvent(
        mapIndex,
        new MapComponentEvent(
          MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED,
          mapIndex,
          CoreSelectionService.messageSelectionUpdated,
          layerName,
          currentAndPreviousSelection.current
        )
      );
    } else {
      this.emitEvent(
        mapIndex,
        new MapComponentEvent(
          MapComponentEventTypes.UNSUCCESSFUL,
          mapIndex,
          CoreSelectionService.messageCoordinateDoesNotMatch
        )
      );
    }
  }

  private getMultiSelectFeatures(
    previousFeatures: Feature<Geometry>[],
    features: Feature<Geometry>[]
  ) {
    const multiSelectFeatures: Feature<Geometry>[] = previousFeatures; // eerst vorige selectie overnemen
    features.forEach((f: Feature<Geometry>) => {
      const indexFound = previousFeatures.findIndex(
        (prevF: Feature<Geometry>) => {
          if (prevF.getId() == undefined || f.getId() == undefined) {
            return prevF.get("lokaal_id") === f.get("lokaal_id");
          } else {
            return prevF.getId() === f.getId();
          }
        }
      );
      if (indexFound < 0) {
        // feature was nog niet geselecteerd, dus toevoegen aan selectie
        multiSelectFeatures.unshift(f);
      } else {
        // feature was al geselecteerd, dus verwijderen uit selectie
        multiSelectFeatures.splice(indexFound, 1);
      }
    });
    return multiSelectFeatures;
  }

  private createIfNotExistsSubjectAndObservableForMap(mapIndex: string): void {
    if (!this.subjectMap.has(mapIndex)) {
      this.subjectMap.set(mapIndex, new Subject<MapComponentEvent>());
      this.observableMap.set(
        mapIndex,
        (
          this.subjectMap.get(mapIndex) as Subject<MapComponentEvent>
        ).asObservable()
      );
    }
  }

  private getAllSelectionsForMap(
    mapIndex: string
  ): CurrentAndPreviousSelection {
    if (this.allSelections.has(mapIndex)) {
      return this.allSelections.get(mapIndex) as CurrentAndPreviousSelection;
    }
    return this.allSelections
      .set(mapIndex, new CurrentAndPreviousSelection())
      .get(mapIndex) as CurrentAndPreviousSelection;
  }

  private emitEvent(mapIndex: string, event: MapComponentEvent): void {
    this.createIfNotExistsSubjectAndObservableForMap(mapIndex);
    (this.subjectMap.get(mapIndex) as Subject<MapComponentEvent>).next(event);
  }
}
