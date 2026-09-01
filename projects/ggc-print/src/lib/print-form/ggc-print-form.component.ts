import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule
} from "@angular/forms";
import { Coordinate } from "ol/coordinate";
import { StyleLike } from "ol/style/Style";
import { AttributesControlService } from "../core/attributes/attributes-control.service";
import { ProcessCapabilitiesService } from "../core/capabilities/process-capabilities.service";
import { GgcMapfishInteractionService } from "../core/mapfish-interaction/ggc-mapfish-interaction.service";
import { PrintConfigService } from "../core/print-config/print-config.service";
import { PrintPreviewService } from "../core/print-preview/print-preview.service";
import { Attribute } from "../model/capabilities/attribute";
import { Capabilities } from "../model/capabilities/capabilities";
import { Template } from "../model/component/template";
import { PrintConfig } from "../model/config/print-config.model";
import { PrintComponentEvent } from "../model/print-component-event.model";
import { GgcPrintError, GgcPrintErrorTypes } from "../model/print-error.model";
import { SubscriptionLike } from "rxjs";
import { MapfishStyleV2 } from "../model/print-request/mapfish-style-v2";
import { DownloadDialogComponent } from "../download-dialog/download-dialog.component";

@Component({
  selector: "ggc-print-form",
  templateUrl: "./ggc-print-form.component.html",
  styleUrls: ["./ggc-print-form.component.css"],
  providers: [PrintPreviewService],
  imports: [DownloadDialogComponent, ReactiveFormsModule]
})
export class GgcPrintFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input() configurationName: string;
  @Input() extraPrintLayers: string[] = ["drawing", "measuring"];
  @Input() mapIndex: string;
  @Input() printserver: string;
  @Input() apiKey: string;
  @Input() printConfigs: Array<PrintConfig>;
  @Input() templateAttributes: Map<string, string>;
  @Input() hiddenAttributes?: string[];
  @Input() printPreviewCenter: Coordinate;
  @Input() outputFilenameFunction: (formValues: Map<string, string>) => string;
  @Input() previewStyle: StyleLike | undefined;
  @Input() downloadOnComplete = false;
  @Input() iconFile = "fal fa-file-alt";
  @Input() iconDownload = "fal fa-arrow-to-bottom";
  @Input() iconClose = "fal fa-times";
  @Input() printStyle: MapfishStyleV2 | undefined;
  @Output() events: EventEmitter<PrintComponentEvent> =
    new EventEmitter<PrintComponentEvent>();
  // change for trigger
  protected scales = [
    {
      key: 500,
      value: "1:500"
    },
    {
      key: 1000,
      value: "1:1000"
    },
    {
      key: 1500,
      value: "1:1500"
    },
    {
      key: 2000,
      value: "1:2000"
    },
    {
      key: 2500,
      value: "1:2500"
    },
    {
      key: 3000,
      value: "1:3000"
    },
    {
      key: 3500,
      value: "1:3500"
    },
    {
      key: 4000,
      value: "1:4000"
    },
    {
      key: 4500,
      value: "1:4500"
    },
    {
      key: 5000,
      value: "1:5000"
    }
  ];
  protected templates: Template[] = [];
  protected optionsForm: FormGroup;
  protected attributes: Attribute[];
  protected error: GgcPrintError | undefined;
  protected center: Coordinate | undefined;
  private templateChangeSubscription: SubscriptionLike;
  private scaleChangeSubscription: SubscriptionLike;
  private readonly formBuilder = inject(FormBuilder);
  private readonly mapFishInteraction = inject(GgcMapfishInteractionService);
  private readonly printPreviewService = inject(PrintPreviewService);
  private readonly processCapabilitiesService = inject(
    ProcessCapabilitiesService
  );
  private readonly atrributesControlService = inject(AttributesControlService);
  private readonly printConfigService = inject(PrintConfigService);

  constructor() {
    this.optionsForm = this.formBuilder.group({
      template: ["", Validators.required],
      scale: ["", Validators.required],
      attributesGroup: [""]
    });
  }

  ngOnInit() {
    if (this.printserver) {
      this.mapFishInteraction.setPrintserver(this.printserver);
    }
    if (this.apiKey) {
      this.mapFishInteraction.provideApiKey(this.apiKey);
    }
    if (this.configurationName) {
      this.mapFishInteraction
        .getConfigCapabilities(this.configurationName)
        .subscribe({
          next: (capabilities: Capabilities) => {
            this.processCapabilities(capabilities);
            this.addTemplateAndScaleChangeListeners();
            this.setDefaultValues();
          },
          error: (error: GgcPrintError) => (this.error = error)
        });
    }
    if (this.printConfigs) {
      this.printConfigService.addKeysToPrintConfigs(this.printConfigs);
    }
    this.printPreviewService.prepareMapForPrintPreview(
      this.mapIndex,
      this.previewStyle
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const printPreviewChange = changes["printPreviewCenter"];
    if (printPreviewChange) {
      const newCenter: Coordinate = printPreviewChange.currentValue;
      if (newCenter) {
        this.printPreviewService.updateCenter(newCenter);
      }
    }
    const templateAttributesChange = changes["templateAttributes"];
    if (templateAttributesChange) {
      if (!templateAttributesChange.firstChange) {
        this.addAttributesToFormGroup(this.attributes);
      }
    }
  }

  processCapabilities(capabilities: Capabilities): void {
    const templates =
      this.processCapabilitiesService.getTemplatesFromCapabilities(
        capabilities
      );
    if (templates.length > 0) {
      this.templates = templates;
    } else {
      this.error = new GgcPrintError(
        GgcPrintErrorTypes.CAPABILITIESPROCESSING,
        "Templates kunnen niet uitgelezen worden uit de capabilities"
      );
    }
  }

  setDefaultValues(): void {
    // setting default values for the options form.
    this.optionsForm.patchValue({
      template: this.templates[0],
      scale: this.scales[0].key
    });
  }

  onSubmit() {
    const centerTmp = this.printPreviewService.getCenterFromPrintPreview();
    if (centerTmp) {
      this.center = JSON.parse(JSON.stringify(centerTmp)); //is nodig om de set opnieuw te triggeren.
    } else {
      this.error = new GgcPrintError(
        GgcPrintErrorTypes.MAPNOTAVAILABLE,
        "Middelpunt van het te printen gebied op de kaart kan niet worden bepaald"
      );
    }
  }

  addTemplateAndScaleChangeListeners() {
    // listen to changes for template and scale controls
    const templateControl = this.optionsForm.get("template");
    if (templateControl) {
      this.templateChangeSubscription = templateControl.valueChanges.subscribe(
        (newValue: Template) => {
          this.printPreviewService.updateMapAreaSize(newValue.mapAreaSize);
          if (
            newValue.attributes !== undefined &&
            newValue.attributes !== null
          ) {
            this.addAttributesToFormGroup(newValue.attributes);
          }
        }
      );
    }
    const scaleControl = this.optionsForm.get("scale");
    if (scaleControl) {
      this.scaleChangeSubscription = scaleControl.valueChanges.subscribe(
        (newValue: number) => {
          this.printPreviewService.updateScale(newValue);
        }
      );
    }
  }

  addAttributesToFormGroup(changedAttributes: Attribute[]) {
    this.optionsForm.removeControl("attributesGroup");
    const formGroup: FormGroup =
      this.atrributesControlService.attributesToFormGroup(
        changedAttributes,
        this.templateAttributes
      );
    this.optionsForm.addControl("attributesGroup", formGroup);
    this.attributes = changedAttributes;
  }

  protected isAttributeHidden(attributeName: string): boolean {
    return (
      !!this.hiddenAttributes && this.hiddenAttributes.includes(attributeName)
    );
  }

  ngOnDestroy() {
    // unsubscribe to scale and template changes
    if (this.scaleChangeSubscription) {
      this.scaleChangeSubscription.unsubscribe();
    }
    if (this.templateChangeSubscription) {
      this.templateChangeSubscription.unsubscribe();
    }

    // clear print preview in the map
    this.printPreviewService.clearPrintPreview();
  }
}
