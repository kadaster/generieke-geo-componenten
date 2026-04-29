import { Component, inject, Input, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { CodeFromUrlPipe } from "ngx-highlightjs/plus";
import { Highlight } from "ngx-highlightjs";
import { AsyncPipe } from "@angular/common";
import { ExtractDocsSectionPipePipe } from "../../pipes/extract-docs-section-pipe.pipe";
import { tsdocsUrl } from "../../constants/urls";

@Component({
  selector: "app-example-format",
  templateUrl: "./example-format.component.html",
  styleUrl: "./example-format.component.scss",
  imports: [Highlight, CodeFromUrlPipe, AsyncPipe, ExtractDocsSectionPipePipe],
  encapsulation: ViewEncapsulation.None
})
export class ExampleFormatComponent {
  @Input() title?: string;
  @Input() extraConfigLabel: string | undefined;

  // deprecated
  @Input() urlVoorbeelden?: string;
  @Input() urlChangelog?: string;

  // protected
  @Input() urlTSDocs?: string = tsdocsUrl;
  @Input() codeHtmlPath: string | undefined;
  @Input() codeTypescriptPath: string | undefined;
  @Input() codeScssPath: string | undefined;
  @Input() kaartConfigFilePath: string | undefined;
  @Input() extraConfigFilePath: string | undefined;
  @Input() urlCodeHtml: string;
  @Input() urlCodeTypescript: string;
  @Input() urlCodeScss: string;

  protected urlKaartConfig: string | undefined;
  protected urlTreeConfig: string | undefined;

  protected treeConfigFilePath: string | undefined;

  protected baseUrlCode =
    "https://github.com/kadaster/generieke-geo-componenten/blob/main/projects/ggc-home/src/app/examples/";
  protected _pathModule = "";

  private readonly router = inject(Router);

  @Input()
  set pathKaartConfig(value: string) {
    this.kaartConfigFilePath = "code/examples/" + value;
    this.urlKaartConfig = this.baseUrlCode + value;
  }

  @Input()
  set pathTreeConfig(value: string) {
    this.treeConfigFilePath = "code/examples/" + value;
    this.urlTreeConfig = this.baseUrlCode + value;
  }

  // input will be the path of the typescript example
  // For example: "example-draw/example-draw-adv/example-draw-adv.component.ts"
  @Input()
  set pathModule(value: string) {
    this._pathModule = value;
    this.updateUrls();
  }

  goToPage(routerLink: string) {
    this.router.navigate([routerLink]);
  }

  private updateUrls() {
    this.codeHtmlPath =
      "code/examples/" + this._pathModule.replace(".ts", ".html");
    this.urlCodeHtml =
      this.baseUrlCode + this._pathModule.replace(".ts", ".html");
    this.codeTypescriptPath = "code/examples/" + this._pathModule;
    this.urlCodeTypescript = this.baseUrlCode + this._pathModule;
    this.codeScssPath =
      "code/examples/" + this._pathModule.replace(".ts", ".scss");
    this.urlCodeScss =
      this.baseUrlCode + this._pathModule.replace(".ts", ".scss");
  }
}
