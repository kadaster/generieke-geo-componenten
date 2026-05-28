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
  SimpleChanges,
  TemplateRef
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
  MapComponentEventTypes
} from "@kadaster/ggc-models";
import { FeatureInfoMapConnectService } from "../service/feature-info-map-connect.service";
import { FeatureInfoEventService } from "../service/feature-info-event.service";

@Component({
  selector: "ggc-feature-info-tabs",
  templateUrl: "./ggc-feature-info-tabs.component.html",
  styleUrls: ["./ggc-feature-info-tabs.component.css"],
  imports: [NgClass, NgTemplateOutlet]
})
export class GgcFeatureInfoTabsComponent
  implements OnInit, OnChanges, AfterContentInit
{
  /** Unieke naam/index van de kaart waarvoor Feature Info getoond moet worden */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;
  @Input() featureInfoCollectionArray: FeatureInfoCollection[];
  @Input() showEmptyTabs = false; // default = false, lege tabbladen worden default niet getoond
  @Input() ariaLabelledBy?: string; // if not provided, uses ariaLabel
  @Input() ariaLabel = "feature-info"; // if both ariaLabelled and ariaLabel not provided, use default "feature-info"
  @Output() events: EventEmitter<FeatureInfoComponentEvent> =
    new EventEmitter<FeatureInfoComponentEvent>();
  protected tabComponent?: TemplateRef<any>;

  protected featureInfoCollectionArrayInternal: FeatureInfoCollection[];
  protected selectedTab: string;
  private readonly featureInfoMapConnectService = inject(
    FeatureInfoMapConnectService
  );
  @ContentChild(ValueTemplateDirective, { descendants: false })
  private tabTemplate: ValueTemplateDirective;
  private selectedTabFeatureInfo: FeatureInfoCollection | undefined;
  private lastSelectedTabOnClick: string;
  private featureInfoConfigService = inject(GgcFeatureInfoConfigService);
  private eventService = inject(FeatureInfoEventService);

  ngAfterContentInit(): void {
    if (this.tabTemplate) {
      this.tabComponent = this.tabTemplate.templateRef;
    }
  }

  ngOnInit() {
    void this.subscribeToMapSelection(this.mapIndex);
    //this.onDataUpdate();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.featureInfoCollectionArray) {
      this.onDataUpdate();
    }
  }

  onTabClicked(tab: string): void {
    this.lastSelectedTabOnClick = tab;
    this.setActiveTab(tab);
  }

  private onDataUpdate(): void {
    console.log("UPDATE", this.featureInfoCollectionArray);
    // create copy of featureInfoCollectionArray and check empty tabs
    this.featureInfoCollectionArrayInternal = !this.featureInfoCollectionArray
      ? []
      : [...this.featureInfoCollectionArray];
    this.checkShowEmptyTabs();
    console.log(this.featureInfoCollectionArrayInternal);
    if (this.featureInfoCollectionArrayInternal.length === 0) {
      const event = new FeatureInfoComponentEvent(
        FeatureInfoComponentEventType.SELECTEDTAB,
        "Het huidige weergegeven tabblad.",
        undefined
      );

      this.eventService.emit(event);
      this.events.emit(event);
    } else {
      // this.featureInfoCollectionArrayInternal.length > 0
      this.featureInfoConfigService.sortTabs(
        this.featureInfoCollectionArrayInternal
      );
      this.setActiveTab(this.lastSelectedTabOnClick);
    }
  }

  private setActiveTab(layerName: string): void {
    console.log("setActiveTab", layerName);
    let idx = this.featureInfoCollectionArrayInternal.findIndex(
      (tabFeatureInfo) => tabFeatureInfo.layerName === layerName
    );
    if (idx === -1) {
      idx = 0;
    }
    this.selectedTabFeatureInfo = this.featureInfoCollectionArrayInternal[idx];
    this.selectedTab = this.selectedTabFeatureInfo.layerName;
    const event = new FeatureInfoComponentEvent(
      FeatureInfoComponentEventType.SELECTEDTAB,
      "Het huidige weergegeven tabblad.",
      this.selectedTabFeatureInfo
    );
    this.eventService.emit(event);
    this.events.emit(event);
  }

  private checkShowEmptyTabs(): void {
    if (!this.showEmptyTabs) {
      this.featureInfoCollectionArrayInternal =
        this.featureInfoCollectionArrayInternal.filter(
          (tabFeatureInfo: FeatureInfoCollection) => {
            return tabFeatureInfo.features.length > 0;
          }
        );
    }
  }

  private async subscribeToMapSelection(mapIndex: string) {
    const mapSelectionEvent =
      await this.featureInfoMapConnectService.getObservableForMapSelection(
        mapIndex
      );
    console.log("SUBSCRIBE");
    mapSelectionEvent.subscribe((event: MapComponentEvent) => {
      if (
        event.type === MapComponentEventTypes.SELECTIONSERVICE_SELECTIONUPDATED
      ) {
        this.featureInfoCollectionArray =
          event.value.featureCollectionForLayers;
        this.onDataUpdate();
        console.log(event);
      }
    });
  }
}
