import {
  AfterContentInit,
  Component,
  ContentChild,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  TemplateRef,
  OnDestroy
} from "@angular/core";
import { ValueTemplateDirective } from "../directive/value-template.directive";
import { FeatureInfoCollection } from "../model/feature-info-collection.model";
import {
  FeatureInfoComponentEvent,
  FeatureInfoComponentEventType
} from "../model/feature-info-component-event";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import {
  DEFAULT_MAPINDEX,
  MapComponentEvent,
  MapComponentEventTypes,
  ViewerType
} from "@kadaster/ggc-models";
import { FeatureInfoMapConnectService } from "../service/feature-info-map-connect.service";
import { FeatureInfoEventService } from "../service/feature-info-event.service";
import { Subscription } from "rxjs";

/**
 * Component voor het weergeven van feature-informatie in tabbladen.
 *
 * @remarks
 * Door `<ggc-feature-info-tabs></ggc-feature-info-tabs>` op te nemen in de HTML
 * kan de tabbladenfunctionaliteit worden gebruikt.
 *
 * Binnen deze tags kan worden gespecificeerd hoe de tabbladen worden gevuld
 * en welke content per tabblad wordt weergegeven.
 *
 * Initieel wordt het eerste tabblad geselecteerd. Daarna onthoudt de component
 * welk tabblad als laatste door de gebruiker is geselecteerd: bij nieuwe data
 * wordt dit tabblad opnieuw geselecteerd, en als dat tabblad niet meer aanwezig
 * is in de nieuwe data, wordt weer het eerste tabblad geselecteerd.
 *
 * Via een `<ng-template [ggcTemplateKey]>` kan een custom component als label
 * voor het tabblad gebruikt worden. In het template zijn de variabelen
 * `layerTitle` (de weergavenaam van de tab) en `active` (of de tab actief is)
 * beschikbaar.
 *
 * @example
 * <ggc-feature-info-tabs
 *   [featureInfoCollectionArray]="featureInfoCollectionArray"
 *   (events)="handleTabEvent($event)"
 * >
 *   <ng-template [ggcTemplateKey]="" let-value="layerTitle" let-active="active">
 *     <app-feature-info-tabs [tab]="value" [active]="active"></app-feature-info-tabs>
 *   </ng-template>
 *   <ggc-feature-info
 *     (events)="handleEvent($event)"
 *     [featureInfoCollection]="featureCollectionFromSelectedTab"
 *   >
 *   </ggc-feature-info>
 * </ggc-feature-info-tabs>
 */
@Component({
  selector: "ggc-feature-info-tabs",
  templateUrl: "./ggc-feature-info-tabs.component.html",
  styleUrls: ["./ggc-feature-info-tabs.component.css"],
  imports: [NgClass, NgTemplateOutlet]
})
export class GgcFeatureInfoTabsComponent
  implements OnInit, OnChanges, AfterContentInit, OnDestroy
{
  /** Unieke naam/index van de kaart waarvoor Feature Info getoond moet worden
   * Een 3D viewer maakt geen gebruikt van een mapIndex, dus die kan dan worden leeggelaten.
   * Wel kan een 3D viewer gebruik maken van een selectIndex, netzoals een 2D viewer.
   * */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;
  /** Unieke naam/index van de selectie index waarvoor Feature Info getoond moet worden, indien opgegeven.
   *  Feature-info zal in dit geval luisteren naar de select interactie waar de mapIndex en selectIndex overeenkomt.
   *  Als selectIndex undefined is, dan wordt alleen naar de mapIndex gekeken.
   */
  @Input() selectIndex: string | undefined = undefined;
  /**
   * Verzameling van features en metadata die weergegeven moeten worden.
   * Bevat een layerTitle, layerId en een lijst van features (OpenLayers of plain objects).
   */
  @Input() featureInfoCollectionArray: FeatureInfoCollection[];
  /**
   * Bepaalt of tabbladen zonder inhoud zichtbaar moeten zijn.
   *
   * @remarks
   * Standaardwaarde: `false`.
   *
   * Wanneer ingesteld op `true`, worden tabbladen zonder inhoud
   * (d.w.z. met een lege `features`-array) toch weergegeven.
   * Bij `false` worden deze tabbladen verborgen.
   */
  @Input() showEmptyTabs = false;

  /**
   * Verwijst naar het element (via ID) dat het label levert voor deze component.
   *
   * @remarks
   * Indien niet opgegeven, wordt {@link ariaLabel} gebruikt als fallback.
   */
  @Input() ariaLabelledBy?: string;

  /**
   * Direct aria-label voor de component.
   *
   * @remarks
   * Standaardwaarde: `"feature-info"`.
   *
   * Wordt gebruikt wanneer {@link ariaLabelledBy} niet is opgegeven.
   * Als beide niet zijn ingesteld, wordt de standaardwaarde `"feature-info"` gebruikt.
   */
  @Input() ariaLabel = "feature-info";

  /**
   * Bepaalt of events automatisch intern worden afgehandeld binnen de component.
   *
   * @remarks
   * Standaardwaarde: `true`.
   *
   * Wanneer ingesteld op `true`, verwerkt de component de events zelf.
   * Bij `false` worden de events niet intern afgehandeld en wordt verwacht
   * dat de parent-component deze afhandeling verzorgt.
   */
  @Input() autoConnect = true;
  /**
   * Geeft aan of dit feature info component gebruikt wordt voor 2D of 3D kaart.
   */
  @Input() viewerType = ViewerType.TWEE_D;
  /**
   * Verplicht output-event voor alle gebeurtenissen afkomstig van de tabbladenfunctionaliteit.
   *
   * @remarks
   * Emit een {@link FeatureInfoComponentEvent} dat gebruikt kan worden
   * om feature-informatie te tonen via het feature-informatiecomponent, wanneer
   * bijvoorbeeld de autoconnect op false is gezet.
   *
   * De consumer van dit event dient een handler te definiëren met `$event` als parameter.
   *
   * Events worden in de volgende gevallen uitgezonden:
   * - Wanneer een ander tabblad wordt geselecteerd
   * - Wanneer de `featureInfoCollectionArray` `undefined` is
   *   (in dit geval is de `value` van het event ook `undefined`)
   */
  @Output() events: EventEmitter<FeatureInfoComponentEvent> =
    new EventEmitter<FeatureInfoComponentEvent>();
  protected tabComponent?: TemplateRef<any>;

  protected featureInfoCollectionArrayInternal = signal<
    FeatureInfoCollection[]
  >([]);
  protected selectedTab = signal<string | undefined>(undefined);
  private readonly featureInfoMapConnectService = inject(
    FeatureInfoMapConnectService
  );
  @ContentChild(ValueTemplateDirective, { descendants: false })
  private readonly tabTemplate: ValueTemplateDirective;
  private readonly selectedTabFeatureInfo = signal<
    FeatureInfoCollection | undefined
  >(undefined);
  private readonly lastSelectedTabOnClick = signal<string | undefined>(
    undefined
  );
  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );
  private readonly eventService = inject(FeatureInfoEventService);
  private subscriptionSelection: Subscription;

  ngAfterContentInit(): void {
    if (this.tabTemplate) {
      this.tabComponent = this.tabTemplate.templateRef;
    }
  }

  ngOnInit() {
    if (this.autoConnect) {
      this.subscribeToMapSelection(this.mapIndex);
    } else {
      this.onDataUpdate();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.featureInfoCollectionArray) {
      this.onDataUpdate();
    }
  }

  ngOnDestroy() {
    this.subscriptionSelection?.unsubscribe();
  }

  /**
   * Set the active tab
   * @param tab the new active tab
   */
  onTabClicked(tab: string): void {
    this.lastSelectedTabOnClick.set(tab);
    this.setActiveTab(tab);
  }

  private onDataUpdate(): void {
    // create copy of featureInfoCollectionArray and check empty tabs
    this.featureInfoCollectionArrayInternal.set(
      this.featureInfoCollectionArray
        ? [...this.featureInfoCollectionArray]
        : []
    );
    this.checkShowEmptyTabs();
    if (this.featureInfoCollectionArrayInternal().length === 0) {
      const event = new FeatureInfoComponentEvent(
        FeatureInfoComponentEventType.SELECTEDTAB,
        "Het huidige weergegeven tabblad.",
        undefined
      );
      this.featureInfoMapConnectService.clearHighlightLayer(
        this.viewerType,
        this.mapIndex
      );
      this.eventService.emit(event);
      this.events.emit(event);
    } else {
      this.featureInfoConfigService.sortTabs(
        this.featureInfoCollectionArrayInternal()
      );
      this.setActiveTab(this.lastSelectedTabOnClick() as string);
    }
  }

  private setActiveTab(layerId: string): void {
    let idx = this.featureInfoCollectionArrayInternal().findIndex(
      (tabFeatureInfo) => tabFeatureInfo.layerId === layerId
    );
    if (idx === -1) {
      idx = 0;
    }
    this.selectedTabFeatureInfo.set(
      this.featureInfoCollectionArrayInternal()[idx]
    );
    this.selectedTab.set(this.selectedTabFeatureInfo()?.layerId);
    const event = new FeatureInfoComponentEvent(
      FeatureInfoComponentEventType.SELECTEDTAB,
      "Het huidige weergegeven tabblad.",
      this.selectedTabFeatureInfo()
    );
    this.eventService.emit(event);
    this.events.emit(event);
  }

  private checkShowEmptyTabs(): void {
    if (!this.showEmptyTabs) {
      this.featureInfoCollectionArrayInternal.set(
        this.featureInfoCollectionArrayInternal().filter(
          (tabFeatureInfo: FeatureInfoCollection) => {
            return tabFeatureInfo.features.length > 0;
          }
        )
      );
    }
  }

  private subscribeToMapSelection(mapIndex: string) {
    this.featureInfoMapConnectService
      .getObservableForMapSelection(this.viewerType, mapIndex, this.selectIndex)
      .then((observable) => {
        this.subscriptionSelection = observable.subscribe(
          (event: MapComponentEvent) => {
            if (
              event.type ===
              MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
            ) {
              this.featureInfoCollectionArray =
                event.value.featureCollectionForLayers;
              this.onDataUpdate();
            }
          }
        );
      });
  }
}
