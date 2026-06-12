import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  TemplateRef,
  AfterViewInit,
  OnDestroy,
  QueryList
} from "@angular/core";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import {
  ValueTemplateDirective,
  ValueTemplateDirectiveType
} from "../directive/value-template.directive";
import { FeatureInfoDisplayType } from "../feature-info-display/feature-info-display-type";
import { CustomFeatureInfo } from "../model/custom-feature-info.model";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoDisplayComponent } from "../feature-info-display/feature-info-display.component";
import { FeatureInfoMapConnectService } from "../service/feature-info-map-connect.service";
import {
  DEFAULT_MAPINDEX,
  FeatureCollectionForLayer,
  GGC_FEATURE_LAYERID,
  MapComponentEvent,
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import { Subscription } from "rxjs";
import { FeatureInfoEventService } from "../service/feature-info-event.service";

/**
 * Het `FeatureInfoComponent` toont feature-informatie afkomstig uit kaartlagen
 * zoals WMTS, WMS en GeoJSON via GetFeatureInfo requests.
 *
 * Ondersteunt weergave in lijst of tabelvorm, paginering, custom templates,
 * en configuratie van attributen via `FeatureInfoConfigService`.
 *
 * @example
 * <ggc-feature-info
 *   [featureInfoCollection]="dataFeatureInfoFromTab"
 *   [featureInfoDisplayType]="featureInfoDisplayType.LIST"
 *   [customAttributeNamesAndValues]="customFeatureInfoMap"
 *   (events)="handleEvent($event)">
 * </ggc-feature-info>
 */
@Component({
  selector: "ggc-feature-info",
  templateUrl: "./ggc-feature-info.component.html",
  styleUrls: ["./ggc-feature-info.component.css"],
  imports: [FeatureInfoDisplayComponent]
})
export class GgcFeatureInfoComponent
  implements AfterContentInit, OnInit, AfterViewInit, OnDestroy
{
  /** Unieke naam/index van de kaart waarvoor Feature Info getoond moet worden */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  /** Unieke naam/index van de selectie index waarvoor Feature Info getoond moet worden, indien opgegeven.
   *  Feature-info zal in dit geval luisteren naar de select interactie waar de mapIndex en selectIndex overeenkomt.
   *  Als selectIndex undefined is, dan wordt alleen naar de mapIndex gekeken.
   */
  @Input() selectIndex: string | undefined = undefined;

  /**
   * Geeft aan of een message moet worden getoond ("Geen informatie beschikbaar") wanneer er geen data is.
   * Default: `true`.
   */
  @Input() showEmptyMessage = true;

  /**
   * Type weergave voor de feature-informatie: lijst of tabel.
   * Default: `FeatureInfoDisplayType.TABLE`.
   */
  @Input() featureInfoDisplayType: FeatureInfoDisplayType =
    FeatureInfoDisplayType.TABLE;

  /**
   * Verberg de paginering als er slechts één feature is.
   * Default: `false`.
   */
  @Input() hidePagerWithOneFeature = false;

  /**
   * Tekst voor de knop om naar de vorige feature te gaan.
   * Default: `"<"`.
   */
  @Input() pagerPrevious = "<";

  /**
   * Tekst voor de knop om naar de volgende feature te gaan.
   * Default: `">"`.
   */
  @Input() pagerNext = ">";
  /**
   * Verberg velden die leeg zijn (null of lege string).
   * Default: `false`.
   */
  @Input() hideEmptyFields = false;
  /**
   * Maak gebruik van auto-connect functionaliteit,
   * auto-connect zorgt ervoor dat er automatische op
   * het selection updated event wordt gereageerd en dat
   * het actieve feature wordt gehighlighted.
   * Default: `true`.
   */
  @Input() autoConnect = true;
  /**
   * Wanneer false, dan start de feature-info niet automatisch de selection interaction.
   * De feature-info blijft wel luisteren naar events op de opgegeven mapIndex/selectIndex en doet de betreffende highlighting.
   * Met deze optie kan de afnemer zelf de select interactie starten met de gewenste parameters.
   */
  @Input() autoStartSelect = true;
  /**
   * EventEmitter voor het versturen van component-gerelateerde events.
   * Stuurt `FeatureInfoComponentEvent` bij selectie van een object.
   */
  @Output() events = new EventEmitter<FeatureInfoComponentEvent>();
  protected customHeaderValueTemplates: Map<string, TemplateRef<any> | null> =
    new Map();
  protected customValueTemplates: Map<string, TemplateRef<any>> = new Map();
  protected hideEmptyFieldWithKeys: string[] = [];
  protected displayFeaturesProperties: object[] | undefined;
  protected pagerIsHidden: boolean;
  protected currentFeatureIndex = 0;
  protected currentFeature: object | null;
  protected emptyInfo = "Geen informatie beschikbaar";
  private readonly featureInfoMapConnectService = inject(
    FeatureInfoMapConnectService
  );
  private hasTabs = true;
  private subscription: Subscription;
  private subscriptionSelection: Subscription;
  private readonly eventService = inject(FeatureInfoEventService);
  @ContentChildren(ValueTemplateDirective)
  private readonly templates: QueryList<ValueTemplateDirective>;
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );
  /**
   * Referentie naar het host element van dit component.
   * Wordt gebruikt om in de DOM te zoeken naar GGC webcomponents.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private _featureInfoCollection: FeatureInfoCollection | undefined;

  get featureInfoCollection(): FeatureInfoCollection | undefined {
    return this._featureInfoCollection;
  }

  /**
   * Verzameling van features en metadata die weergegeven moeten worden.
   * Bevat een `layerName` en een lijst van features (OpenLayers of plain objects).
   */
  @Input()
  set featureInfoCollection(value: FeatureInfoCollection | undefined) {
    this._featureInfoCollection = value;
    this.handleFeatureInfoChanges();
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private _customAttributeNamesAndValues?: Map<string, CustomFeatureInfo>;

  get customAttributeNamesAndValues():
    | Map<string, CustomFeatureInfo>
    | undefined {
    return this._customAttributeNamesAndValues;
  }

  /**
   * Map van een koppeling van veldnamen naar `CustomFeatureInfo` objecten,
   * in de vorm van een customAttributeName en/of customAttributeValueFunction.
   * Hiermee kunnen veldnamen en/of veldwaarden aangepast worden.
   */
  @Input()
  set customAttributeNamesAndValues(
    value: Map<string, CustomFeatureInfo> | undefined
  ) {
    this._customAttributeNamesAndValues = value;
    this.handleFeatureInfoChanges();
  }

  /**
   * FeatureInfoEvent afkomstig van ggc-feature-info-tabs.
   */
  @Input()
  set featureInfoEvent(event: FeatureInfoComponentEvent | undefined) {
    if (!event) {
      return;
    }
    this.handleFeatureInfoEvent(event);
  }

  ngOnInit() {
    if (this.autoConnect) {
      this.subscribeToMapSelection(this.mapIndex, this.selectIndex);
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
    if (this.autoConnect && this.autoStartSelect) {
      this.featureInfoMapConnectService.startSelect(
        { style: null } as any,
        this.mapIndex
      );
    }
  }

  /**
   * Verwerkt de meegegeven templates na initialisatie van de content.
   * Ondersteunt custom templates voor headers, content, en verbergen van velden.
   */
  ngAfterContentInit(): void {
    this.templates.forEach((template) => {
      (Array.isArray(template.ggcTemplateKey)
        ? template.ggcTemplateKey
        : [template.ggcTemplateKey]
      ).forEach((templateKey) => {
        switch (template.templateType) {
          case ValueTemplateDirectiveType.HEADER:
            this.customHeaderValueTemplates.set(
              templateKey,
              template.templateRef
            );
            break;
          case ValueTemplateDirectiveType.CONTENT:
            this.customValueTemplates.set(templateKey, template.templateRef);
            break;
          case ValueTemplateDirectiveType.HIDE:
            this.customHeaderValueTemplates.set(templateKey, null);
            break;
          case ValueTemplateDirectiveType.HIDE_IF_EMPTY:
            if (!this.hideEmptyFieldWithKeys.includes(templateKey)) {
              this.hideEmptyFieldWithKeys.push(templateKey);
            }
            break;
        }
      });
    });
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
      this.currentFeatureIndex--;
      this.setCurrentFeature();
    }
  }

  /** Navigeer naar de volgende feature. */
  goToNextFeature(): void {
    if (this.hasNextFeature()) {
      this.currentFeatureIndex++;
      this.setCurrentFeature();
    }
  }

  /** Controleer of er een volgende feature beschikbaar is. */
  hasNextFeature(): boolean {
    const length = this.displayFeaturesProperties
      ? this.displayFeaturesProperties.length
      : -1;
    if (length > 0) {
      return this.currentFeatureIndex < length - 1;
    }
    return false;
  }

  /** Controleer of er een vorige feature beschikbaar is. */
  hasPreviousFeature(): boolean {
    if (
      this.displayFeaturesProperties &&
      this.displayFeaturesProperties.length > 1
    ) {
      return this.currentFeatureIndex > 0;
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
      this.hidePagerWithOneFeature &&
      this.displayFeaturesProperties?.length === 1
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
      this.featureInfoCollection = event.value;
    }
  }

  /**
   * Zet de huidige feature en verstuur een event.
   * Wordt aangeroepen bij navigatie of initiële selectie.
   */
  private setCurrentFeature(): void {
    this.currentFeature = this.displayFeaturesProperties
      ? this.displayFeaturesProperties[this.currentFeatureIndex]
      : null;
    const featureForEvent = this.featureInfoCollection
      ? this.featureInfoCollection.features[this.currentFeatureIndex]
      : undefined;
    const featureInfoComponentEvent = new FeatureInfoComponentEvent(
      FeatureInfoComponentEventType.SELECTEDOBJECT,
      "Het huidige weergegeven object.",
      featureForEvent
    );
    this.highlightFeature(featureForEvent);
    this.events.next(featureInfoComponentEvent);
  }

  /**
   * Highlight het opgegeven feature op de kaart.
   *
   * @param feature Feature dat gehighlight moet worden
   */
  private highlightFeature(feature: object | undefined): void {
    this.featureInfoMapConnectService.showHighlight(feature, this.mapIndex);
  }

  /**
   * Verwerkt wijzigingen in de featureInfoCollection,
   * ongeacht of deze via een @Input of interne logica komen.
   */
  private handleFeatureInfoChanges(): void {
    if (this.featureInfoCollection) {
      if (this.customAttributeNamesAndValues) {
        this.featureInfoConfigService.setCustomFeatureInfo(
          this.customAttributeNamesAndValues
        );
      }
      const featuresProperties = this.getPropertiesFromFeatures(
        this.featureInfoCollection.features
      );
      this.displayFeaturesProperties =
        this.featureInfoConfigService.filterAndSortAttributes(
          this.featureInfoCollection.layerName,
          featuresProperties
        );
    } else {
      this.displayFeaturesProperties = undefined;
    }

    if (
      this.displayFeaturesProperties &&
      this.displayFeaturesProperties.length > 0
    ) {
      this.currentFeatureIndex = 0;
      this.setCurrentFeature();
    } else {
      this.currentFeatureIndex = -1;
      this.currentFeature = null;
      this.events.next(
        new FeatureInfoComponentEvent(
          FeatureInfoComponentEventType.SELECTEDOBJECT,
          "Het huidige weergegeven object.",
          undefined
        )
      );
    }

    this.pagerIsHidden = this.hidePager();
  }

  private subscribeToMapSelection(
    mapIndex: string,
    selectIndex?: string
  ): void {
    // Wanneer FeatureInfoTabs aanwezig is dan wordt de
    // featureInfoCollection gezet via de tabs (hasTabs = true
    this.featureInfoMapConnectService
      .getObservableForMapSelection(mapIndex, selectIndex)
      .then((mapSelectionEvent) => {
        if (this.hasTabs) {
          return;
        }

        this.subscriptionSelection = mapSelectionEvent.subscribe(
          (event: MapComponentEvent) => {
            if (
              event.type !==
              MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
            ) {
              return;
            }

            const collections: FeatureCollectionForLayer[] =
              event.value.featureCollectionForLayers;

            if (!collections || collections.length === 0) {
              this.featureInfoMapConnectService.clearHighlightLayer(mapIndex);
              this.featureInfoCollection = undefined;
              return;
            }

            this.featureInfoCollection = new FeatureInfoCollection(
              collections
                .map(
                  (layer) =>
                    layer.layerTitle || layer.layerName || layer.layerId
                )
                .filter((value) => value && value.trim().length > 0)
                .join(", "),
              collections.flatMap((layer) => layer.features ?? [])
            );
          }
        );
      });
  }
}
