import type { QueryList } from "@angular/core";
import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef
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
export class GgcFeatureInfoComponent implements OnChanges, AfterContentInit {
  /**
   * Verzameling van features en metadata die weergegeven moeten worden.
   * Bevat een `layerName` en een lijst van features (OpenLayers of plain objects).
   */
  @Input() featureInfoCollection: FeatureInfoCollection | undefined;

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
   * Map van veldnamen naar `CustomFeatureInfo` objecten.
   * Hiermee kunnen veldnamen en/of veldwaarden aangepast worden.
   */
  @Input() customAttributeNamesAndValues: Map<string, CustomFeatureInfo>;

  /**
   * Verberg velden die leeg zijn (null of lege string).
   * Default: `false`.
   */
  @Input() hideEmptyFields = false;

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

  @ContentChildren(ValueTemplateDirective)
  private readonly templates: QueryList<ValueTemplateDirective>;
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );

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

  /**
   * Reageert op wijzigingen in de input-properties.
   * Filtert en sorteert attributen via `FeatureInfoConfigService`.
   * Stuurt een event bij selectie van een object.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes.featureInfoCollection ||
      changes.customAttributeNamesAndValues
    ) {
      if (!this.featureInfoCollection) {
        this.displayFeaturesProperties = undefined;
      } else {
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
    this.events.next(featureInfoComponentEvent);
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
      if (feature instanceof Feature) {
        arrayContainingFeatureProperties.push(feature.getProperties());
      } else {
        arrayContainingFeatureProperties.push(feature);
      }
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
      this.displayFeaturesProperties !== undefined &&
      this.displayFeaturesProperties.length === 1
    );
  }
}
