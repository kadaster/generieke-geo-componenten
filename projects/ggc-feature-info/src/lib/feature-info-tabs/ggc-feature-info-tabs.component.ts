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

@Component({
  selector: "ggc-feature-info-tabs",
  templateUrl: "./ggc-feature-info-tabs.component.html",
  styleUrls: ["./ggc-feature-info-tabs.component.css"],
  imports: [NgClass, NgTemplateOutlet]
})
export class GgcFeatureInfoTabsComponent
  implements OnInit, OnChanges, AfterContentInit
{
  @Input() featureInfoCollectionArray: FeatureInfoCollection[];
  @Input() showEmptyTabs = false; // default = false, lege tabbladen worden default niet getoond
  @Input() ariaLabelledBy?: string; // if not provided, uses ariaLabel
  @Input() ariaLabel = "feature-info"; // if both ariaLabelled and ariaLabel not provided, use default "feature-info"
  @Output() events: EventEmitter<FeatureInfoComponentEvent> =
    new EventEmitter<FeatureInfoComponentEvent>();
  protected tabComponent?: TemplateRef<any>;

  protected featureInfoCollectionArrayInternal: FeatureInfoCollection[];
  protected selectedTab: string;

  @ContentChild(ValueTemplateDirective, { descendants: false })
  private tabTemplate: ValueTemplateDirective;
  private selectedTabFeatureInfo: FeatureInfoCollection | undefined;
  private lastSelectedTabOnClick: string;
  private featureInfoConfigService = inject(GgcFeatureInfoConfigService);

  ngAfterContentInit(): void {
    if (this.tabTemplate) {
      this.tabComponent = this.tabTemplate.templateRef;
    }
  }

  ngOnInit() {
    this.onDataUpdate();
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
    // create copy of featureInfoCollectionArray and check empty tabs
    this.featureInfoCollectionArrayInternal = !this.featureInfoCollectionArray
      ? []
      : [...this.featureInfoCollectionArray];
    this.checkShowEmptyTabs();

    if (this.featureInfoCollectionArrayInternal.length === 0) {
      this.events.emit(
        new FeatureInfoComponentEvent(
          FeatureInfoComponentEventType.SELECTEDTAB,
          "Het huidige weergegeven tabblad.",
          undefined
        )
      );
    } else {
      // this.featureInfoCollectionArrayInternal.length > 0
      this.featureInfoConfigService.sortTabs(
        this.featureInfoCollectionArrayInternal
      );
      this.setActiveTab(this.lastSelectedTabOnClick);
    }
  }

  private setActiveTab(layerName: string): void {
    let idx = this.featureInfoCollectionArrayInternal.findIndex(
      (tabFeatureInfo) => tabFeatureInfo.layerName === layerName
    );
    if (idx === -1) {
      idx = 0;
    }
    this.selectedTabFeatureInfo = this.featureInfoCollectionArrayInternal[idx];
    this.selectedTab = this.selectedTabFeatureInfo.layerName;
    this.events.emit(
      new FeatureInfoComponentEvent(
        FeatureInfoComponentEventType.SELECTEDTAB,
        "Het huidige weergegeven tabblad.",
        this.selectedTabFeatureInfo
      )
    );
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
}
