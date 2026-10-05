import {
  AfterContentInit,
  Component,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  TemplateRef,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import {
  ValueTemplateDirective,
  ValueTemplateDirectiveType
} from "../directive/value-template.directive";
import { FeatureInfoDisplayType } from "../feature-info-display/feature-info-display-type";
import { CustomFeatureInfo } from "../model/custom-feature-info.model";

import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoDisplayComponent } from "../feature-info-display/feature-info-display.component";
import { FeatureInfoMapConnectService } from "../service/feature-info-map-connect.service";
import {
  DEFAULT_MAPINDEX,
  FeatureCollectionForCoordinate,
  FeatureCollectionForLayer,
  GGC_FEATURE_LAYERID,
  MapComponentEvent,
  MapComponentEventTypes,
  ViewerType
} from "@kadaster/ggc-models";
import { declusterFeatures } from "@kadaster/ggc-map";
import { Subscription } from "rxjs";
import { FeatureInfoEventService } from "../service/feature-info-event.service";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";

/**
 * Het `FeatureInfoComponent` toont feature-informatie afkomstig uit kaartlagen
 * zoals WMTS, WMS en GeoJSON via GetFeatureInfo requests.
 *
 * Ondersteunt weergave in lijst of tabelvorm, paginering, custom templates,
 * en configuratie van attributen via `GgcFeatureInfoConfigService`.
 *
 * @example
 * <ggc-feature-info
 *   [featureInfoCollection]="dataFeatureInfoFromTab"
 *   [featureInfoDisplayType]="featureInfoDisplayType.LIST"
 *   [customAttributeNamesAndValues]="customFeatureInfoMap"
 *   (events)="handleEvent($event)">
 * </ggc-feature-info>
 *
 * @remarks
 * Dit component kan op zichzelf worden gebruikt, of binnen `ggc-feature-info-tabs` om
 * tabbladenfunctionaliteit toe te voegen, zie {@link GgcFeatureInfoTabsComponent}.
 *
 * Let op: het wijzigen of verbergen van het `geometry`-veld via
 * `customAttributeNamesAndValues` kan gevolgen hebben voor andere
 * functionaliteit wanneer dit component samen met het generieke
 * kaartcomponent wordt gebruikt. OpenLayers verwacht specifiek een
 * `geometry`-veld om een feature aan de highlight-laag toe te kunnen voegen
 * (bijvoorbeeld via `addFeaturesToHighlightLayer()`); zonder dit veld kan het
 * feature niet op de kaart worden weergegeven.
 */
@Component({
  selector: "ggc-feature-info",
  templateUrl: "./ggc-feature-info.component.html",
  styleUrls: ["./ggc-feature-info.component.css"],
  imports: [FeatureInfoDisplayComponent]
})
export class GgcFeatureInfoComponent
  implements AfterContentInit, OnChanges, OnInit, AfterViewInit, OnDestroy
{
  /** Unieke naam/index van de kaart waarvoor Feature Info getoond moet worden
   * Een 3D viewer maakt geen gebruikt van een mapIndex, dus die kan dan worden leeggelaten.
   * Wel kan een 3D viewer gebruik maken van een selectIndex, netzoals een 2D viewer.
   * */
  mapIndex = input(DEFAULT_MAPINDEX);

  /** Unieke naam/index van de selectie index waarvoor Feature Info getoond moet worden, indien opgegeven.
   *  Feature-info zal in dit geval luisteren naar de select interactie waar de mapIndex en selectIndex overeenkomt.
   *  Als selectIndex undefined is, dan wordt alleen naar de mapIndex gekeken.
   */
  selectIndex = input<string>();

  /**
   * Geeft aan of een message moet worden getoond ("Geen informatie beschikbaar") wanneer er geen data is.
   * Default: `true`.
   */
  showEmptyMessage = input(true);

  /**
   * Type weergave voor de feature-informatie: lijst of tabel.
   * Default: `FeatureInfoDisplayType.TABLE`.
   */
  featureInfoDisplayType = input(FeatureInfoDisplayType.TABLE);

  /**
   * Tekst voor de knop om naar de vorige feature te gaan.
   * Default: `"<"`.
   */
  pagerPrevious = input("<");

  /**
   * Tekst voor de knop om naar de volgende feature te gaan.
   * Default: `">"`.
   */
  pagerNext = input(">");
  /**
   * Verberg velden die leeg zijn (null of lege string).
   * Default: `false`.
   */
  hideEmptyFields = input(false);
  /**
   * Maak gebruik van auto-connect functionaliteit,
   * auto-connect zorgt ervoor dat er automatische op
   * het selection updated event wordt gereageerd en dat
   * het actieve feature wordt gehighlighted.
   * Default: `true`.
   */
  autoConnect = input(true);
  /**
   * Wanneer false, dan start de feature-info niet automatisch de selection interaction.
   * De feature-info blijft wel luisteren naar events op de opgegeven mapIndex/selectIndex en doet de betreffende highlighting.
   * Met deze optie kan de afnemer zelf de select interactie starten met de gewenste parameters.
   */
  autoStartSelect = input(true);
  /**
   * Geeft aan of dit feature info component gebruikt wordt voor 2D of 3D kaart.
   */
  viewerType = input(ViewerType.TWEE_D);

  hidePagerWithOneFeature = input(false);

  /**
   * Verzameling van features en metadata die weergegeven moeten worden.
   * Bevat een layerTitle, layerId en een lijst van features (OpenLayers of plain objects).
   */
  featureInfoCollection = input<FeatureInfoCollection>();

  /**
   * Map van een koppeling van veldnamen naar `CustomFeatureInfo` objecten,
   * in de vorm van een customAttributeName en/of customAttributeValueFunction.
   * Hiermee kunnen veldnamen en/of veldwaarden aangepast worden.
   */
  customAttributeNamesAndValues = input<Map<string, CustomFeatureInfo>>();

  /** FeatureInfoEvent afkomstig van ggc-feature-info-tabs. */
  featureInfoEvent = input<FeatureInfoComponentEvent>();

  /** Output voor het versturen van component-gerelateerde events. */
  readonly events = output<FeatureInfoComponentEvent>();
  protected customHeaderValueTemplates = signal(
    new Map<string, TemplateRef<any> | null>()
  );
  protected customValueTemplates = signal(new Map<string, TemplateRef<any>>());
  protected hideEmptyFieldWithKeys = signal<string[]>([]);
  protected displayFeaturesProperties = signal<object[] | undefined>(undefined);
  protected pagerIsHidden = signal(false);
  protected currentFeatureIndex = signal(0);
  protected currentFeature = signal<object | null>(null);
  protected readonly emptyInfo = signal("Geen informatie beschikbaar");
  private readonly featureInfoMapConnectService = inject(
    FeatureInfoMapConnectService
  );
  private readonly destroyRef = inject(DestroyRef);
  private hasTabs = true;
  private subscription: Subscription;
  private subscriptionSelection: Subscription;
  private readonly eventService = inject(FeatureInfoEventService);
  private readonly templates = contentChildren(ValueTemplateDirective);
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );
  /**
   * Referentie naar het host element van dit component.
   * Wordt gebruikt om in de DOM te zoeken naar GGC webcomponents.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly currentFeatureInfoCollection = signal<
    FeatureInfoCollection | undefined
  >(undefined);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["featureInfoCollection"]) {
      this.setFeatureInfoCollection(this.featureInfoCollection());
    } else if (
      changes["customAttributeNamesAndValues"] ||
      changes["hidePagerWithOneFeature"]
    ) {
      this.handleFeatureInfoChanges();
    }

    const featureInfoEvent = this.featureInfoEvent();
    if (changes["featureInfoEvent"] && featureInfoEvent) {
      this.handleFeatureInfoEvent(featureInfoEvent);
    }
  }

  ngOnInit() {
    if (this.autoConnect()) {
      this.subscribeToMapSelection(this.mapIndex(), this.selectIndex());
      this.subscription = this.eventService.events$.subscribe((event) =>
        this.handleFeatureInfoEvent(event)
      );
    }
  }

  ngAfterViewInit(): void {
    const featureInfoTabs = this.elementRef.nativeElement.closest(
      "ggc-feature-info-tabs"
    );
    this.hasTabs = !!featureInfoTabs;
    if (this.autoConnect() && this.autoStartSelect()) {
      this.featureInfoMapConnectService.startSelect(
        { style: null } as any,
        this.mapIndex(),
        this.viewerType()
      );
    }
  }

  /**
   * Verwerkt de meegegeven templates na initialisatie van de content.
   * Ondersteunt custom templates voor headers, content, en verbergen van velden.
   */
  ngAfterContentInit(): void {
    const customHeaderValueTemplates = new Map(
      this.customHeaderValueTemplates()
    );
    const customValueTemplates = new Map(this.customValueTemplates());
    const hideEmptyFieldWithKeys = [...this.hideEmptyFieldWithKeys()];
    this.templates().forEach((template) => {
      const ggcTemplateKey = template.ggcTemplateKey();
      (Array.isArray(ggcTemplateKey)
        ? ggcTemplateKey
        : [ggcTemplateKey]
      ).forEach((templateKey) => {
        if (templateKey === undefined) return;

        switch (template.templateType()) {
          case ValueTemplateDirectiveType.HEADER:
            customHeaderValueTemplates.set(templateKey, template.templateRef);
            break;
          case ValueTemplateDirectiveType.CONTENT:
            customValueTemplates.set(templateKey, template.templateRef);
            break;
          case ValueTemplateDirectiveType.HIDE:
            customHeaderValueTemplates.set(templateKey, null);
            break;
          case ValueTemplateDirectiveType.HIDE_IF_EMPTY:
            if (!hideEmptyFieldWithKeys.includes(templateKey)) {
              hideEmptyFieldWithKeys.push(templateKey);
            }
            break;
        }
      });
    });
    this.customHeaderValueTemplates.set(customHeaderValueTemplates);
    this.customValueTemplates.set(customValueTemplates);
    this.hideEmptyFieldWithKeys.set(hideEmptyFieldWithKeys);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.subscriptionSelection) {
      this.subscriptionSelection.unsubscribe();
    }
  }

  /** Navigeer naar de vorige feature. */
  goToPreviousFeature(): void {
    if (this.hasPreviousFeature()) {
      this.currentFeatureIndex.set(this.currentFeatureIndex() - 1);
      this.setCurrentFeature();
    }
  }

  /** Navigeer naar de volgende feature. */
  goToNextFeature(): void {
    if (this.hasNextFeature()) {
      this.currentFeatureIndex.set(this.currentFeatureIndex() + 1);
      this.setCurrentFeature();
    }
  }

  /** Controleer of er een volgende feature beschikbaar is. */
  hasNextFeature(): boolean {
    const displayFeaturesProperties = this.displayFeaturesProperties();
    const length = displayFeaturesProperties
      ? displayFeaturesProperties.length
      : -1;
    if (length > 0) {
      return this.currentFeatureIndex() < length - 1;
    }
    return false;
  }

  /** Controleer of er een vorige feature beschikbaar is. */
  hasPreviousFeature(): boolean {
    const displayFeaturesProperties = this.displayFeaturesProperties();
    if (displayFeaturesProperties && displayFeaturesProperties.length > 1) {
      return this.currentFeatureIndex() > 0;
    }
    return false;
  }

  /**
   * Haal de properties uit een lijst van features.
   * @param features Een lijst van OpenLayers features of objecten.
   * @returns Een lijst van objecten met properties.
   */
  getPropertiesFromFeatures(
    features: Feature<Geometry>[] | object[]
  ): object[] {
    const arrayContainingFeatureProperties: object[] = [];
    features.forEach((feature) => {
      let properties;
      if (feature instanceof Feature) {
        properties = feature.getProperties();
      } else {
        properties = { ...feature };
      }

      // Remove the custom layerId property
      delete properties[GGC_FEATURE_LAYERID];
      arrayContainingFeatureProperties.push(properties);
    });
    return arrayContainingFeatureProperties;
  }

  /**
   * Bepaal of de paginering verborgen moet worden.
   * Wordt bepaald op basis van `hidePagerWithOneFeature` en aantal features.
   */
  hidePager(): boolean {
    return (
      this.hidePagerWithOneFeature() &&
      (this.displayFeaturesProperties() == undefined ||
        this.displayFeaturesProperties()!.length === 1)
    );
  }

  /**
   * Verwerkt het FeatureInfoEvent.
   *
   * @param event Het ontvangen FeatureInfoEvent
   */
  protected handleFeatureInfoEvent(event: FeatureInfoComponentEvent): void {
    // bijv. tab gewijzigd, data vernieuwen, etc.
    if (event.type === FeatureInfoComponentEventType.SELECTEDTAB) {
      const collection: FeatureCollectionForLayer = event.value;
      if (collection) {
        this.setFeatureInfoCollection(
          new FeatureInfoCollection(
            undefined,
            this.featureCollectionIsClustered(collection)
              ? declusterFeatures(collection.features)
              : collection.features,
            collection.layerTitle,
            collection.layerId
          )
        );
      } else {
        this.setFeatureInfoCollection(undefined);
      }
    }
  }

  private featureCollectionIsClustered(
    featureinfo: FeatureCollectionForLayer
  ): boolean {
    return featureinfo.features.some((feature) => {
      return typeof feature?.get === "function" && feature.get("features");
    });
  }

  /**
   * Zet de huidige feature en verstuur een event.
   * Wordt aangeroepen bij navigatie of initiële selectie.
   */
  private setCurrentFeature(): void {
    const displayFeaturesProperties = this.displayFeaturesProperties();
    this.currentFeature.set(
      displayFeaturesProperties
        ? displayFeaturesProperties[this.currentFeatureIndex()]
        : null
    );
    const featureInfoCollection = this.currentFeatureInfoCollection();
    const featureForEvent = featureInfoCollection
      ? featureInfoCollection.features[this.currentFeatureIndex()]
      : undefined;
    const featureInfoComponentEvent = new FeatureInfoComponentEvent(
      FeatureInfoComponentEventType.SELECTEDOBJECT,
      "Het huidige weergegeven object.",
      featureForEvent
    );
    this.highlightFeature(featureForEvent);
    this.events.emit(featureInfoComponentEvent);
  }

  /**
   * Highlight het opgegeven feature op de kaart.
   *
   * @param feature Feature dat gehighlight moet worden
   */
  private highlightFeature(feature: object | undefined): void {
    this.featureInfoMapConnectService.showHighlight(
      feature,
      this.mapIndex(),
      this.viewerType()
    );
  }

  /**
   * Verwerkt wijzigingen in de featureInfoCollection,
   * ongeacht of deze via een @Input of interne logica komen.
   */
  private handleFeatureInfoChanges(): void {
    const featureInfoCollection = this.currentFeatureInfoCollection();
    const customAttributeNamesAndValues = this.customAttributeNamesAndValues();
    if (featureInfoCollection) {
      if (customAttributeNamesAndValues) {
        this.featureInfoConfigService.setCustomFeatureInfo(
          customAttributeNamesAndValues
        );
      }
      const featuresProperties = this.getPropertiesFromFeatures(
        featureInfoCollection.features
      );
      this.displayFeaturesProperties.set(
        this.featureInfoConfigService.filterAndSortAttributes(
          featureInfoCollection.layerId,
          featuresProperties
        )
      );
    } else {
      this.displayFeaturesProperties.set(undefined);
    }

    const displayFeaturesProperties = this.displayFeaturesProperties();
    if (displayFeaturesProperties && displayFeaturesProperties.length > 0) {
      this.currentFeatureIndex.set(0);
      this.setCurrentFeature();
    } else {
      this.currentFeatureIndex.set(-1);
      this.currentFeature.set(null);
      this.events.emit(
        new FeatureInfoComponentEvent(
          FeatureInfoComponentEventType.SELECTEDOBJECT,
          "Het huidige weergegeven object.",
          undefined
        )
      );
    }

    this.pagerIsHidden.set(this.hidePager());
  }

  private subscribeToMapSelection(mapIndex: string, selectIndex?: string) {
    // Haal de meest recente selection op als deze bestaat
    this.featureInfoMapConnectService
      .getCurrentFeatureCollectionForMapSelection(
        this.viewerType(),
        mapIndex,
        selectIndex
      )
      .then((featureCollectionForCoordinate) => {
        if (this.destroyRef.destroyed) return;

        this.handleNewFeatureCollectionForCoordinate(
          featureCollectionForCoordinate,
          mapIndex
        );
      });
    // Wanneer FeatureInfoTabs aanwezig is dan wordt de
    // featureInfoCollection gezet via de tabs (hasTabs = true
    this.featureInfoMapConnectService
      .getObservableForMapSelection(this.viewerType(), mapIndex, selectIndex)
      .then((mapSelectionEvent) => {
        if (this.destroyRef.destroyed || this.hasTabs) {
          return;
        }
        this.subscriptionSelection = mapSelectionEvent
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((event: MapComponentEvent) => {
            if (
              event.type !==
              MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
            ) {
              return;
            }
            this.handleNewFeatureCollectionForCoordinate(event.value, mapIndex);
          });
      });
  }

  private handleNewFeatureCollectionForCoordinate(
    featureCollectionForCoordinate: FeatureCollectionForCoordinate | undefined,
    mapIndex: string
  ): void {
    const collections =
      featureCollectionForCoordinate?.featureCollectionForLayers;
    if (!collections || collections.length === 0) {
      this.featureInfoMapConnectService.clearHighlightLayer(
        this.viewerType(),
        mapIndex
      );
      this.setFeatureInfoCollection(undefined);
      return;
    }
    this.createNewFeatureCollection(collections);
  }

  private createNewFeatureCollection(
    collections: FeatureCollectionForLayer[]
  ): void {
    this.setFeatureInfoCollection(
      new FeatureInfoCollection(
        undefined,
        collections.flatMap((feature) =>
          this.featureCollectionIsClustered(feature)
            ? declusterFeatures(feature.features)
            : (feature.features ?? [])
        ),
        collections
          .map((layer) => layer.layerTitle)
          .filter((value) => value && value.trim().length > 0)
          .join(", "),
        collections
          .map((layer) => layer.layerId)
          .filter((value) => value && value.trim().length > 0)
          .join(", ")
      )
    );
  }

  private setFeatureInfoCollection(
    featureInfoCollection: FeatureInfoCollection | undefined
  ): void {
    this.currentFeatureInfoCollection.set(featureInfoCollection);
    this.handleFeatureInfoChanges();
  }
}
