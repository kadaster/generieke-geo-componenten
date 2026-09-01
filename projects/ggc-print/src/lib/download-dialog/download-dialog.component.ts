import { Component, inject, Input, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Coordinate } from "ol/coordinate";
import { noop, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";
import { MapfishStyleV2 } from "../model/print-request/mapfish-style-v2";
import { GgcMapfishInteractionService } from "../core/mapfish-interaction/ggc-mapfish-interaction.service";
import { GgcMapfishPrintrequestCreateService } from "../core/print-request/ggc-mapfish-printrequest-create.service";
import { GgcPrintError, GgcPrintErrorTypes } from "../model/print-error.model";
import { PrintRequestResponse } from "../model/print-request/print-request-response";
import { Print } from "../model/result/Print";
import {
  StatusResponse,
  StatusResponseStatus
} from "../model/result/StatusRepsonse";
import { MapfishPrintProperties } from "../model/print-request/mapfish-print-properties";
import { NgClass } from "@angular/common";

@Component({
  selector: "ggc-download-dialog",
  templateUrl: "./download-dialog.component.html",
  styleUrls: ["./download-dialog.component.css"],
  imports: [NgClass]
})
export class DownloadDialogComponent {
  @Input() downloadOnComplete = false;
  @Input() extraPrintLayers: string[];
  @Input() configurationName: string;
  @Input() outputFilenameFunction: (formValues: Map<string, string>) => string;
  @Input() mapIndex: string;
  @Input() iconFile: string;
  @Input() iconDownload: string;
  @Input() iconClose: string;

  protected isLoading = signal(false);
  protected internalError = signal<GgcPrintError | undefined>(undefined);
  protected downloadURL: string | undefined;
  private readonly mapFishInteraction = inject(GgcMapfishInteractionService);
  private readonly mapFishPrintrequestCreateService = inject(
    GgcMapfishPrintrequestCreateService
  );
  private getResultSubscription: Subscription;
  private printId: string;
  private _center: Coordinate;
  private _optionsForm: FormGroup<any>;

  @Input()
  set error(value: GgcPrintError | undefined) {
    this.internalError.set(value);
  }

  @Input()
  set center(center: Coordinate) {
    this._center = center;
    if (center) {
      this.isLoading.set(true);
      this.startDownloadingAsync();
    }
  }

  @Input()
  set optionsForm(optionsForm: FormGroup<any>) {
    this._optionsForm = optionsForm;
  }
  @Input()
  set printStyle(printStyle: MapfishStyleV2 | undefined) {
    this.mapFishPrintrequestCreateService.setCustomStyle(printStyle);
  }

  private async startDownloadingAsync(): Promise<void> {
    await this.startDownloading();
  }

  async startDownloading() {
    const printProperties: MapfishPrintProperties = {
      scale: this._optionsForm.getRawValue()["scale"],
      layout: this._optionsForm.getRawValue()["template"].name,
      center: this._center,
      extraPrintlayers: this.extraPrintLayers,
      mapAreaSize: this._optionsForm.getRawValue()["template"].mapAreaSize,
      attributes: this._optionsForm.controls["attributesGroup"].value,
      outputFilenameFunction: this.outputFilenameFunction,
      mapIndex: this.mapIndex
    };
    const mapFishPrintRequest =
      await this.mapFishPrintrequestCreateService.createPrintRequest(
        printProperties
      );
    this.getResultSubscription = this.mapFishInteraction
      .sendPrintRequest(this.configurationName, mapFishPrintRequest)
      .pipe(
        switchMap((data: PrintRequestResponse) => {
          this.downloadURL = undefined;
          this.internalError.set(undefined);
          this.printId = data.ref;
          return this.mapFishInteraction.getResult(this.printId);
        })
      )
      .subscribe({
        next: (statusResponse) => this.procesStatusResponse(statusResponse),
        error: (error) => {
          this.internalError.set(error);
        }
      });
  }

  procesStatusResponse(statusResponse: StatusResponse): void {
    this.getResultSubscription.unsubscribe();
    if (statusResponse.status === StatusResponseStatus.FINISHED) {
      this.downloadURL =
        this.mapFishInteraction.getPrintserver() + statusResponse.downloadURL;
      if (this.downloadOnComplete) {
        this.downloadPrint();
      }
      this.isLoading.set(false);
    } else if (statusResponse.status === StatusResponseStatus.CANCELLED) {
      this.internalError.set(
        new GgcPrintError(
          GgcPrintErrorTypes.PRINTSTATUSCANCELLED,
          statusResponse.error
        )
      );
    } else if (statusResponse.status === StatusResponseStatus.ERROR) {
      this.internalError.set(
        new GgcPrintError(GgcPrintErrorTypes.MAPFISHERROR, statusResponse.error)
      );
    }
  }

  downloadPrint(): void {
    if (this.downloadURL) {
      this.mapFishInteraction
        .getPrint(this.downloadURL)
        .subscribe((print: Print) => {
          const file = new File([print.file], print.filename, {
            type: "application/pdf"
          });
          const fileUrl = URL.createObjectURL(file);
          const linkTag = document.createElement("a");
          linkTag.download = print.filename;
          linkTag.href = fileUrl;
          linkTag.click();
        });
    }
  }

  closeModal() {
    this.downloadURL = undefined;

    if (this.getResultSubscription && !this.getResultSubscription.closed) {
      this.getResultSubscription.unsubscribe();
      this.mapFishInteraction.cancel(this.printId).subscribe(noop);
    }
  }
}
