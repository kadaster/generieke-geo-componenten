import { Component, inject, signal, viewChild } from "@angular/core";
import { Menu, MenuBar, MenuContent, MenuItem } from "@angular/aria/menu";
import { Router } from "@angular/router";
import { CdkConnectedOverlay } from "@angular/cdk/overlay";

@Component({
  selector: "app-menu-bar",
  imports: [Menu, MenuBar, MenuContent, MenuItem, CdkConnectedOverlay],
  templateUrl: "./menu-bar.component.html",
  styleUrl: "./menu-bar.component.scss"
})
export class MenuBarComponent {
  isOpen = false;
  docsMenu = viewChild<Menu<string>>("docsMenu");
  codeMenu = viewChild<Menu<string>>("codeMenu");
  rendered = signal(false);

  private readonly router = inject(Router);

  onFocusIn() {
    this.rendered.set(true);
  }

  closeSubmenu() {
    this.isOpen = false;
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      this.closeSubmenu();
    }

    if (e.key === "ArrowDown" && !this.isOpen) {
      this.isOpen = true;
      setTimeout(() => {
        // focus eerste item
        const firstItem = document.querySelector(
          "#submenu-diensten li a"
        ) as HTMLElement;
        firstItem?.focus();
      });
    }
  }

  selectMenuItem() {
    debugger;
  }

  openVoorbeelden() {
    this.router.navigate(["/example-index"]);
  }

  openQuickstart() {
    this.router.navigate(["/quick-start"]);
  }

  openTsDocs() {
    this.router.navigate(["/tsdocs/index.html"]);
  }

  openGithub() {
    window.open(
      "https://github.com/kadaster/generieke-geo-componenten",
      "_blank"
    );
  }

  openChangelog() {
    window.open(
      "https://github.com/kadaster/generieke-geo-componenten/releases",
      "_blank"
    );
  }

  openReleases() {
    // kan eventueel ook naar NPMJS
    window.open(
      "https://github.com/kadaster/generieke-geo-componenten/releases",
      "_blank"
    );
  }
}
