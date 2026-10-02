import {
  Component,
  inject,
  input,
  OnChanges,
  signal,
  SimpleChanges
} from "@angular/core";
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
export class DownloadDialogComponent implements OnChanges {
  downloadOnComplete = input(false);
  extraPrintLayers = input<string[]>();
  configurationName = input<string>();
  outputFilenameFunction = input<(formValues: Map<string, string>) => string>();
  mapIndex = input<string>();
  iconFile = input<string>();
  iconDownload = input<string>();
  iconClose = input<string>();
  error = input<GgcPrintError>();
  center = input<Coordinate>();
  optionsForm = input<FormGroup<any>>();
  printStyle = input<MapfishStyleV2>();

  protected isLoading = signal(false);
  protected internalError = signal<GgcPrintError | undefined>(undefined);
  protected downloadURL = signal<string | undefined>(undefined);
  private readonly mapFishInteraction = inject(GgcMapfishInteractionService);
  private readonly mapFishPrintrequestCreateService = inject(
    GgcMapfishPrintrequestCreateService
  );
  private getResultSubscription: Subscription;
  private printId: string;
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["error"]) {
      this.internalError.set(this.error());
    }
    if (changes["printStyle"]) {
      this.mapFishPrintrequestCreateService.setCustomStyle(this.printStyle());
    }
    if (changes["center"] && this.center()) {
      this.isLoading.set(true);
      void this.startDownloadingAsync();
    }
  }

  private async startDownloadingAsync(): Promise<void> {
    await this.startDownloading();
  }

  async startDownloading() {
    const optionsForm = this.optionsForm();
    const center = this.center();
    const configurationName = this.configurationName();
    if (!optionsForm || !center || !configurationName) return;

    const printProperties: MapfishPrintProperties = {
      scale: optionsForm.getRawValue()["scale"],
      layout: optionsForm.getRawValue()["template"].name,
      center,
      extraPrintlayers: this.extraPrintLayers() ?? [],
      mapAreaSize: optionsForm.getRawValue()["template"].mapAreaSize,
      attributes: optionsForm.controls["attributesGroup"].value,
      outputFilenameFunction: this.outputFilenameFunction(),
      mapIndex: this.mapIndex()
    };
    const mapFishPrintRequest =
      await this.mapFishPrintrequestCreateService.createPrintRequest(
        printProperties
      );
    this.getResultSubscription = this.mapFishInteraction
      .sendPrintRequest(configurationName, mapFishPrintRequest)
      .pipe(
        switchMap((data: PrintRequestResponse) => {
          this.downloadURL.set(undefined);
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
      this.downloadURL.set(
        this.mapFishInteraction.getPrintserver() + statusResponse.downloadURL
      );
      if (this.downloadOnComplete()) {
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
    const downloadURL = this.downloadURL();
    if (downloadURL) {
      this.mapFishInteraction
        .getPrint(downloadURL)
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
    this.downloadURL.set(undefined);

    if (this.getResultSubscription && !this.getResultSubscription.closed) {
      this.getResultSubscription.unsubscribe();
      this.mapFishInteraction.cancel(this.printId).subscribe(noop);
    }
  }
}
