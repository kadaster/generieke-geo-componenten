import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  signal
} from "@angular/core";
import { GgcFeatureInfoConfigService } from "../service/ggc-feature-info-config.service";
import { FeatureInfoKeyValue } from "./feature-info-key-value";
import { FeatureInfoDisplayType } from "./feature-info-display-type";
import { NgTemplateOutlet } from "@angular/common";
import { FeatureKeysPipe } from "../pipe/keys.pipe";

@Component({
  selector: "ggc-feature-info-display",
  templateUrl: "./feature-info-display.component.html",
  styleUrls: ["./feature-info-display.component.css"],
  imports: [NgTemplateOutlet, FeatureKeysPipe]
})
export class FeatureInfoDisplayComponent implements OnInit, OnChanges {
  type = input<FeatureInfoDisplayType>(FeatureInfoDisplayType.TABLE);
  currentFeature = input<{ [key: string]: any } | null>(null);
  hideEmptyFields = input<boolean>(false);
  headerValueTemplates = input<Map<string, TemplateRef<any> | null>>(new Map());
  contentValueTemplates = input<Map<string, TemplateRef<any>>>(new Map());
  hideEmptyFieldWithKeys = input<string[]>([]);

  protected readonly displayFeature = signal<{ [key: string]: any }>({});
  protected readonly objectKeys = signal<string[]>([]);
  protected readonly featureInfoDisplayTypeEnum = FeatureInfoDisplayType;

  private readonly featureInfoConfigService = inject(
    GgcFeatureInfoConfigService
  );

  ngOnInit() {
    this.prepareForDisplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentFeature && !changes.currentFeature.firstChange) {
      this.prepareForDisplay();
    }

    const doc = globalThis.document;
    if (!doc) {
      return;
    }

    setTimeout(() => {
      doc.querySelectorAll("table.ggc-fi-table tr").forEach(function (row) {
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
    const objectKeys = FeatureInfoKeyValue.objectKeys(
      this.currentFeature() as { [key: string]: any },
      this.hideEmptyFields(),
      this.hideEmptyFieldWithKeys()
    );
    this.objectKeys.set(objectKeys);
    this.displayFeature.set(
      this.featureInfoConfigService.checkForCustomValues(
        this.currentFeature() as { [key: string]: any },
        objectKeys
      )
    );
  }
}
