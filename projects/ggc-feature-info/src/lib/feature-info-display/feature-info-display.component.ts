import {
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef
} from "@angular/core";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoKeyValue } from "./feature-info-key-value";
import { FeatureInfoDisplayType } from "./feature-info-display-type";
import {
  NgSwitch,
  NgSwitchCase,
  NgFor,
  NgIf,
  NgTemplateOutlet
} from "@angular/common";
import { FeatureKeysPipe } from "../pipe/keys.pipe";

@Component({
  selector: "ggc-feature-info-display",
  templateUrl: "./feature-info-display.component.html",
  styleUrls: ["./feature-info-display.component.css"],
  imports: [
    NgSwitch,
    NgSwitchCase,
    NgFor,
    NgIf,
    NgTemplateOutlet,
    FeatureKeysPipe
  ]
})
export class FeatureInfoDisplayComponent implements OnInit, OnChanges {
  @Input() type: FeatureInfoDisplayType = FeatureInfoDisplayType.TABLE;
  @Input() currentFeature: { [key: string]: any };
  @Input() hideEmptyFields: boolean;
  @Input() headerValueTemplates: Map<string, TemplateRef<any>> = new Map();
  @Input() contentValueTemplates: Map<string, TemplateRef<any>> = new Map();
  @Input() hideEmptyFieldWithKeys: string[] = [];

  protected displayFeature: { [key: string]: any };
  protected objectKeys: string[];
  protected featureInfoDisplayTypeEnum = FeatureInfoDisplayType;

  private featureInfoConfigService = inject(GgcFeatureInfoConfigService);

  ngOnInit() {
    this.prepareForDisplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentFeature && !changes.currentFeature.firstChange) {
      this.prepareForDisplay();
    }
    setTimeout(() => {
      document
        .querySelectorAll("table.ggc-fi-table tr")
        .forEach(function (row) {
          (row as HTMLElement).style.display = "";
          const tds = row.querySelectorAll("td");
          if (tds.length > 0) {
            const allEmpty = Array.from(tds).every(
              (td) => td?.textContent?.trim()?.length === 0
            );
            if (allEmpty) {
              (row as HTMLElement).style.display = "none";
            }
          }
        });
    }, 50);
  }

  prepareForDisplay() {
    this.objectKeys = FeatureInfoKeyValue.objectKeys(
      this.currentFeature,
      this.hideEmptyFields,
      this.hideEmptyFieldWithKeys
    );
    this.displayFeature = this.featureInfoConfigService.checkForCustomValues(
      this.currentFeature,
      this.objectKeys
    );
  }
}
