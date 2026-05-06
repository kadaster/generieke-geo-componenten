import { Component, inject, signal, viewChild } from "@angular/core";
import { Menu, MenuBar, MenuContent, MenuItem } from "@angular/aria/menu";
import { Router } from "@angular/router";
import { CdkConnectedOverlay } from "@angular/cdk/overlay";
import { githubReleasesUrl, githubUrl, tsdocsUrl } from "../constants/urls";
import { EventTrackerService } from "../service/event-tracker.service";

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

  private readonly eventTrackerService = inject(EventTrackerService);
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
    this.eventTrackerService.trackEvent(
      "content",
      "click_intern",
      "voorbeelden"
    );
    this.router.navigate(["/example-index"]);
  }

  openQuickstart() {
    this.eventTrackerService.trackEvent(
      "content",
      "click_intern",
      "quick_start"
    );
    this.router.navigate(["/quick-start"]);
  }

  openTsDocs() {
    this.eventTrackerService.trackEvent("content", "click_intern", "tsdocs");
    window.open(tsdocsUrl, "_blank", "noopener,noreferrer");
  }

  openGithub() {
    this.eventTrackerService.trackEvent("content", "click_intern", "github");
    window.open(githubUrl, "_blank", "noopener,noreferrer");
  }

  openReleasesAndChangelog() {
    this.eventTrackerService.trackEvent(
      "content",
      "click_intern",
      "releases_en_changelog"
    );
    window.open(githubReleasesUrl, "_blank", "noopener,noreferrer");
  }
}
