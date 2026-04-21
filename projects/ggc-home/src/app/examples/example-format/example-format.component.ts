import { Component, inject, Input, ViewEncapsulation } from "@angular/core";
import { Router } from "@angular/router";
import { CodeFromUrlPipe } from "ngx-highlightjs/plus";
import { Highlight } from "ngx-highlightjs";
import { AsyncPipe } from "@angular/common";
import { ExtractDocsSectionPipePipe } from "../../pipes/extract-docs-section-pipe.pipe";

@Component({
  selector: "app-example-format",
  templateUrl: "./example-format.component.html",
  styleUrl: "./example-format.component.scss",
  imports: [Highlight, CodeFromUrlPipe, AsyncPipe, ExtractDocsSectionPipePipe],
  encapsulation: ViewEncapsulation.None
})
export class ExampleFormatComponent {
  @Input() title?: string;
  @Input() urlVoorbeelden?: string;
  @Input() urlTSDocs?: string;
  @Input() urlChangelog?: string;
  @Input() codeHtmlPath: string | undefined;
  @Input() codeTypescriptPath: string | undefined;
  @Input() codeScssPath: string | undefined;
  @Input() kaartConfigFilePath: string | undefined;
  @Input() treeConfigFilePath: string | undefined;
  @Input() urlCodeHtml: string;
  @Input() urlCodeTypescript: string;
  @Input() urlCodeScss: string;
  @Input() urlKaartConfig: string;
  @Input() urlTreeConfig: string;

  protected baseUrlCode =
    "https://git.dev.cloud.kadaster.nl/ggc/ggs-ggc-library/src/branch/master/projects/library-app/src/app/examples/";
  private readonly router = inject(Router);

  goToPage(routerLink: string) {
    this.router.navigate([routerLink]);
  }
}
