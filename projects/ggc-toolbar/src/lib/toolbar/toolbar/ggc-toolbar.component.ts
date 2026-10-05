import { TemplateRef } from "@angular/core";
import {
  Component,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import Map from "ol/Map";
import { ToolbarItemComponentEvent } from "../../event/toolbar-item-event";
import { GgcToolbarItemComponent } from "../toolbar-item/ggc-toolbar-item.component";
import { GgcToolbarService } from "../../service/ggc-toolbar.service";
import { NgTemplateOutlet } from "@angular/common";
import { DEFAULT_MAPINDEX } from "@kadaster/ggc-models";
import { GgcToolbarConnectService } from "../../service/connect.service";

/**
 * `ToolbarComponent` is een containercomponent voor één of meerdere `ggc-toolbar-item` elementen.
 * Elk toolbar-item toont een knop met een icoon en optionele content die zichtbaar wordt bij activatie.
 *
 * Dit component ondersteunt:
 * - Dynamische activatie van toolbar-items
 * - Weergave van content onder de toolbar bij selectie
 * - Interactie met `ToolbarService` om actieve status te beheren
 * - Gebruik van een specifieke kaart via `mapIndex`
 *
 * ### Sub-componenten
 * De `ggc-toolbar` kan de volgende child-components bevatten:
 * - `ggc-toolbar-item`: Standaard toolbar-knop met optionele content.
 * - `ggc-toolbar-item-draw`: Voorgeconfigureerde tekenacties (tekenen, bewerken, verplaatsen, wissen).
 * - `ggc-toolbar-item-measure`: Voorgeconfigureerde meetacties (meten, bewerken, verplaatsen, wissen).
 *
 * @example
 * ```html
 * <ggc-toolbar [mapIndex]="'mijnKaart'">
 *   <ggc-toolbar-item [icon]="'fa-icon'" [label]="'Zoeken'">
 *     <app-zoek-component></app-zoek-component>
 *   </ggc-toolbar-item>
 * </ggc-toolbar>
 * ```
 */
@Component({
  selector: "ggc-toolbar",
  templateUrl: "./ggc-toolbar.component.html",
  styleUrls: ["./ggc-toolbar.component.css"],
  imports: [NgTemplateOutlet]
})
export class GgcToolbarComponent implements OnInit {
  /**
   * Naam van de kaart waarop de toolbar betrekking heeft.
   * Indien niet opgegeven, wordt de standaardkaart gebruikt.
   */
  mapIndex = input(DEFAULT_MAPINDEX);

  protected toolbarContentTemplate = signal<TemplateRef<any> | undefined>(
    undefined
  );

  private readonly children = contentChildren(GgcToolbarItemComponent);

  private map: Map;
  private readonly connectService = inject(GgcToolbarConnectService);
  private readonly toolbarService = inject(GgcToolbarService);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Constructor registreert een listener op de actieve toolbar-item observable.
   * Wanneer geen item actief is, worden alle items gedeactiveerd.
   */
  constructor() {
    this.toolbarService
      .getActiveToolbarItemObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event === null) {
          this.children().forEach((child) => (child.active = false));
        }
      });

    effect((onCleanup) => {
      const childSubscriptions = this.children().map((child) =>
        child.activeChanged.subscribe((event: ToolbarItemComponentEvent) => {
          if (event.active) {
            this.toolbarContentTemplate.set(
              event.toolbarItemComponent.toolbarItemTemplate
            );
            this.inactivateOtherChildren(event.toolbarItemComponent);
            this.toolbarService.setActiveToolbarItem(
              event.toolbarItemComponent.activeId() ?? null
            );
          } else {
            this.toolbarContentTemplate.set(undefined);
            this.toolbarService.setActiveToolbarItem(null);
          }
        })
      );

      onCleanup(() =>
        childSubscriptions.forEach((subscription) => subscription.unsubscribe())
      );
    });
  }

  /**
   * Lifecycle hook, Haalt de kaart op op basis van `mapIndex`.
   */
  ngOnInit(): void {
    this.init();
  }

  async init(): Promise<void> {
    const mapService = await this.connectService.getMapService();
    if (mapService) {
      this.map = (mapService as any).getMap(this.mapIndex());
    }
  }

  /**
   * Deactiveert alle toolbar-items behalve het opgegeven actieve item.
   * @param activeItem Het item dat actief moet blijven.
   */
  private inactivateOtherChildren(activeItem: GgcToolbarItemComponent): void {
    this.children()
      .filter((child) => child !== activeItem)
      .forEach((child) => (child.active = false));
  }
}
