import { Component, inject, Input, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { CodeFromUrlPipe } from "ngx-highlightjs/plus";
import { Highlight } from "ngx-highlightjs";
import { AsyncPipe } from "@angular/common";
import { ExtractDocsSectionPipePipe } from "../../pipes/extract-docs-section-pipe.pipe";
import { tsdocsUrl } from "../../constants/urls";
import { HttpClient } from "@angular/common/http";
import { ExtractImportsPipe } from "../../pipes/extract-imports.pipe";

@Component({
  selector: "ggc-home-example-format",
  templateUrl: "./example-format.component.html",
  styleUrl: "./example-format.component.scss",
  imports: [
    Highlight,
    CodeFromUrlPipe,
    AsyncPipe,
    ExtractDocsSectionPipePipe,
    ExtractImportsPipe
  ],
  encapsulation: ViewEncapsulation.None
})
export class ExampleFormatComponent {
  @Input() title?: string;
  @Input() extraConfigLabel: string | undefined;
  @Input() urlTSDocs?: string = tsdocsUrl;
  @Input() extraConfigLanguage = "json";

  protected urlCodeTypescript: string | undefined;
  protected urlCodeHtml: string | undefined;
  protected urlCodeScss: string | undefined;
  protected urlKaartConfig: string | undefined;
  protected urlExtraConfig: string | undefined;

  protected _pathCodeHtml: string | undefined;
  protected _pathCodeTypescript: string | undefined;
  protected _pathCodeScss: string | undefined;
  protected _pathKaartConfig: string | undefined;
  protected _pathExtraConfig: string | undefined;

  protected baseUrlCode =
    "https://github.com/kadaster/generieke-geo-componenten/blob/main/projects/ggc-home/src/app/examples/";

  protected readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);

  @Input()
  set pathCodeScss(value: string) {
    this._pathCodeScss = "code/examples/" + value;
    this.urlCodeScss = this.baseUrlCode + value;
  }

  @Input()
  set pathKaartConfig(value: string) {
    this._pathKaartConfig = "code/examples/" + value;
    this.urlKaartConfig = this.baseUrlCode + value;
  }

  @Input()
  set pathExtraConfig(value: string) {
    this._pathExtraConfig = "code/examples/" + value;
    this.urlExtraConfig = this.baseUrlCode + value;
  }

  // input will be the path of the typescript example
  // For example: "example-draw/example-draw-adv/example-draw-adv.component.ts"
  @Input()
  set pathModule(pathModule: string) {
    this.updateUrls(pathModule);
  }

  goToPage(routerLink: string) {
    this.router.navigate([routerLink]);
  }

  private updateUrls(pathModule: string) {
    this._pathCodeHtml = "code/examples/" + pathModule.replace(".ts", ".html");
    this.urlCodeHtml = this.baseUrlCode + pathModule.replace(".ts", ".html");
    this._pathCodeTypescript = "code/examples/" + pathModule;
    this.urlCodeTypescript = this.baseUrlCode + pathModule;

    const pathScss = pathModule.replace(".ts", ".scss");
    this.httpClient
      .get("code/examples/" + pathScss, {
        responseType: "text",
        observe: "response"
      })
      .subscribe({
        next: (response) => {
          const contentType = response.headers.get("Content-Type") ?? "";
          // When deployed, the 404 is replaced with the index.html. To catch this case, this if statement is needed
          if (!contentType.includes("text/html")) {
            this._pathCodeScss = "code/examples/" + pathScss;
            this.urlCodeScss = this.baseUrlCode + pathScss;
          }
        },
        error: (err) => {
          if (err.status !== 404) {
            this._pathCodeScss = "code/examples/" + pathScss;
            this.urlCodeScss = this.baseUrlCode + pathScss;
          }
        }
      });

    // replace the ts file with kaartconfig.json if not already set through @Input
    if (!this._pathKaartConfig) {
      const pathKaartconfig =
        pathModule.split("/").slice(0, -1).join("/") + "/kaartconfig.json";
      this.httpClient
        .get("code/examples/" + pathKaartconfig, {
          responseType: "text",
          observe: "response"
        })
        .subscribe({
          next: (response) => {
            const contentType = response.headers.get("Content-Type") ?? "";
            // When deployed, the 404 is replaced with the index.html. To catch this case, this if statement is needed
            if (!contentType.includes("text/html")) {
              this._pathKaartConfig = "code/examples/" + pathKaartconfig;
              this.urlKaartConfig = this.baseUrlCode + pathKaartconfig;
            }
          },
          error: (err) => {
            if (err.status !== 404) {
              this._pathKaartConfig = "code/examples/" + pathKaartconfig;
              this.urlKaartConfig = this.baseUrlCode + pathKaartconfig;
            }
          }
        });
    }
  }
}
