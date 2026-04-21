import type { QueryList, TemplateRef } from "@angular/core";
import {
  AfterViewInit,
  Component,
  ContentChildren,
  inject,
  Input,
  OnInit
} from "@angular/core";
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
 * @example
 * <ggc-toolbar [mapIndex]="'mijnKaart'">
 *   <ggc-toolbar-item [icon]="'fa-icon'" [label]="'Zoeken'">
 *     <app-zoek-component></app-zoek-component>
 *   </ggc-toolbar-item>
 * </ggc-toolbar>
 */
@Component({
  selector: "ggc-toolbar",
  templateUrl: "./ggc-toolbar.component.html",
  styleUrls: ["./ggc-toolbar.component.css"],
  imports: [NgTemplateOutlet]
})
export class GgcToolbarComponent implements OnInit, AfterViewInit {
  /**
   * Naam van de kaart waarop de toolbar betrekking heeft.
   * Indien niet opgegeven, wordt de standaardkaart gebruikt.
   */
  @Input() mapIndex: string = DEFAULT_MAPINDEX;

  protected toolbarContentTemplate: TemplateRef<any> | undefined;

  @ContentChildren(GgcToolbarItemComponent)
  private readonly children: QueryList<GgcToolbarItemComponent>;

  private map: Map;
  private readonly connectService = inject(GgcToolbarConnectService);
  private readonly toolbarService = inject(GgcToolbarService);

  /**
   * Constructor registreert een listener op de actieve toolbar-item observable.
   * Wanneer geen item actief is, worden alle items gedeactiveerd.
   */
  constructor() {
    this.toolbarService.getActiveToolbarItemObservable().subscribe((event) => {
      if (event === null && this.children) {
        this.children.forEach((child) => (child.active = false));
      }
    });
  }

  /**
   * Lifecycle hook, Haalt de kaart op op basis van `mapIndex`.
   */
  ngOnInit(): void {
    this.init();
  }

  async init(): Promise<void> {
    await this.connectService.loadMapService();
    const mapService = this.connectService.getMapService();
    if (mapService) {
      this.map = mapService.getMap(this.mapIndex);
    }
  }

  /**
   * Lifecycle hook, Stelt subscriptions in op `activeChanged` events van de toolbar-items.
   * Zorgt voor het tonen van de juiste content en het beheren van de actieve status.
   */
  ngAfterViewInit(): void {
    this.children.forEach((child) => {
      child.activeChanged.subscribe((event: ToolbarItemComponentEvent) => {
        if (event.active) {
          this.toolbarContentTemplate =
            event.toolbarItemComponent.toolbarItemTemplate;
          this.inactivateOtherChildren(event.toolbarItemComponent);
          this.toolbarService.setActiveToolbarItem(
            event.toolbarItemComponent.activeId
          );
        } else {
          this.toolbarContentTemplate = undefined;
          this.toolbarService.setActiveToolbarItem(null);
        }
      });
    });
  }

  /**
   * Deactiveert alle toolbar-items behalve het opgegeven actieve item.
   * @param activeItem Het item dat actief moet blijven.
   */
  private inactivateOtherChildren(activeItem: GgcToolbarItemComponent): void {
    this.children
      .filter((child) => child !== activeItem)
      .forEach((child) => (child.active = false));
  }
}
