import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
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
  readonly title = input<string>();
  readonly extraConfigLabel = input<string>();
  readonly urlTSDocs = input(tsdocsUrl);
  readonly extraConfigLanguage = input("json");
  readonly pathCodeScss = input<string>();
  readonly pathKaartConfig = input<string>();
  readonly pathExtraConfig = input<string>();
  readonly pathModule = input<string>();

  protected readonly urlCodeTypescript = signal<string | undefined>(undefined);
  protected readonly urlCodeHtml = signal<string | undefined>(undefined);
  protected readonly urlCodeScss = signal<string | undefined>(undefined);
  protected readonly urlKaartConfig = signal<string | undefined>(undefined);
  protected readonly urlExtraConfig = signal<string | undefined>(undefined);

  protected readonly _pathCodeHtml = signal<string | undefined>(undefined);
  protected readonly _pathCodeTypescript = signal<string | undefined>(
    undefined
  );
  protected readonly _pathCodeScss = signal<string | undefined>(undefined);
  protected readonly _pathKaartConfig = signal<string | undefined>(undefined);
  protected readonly _pathExtraConfig = signal<string | undefined>(undefined);

  protected baseUrlCode =
    "https://github.com/kadaster/generieke-geo-componenten/blob/main/projects/ggc-home/src/app/examples/";

  protected readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const pathCodeScss = this.pathCodeScss();
      if (pathCodeScss !== undefined) {
        this._pathCodeScss.set("code/examples/" + pathCodeScss);
        this.urlCodeScss.set(this.baseUrlCode + pathCodeScss);
      }
    });

    effect(() => {
      const pathKaartConfig = this.pathKaartConfig();
      if (pathKaartConfig !== undefined) {
        this._pathKaartConfig.set("code/examples/" + pathKaartConfig);
        this.urlKaartConfig.set(this.baseUrlCode + pathKaartConfig);
      }
    });

    effect(() => {
      const pathExtraConfig = this.pathExtraConfig();
      if (pathExtraConfig !== undefined) {
        this._pathExtraConfig.set("code/examples/" + pathExtraConfig);
        this.urlExtraConfig.set(this.baseUrlCode + pathExtraConfig);
      }
    });

    effect(() => {
      const pathModule = this.pathModule();
      if (pathModule) {
        this.updateUrls(pathModule);
      }
    });
  }

  goToPage(routerLink: string) {
    this.router.navigate([routerLink]);
  }

  private updateUrls(pathModule: string) {
    this._pathCodeHtml.set(
      "code/examples/" + pathModule.replace(".ts", ".html")
    );
    this.urlCodeHtml.set(this.baseUrlCode + pathModule.replace(".ts", ".html"));
    this._pathCodeTypescript.set("code/examples/" + pathModule);
    this.urlCodeTypescript.set(this.baseUrlCode + pathModule);

    const pathScss = pathModule.replace(".ts", ".scss");
    this.httpClient
      .get("code/examples/" + pathScss, {
        responseType: "text",
        observe: "response"
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const contentType = response.headers.get("Content-Type") ?? "";
          // When deployed, the 404 is replaced with the index.html. To catch this case, this if statement is needed
          if (!contentType.includes("text/html")) {
            this._pathCodeScss.set("code/examples/" + pathScss);
            this.urlCodeScss.set(this.baseUrlCode + pathScss);
          }
        },
        error: (err) => {
          if (err.status !== 404) {
            this._pathCodeScss.set("code/examples/" + pathScss);
            this.urlCodeScss.set(this.baseUrlCode + pathScss);
          }
        }
      });

    // replace the ts file with kaartconfig.json if not already set through @Input
    if (!this._pathKaartConfig()) {
      const pathKaartconfig =
        pathModule.split("/").slice(0, -1).join("/") + "/kaartconfig.json";
      this.httpClient
        .get("code/examples/" + pathKaartconfig, {
          responseType: "text",
          observe: "response"
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            const contentType = response.headers.get("Content-Type") ?? "";
            // When deployed, the 404 is replaced with the index.html. To catch this case, this if statement is needed
            if (!contentType.includes("text/html")) {
              this._pathKaartConfig.set("code/examples/" + pathKaartconfig);
              this.urlKaartConfig.set(this.baseUrlCode + pathKaartconfig);
            }
          },
          error: (err) => {
            if (err.status !== 404) {
              this._pathKaartConfig.set("code/examples/" + pathKaartconfig);
              this.urlKaartConfig.set(this.baseUrlCode + pathKaartconfig);
            }
          }
        });
    }
  }
}
