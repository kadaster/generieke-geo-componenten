import { Component, ViewEncapsulation } from "@angular/core";
import { ExampleSearchLocationComponent } from "../example-search-location/example-search-location/example-search-location.component";
import { ExampleSnappingBasicComponent } from "../example-snapping/example-snapping-basic/example-snapping-basic.component";
import { ComponentInfo } from "../component-info.model";
import { RouterLink } from "@angular/router";
import { ExampleDatasetTreeBasicComponent } from "../example-dataset-tree/example-dataset-tree-basic/example-dataset-tree-basic.component";
import { ExampleDatasetTreeTemplatesComponent } from "../example-dataset-tree/example-dataset-tree-templates/example-dataset-tree-templates.component";
import { ExampleDatasetSwitcherBasicComponent } from "../example-dataset-switcher/example-dataset-switcher-basic/example-dataset-switcher-basic.component";
import { ExampleDatasetTreeLayerEnabledCallback } from "../example-dataset-tree/example-dataset-tree-layer-enabled-callback/example-dataset-tree-layer-enabled-callback.component";
import { ExampleSearchLocationWoonplaatsComponent } from "../example-search-location/example-search-location-woonplaats/example-search-location-woonplaats.component";
import { ExampleLegendBasicComponent } from "../example-legend/example-legend-basic/example-legend-basic.component";
import { ExampleLegendZoomComponent } from "../example-legend/example-legend-zoom/example-legend-zoom.component";
import { ExampleLegendDatasetTreeComponent } from "../example-legend/example-legend-dataset-tree/example-legend-dataset-tree.component";
import { ExampleLegendOgcApiTilesComponent } from "../example-legend/example-legend-ogc-api-tiles/example-legend-ogc-api-tiles.component";
import { ExampleDatasetTreeBasicListComponent } from "../example-dataset-tree/example-dataset-tree-basic-list/example-dataset-tree-basic-list.component";
import { ExampleLayerImageComponent } from "../example-layer/example-layer-image/example-layer-image.component";
import { ExampleLayerWmsComponent } from "../example-layer/example-layer-wms/example-layer-wms.component";
import { ExampleLayerWmtsComponent } from "../example-layer/example-layer-wmts/example-layer-wmts.component";
import { ExampleLayerGeojsonComponent } from "../example-layer/example-layer-geojson/example-layer-geojson.component";
import { ExampleLayerGeojsonWfsComponent } from "../example-layer/example-layer-geojson-wfs/example-layer-geojson-wfs.component";
import { ExampleLayerGeojsonOgcComponent } from "../example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.component";
import { ExampleLayerVectorTileComponent } from "../example-layer/example-layer-vector-tile/example-layer-vector-tile.component";
import { ExampleLayerBasicComponent } from "../example-layer/example-layer-basic/example-layer-basic.component";
import { ExampleLayerAdvancedComponent } from "../example-layer/example-layer-advanced/example-layer-advanced.component";
import { ExampleLayerAdvanced2Component } from "../example-layer/example-layer-advanced2/example-layer-advanced2.component";
import { ExampleToolbarLocation } from "../example-toolbar/example-toolbar-location/example-toolbar-location.component";
import { ExampleToolbar } from "../example-toolbar/example-toolbar/example-toolbar.component";
import { ExampleDrawBasicComponent } from "../example-draw/example-draw-basic/example-draw-basic.component";
import { ExampleDrawEditBasicComponent } from "../example-draw/example-draw-edit-basic/example-draw-edit-basic.component";
import { ExampleDrawCenterDrawComponent } from "../example-draw/example-draw-center-draw/example-draw-center-draw.component";
import { ExampleMeasure } from "../example-measure/example-measure/example-measure.component";
import { ExampleDrawStyle } from "../example-draw/example-draw-style/example-draw-style.component";
import { ExampleMeasureOwnStyleLabel } from "../example-measure/example-measure-own-style-label/example-measure-own-style-label.component";
import { Tags } from "../tags.enum";
import { Components } from "../components.enum";
import { Themes } from "../themes.enum";
import { SortPipe } from "../../pipes/sort.pipe";

interface GroupedCards {
  theme: string;
  cards: ComponentInfo[];
}
import { ExampleDatasetSwitcherRadioButtonsComponent } from "../example-dataset-switcher/example-dataset-switcher-radio-buttons/example-dataset-switcher-radio-buttons.component";

@Component({
  selector: "app-example-index",
  templateUrl: "./example-index.component.html",
  styleUrl: "./example-index.component.scss",
  imports: [RouterLink, SortPipe],
  encapsulation: ViewEncapsulation.None
})
export class ExampleIndexComponent {
  protected searchTerm = "";
  protected selectedThemes = new Set<string>();
  protected selectedComponents = new Set<string>();
  protected selectedTags = new Set<string>();
  protected cards: ComponentInfo[] = [
    new ExampleSearchLocationComponent().componentInfo,
    new ExampleDatasetTreeBasicComponent().componentInfo,
    new ExampleDatasetTreeBasicListComponent().componentInfo,
    new ExampleDrawBasicComponent().componentInfo,
    new ExampleDrawStyle().componentInfo,
    new ExampleDatasetTreeTemplatesComponent().componentInfo,
    new ExampleDrawEditBasicComponent().componentInfo,
    new ExampleSearchLocationWoonplaatsComponent().componentInfo,
    new ExampleSnappingBasicComponent().componentInfo,
    new ExampleDatasetSwitcherBasicComponent().componentInfo,
    new ExampleDatasetSwitcherRadioButtonsComponent().componentInfo,
    new ExampleLegendBasicComponent().componentInfo,
    new ExampleLegendZoomComponent().componentInfo,
    new ExampleLegendDatasetTreeComponent().componentInfo,
    new ExampleLegendOgcApiTilesComponent().componentInfo,
    new ExampleDatasetTreeLayerEnabledCallback().componentInfo,
    new ExampleLayerImageComponent().componentInfo,
    new ExampleLayerWmsComponent().componentInfo,
    new ExampleLayerWmtsComponent().componentInfo,
    new ExampleLayerGeojsonComponent().componentInfo,
    new ExampleLayerGeojsonWfsComponent().componentInfo,
    new ExampleLayerGeojsonOgcComponent().componentInfo,
    new ExampleLayerVectorTileComponent().componentInfo,
    new ExampleLayerBasicComponent().componentInfo,
    new ExampleLayerAdvancedComponent().componentInfo,
    new ExampleLayerAdvanced2Component().componentInfo,
    new ExampleToolbar().componentInfo,
    new ExampleToolbarLocation().componentInfo,
    new ExampleDrawCenterDrawComponent().componentInfo,
    new ExampleMeasure().componentInfo,
    new ExampleMeasureOwnStyleLabel().componentInfo
  ];

  protected get availableThemes(): string[] {
    const set = new Set<string>();
    for (const card of this.cards) {
      for (const tag of (card as any)?.theme ?? []) {
        set.add(tag);
      }
    }

    const fixedOrder = [""];
    return this.sortArrayWithFixedOrder(Array.from(set), fixedOrder);
  }

  protected get availableComponents(): string[] {
    const set = new Set<string>();
    for (const card of this.cards) {
      for (const component of (card as any)?.components ?? []) {
        set.add(component.toLocaleLowerCase());
      }
    }

    const fixedOrder = [Components.GGC_MAP];
    return this.sortArrayWithFixedOrder(Array.from(set), fixedOrder);
  }

  protected get availableTags(): string[] {
    const set = new Set<string>();
    for (const card of this.cards) {
      for (const tag of (card as any)?.tags ?? []) {
        set.add(tag.toLocaleLowerCase());
      }
    }

    const fixedOrder = [Tags.DATASET, Tags.LAYER, Tags.LEGEND, Tags.SEARCH];
    return this.sortArrayWithFixedOrder(Array.from(set), fixedOrder);
  }

  protected toggleTheme(theme: string): void {
    if (this.selectedThemes.has(theme)) {
      this.selectedThemes.delete(theme);
    } else {
      this.selectedThemes.add(theme);
    }
    this.selectedThemes = new Set(this.selectedThemes);
  }

  protected toggleComponent(component: string): void {
    if (this.selectedComponents.has(component)) {
      this.selectedComponents.delete(component);
    } else {
      this.selectedComponents.add(component);
    }
    this.selectedComponents = new Set(this.selectedComponents);
  }

  protected toggleTag(tag: string): void {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    this.selectedTags = new Set(this.selectedTags);
  }

  protected clearThemeFilter(): void {
    this.selectedThemes = new Set<string>();
  }

  protected clearComponentFilter(): void {
    this.selectedComponents = new Set<string>();
  }

  protected clearTagFilter(): void {
    this.selectedTags = new Set<string>();
  }

  protected filteredCards(exclude?: string): ComponentInfo[] {
    const q = this.searchTerm.trim().toLowerCase();

    return this.cards.filter((card) => {
      const matchesText = !q || this.cardMatchesQuery(card, q);
      const matchesThemes =
        this.cardMatchesSelected(card.theme, this.selectedThemes) ||
        exclude === "theme";
      const matchesComponents =
        this.cardMatchesSelected(card.components, this.selectedComponents) ||
        exclude === "component";
      const matchesTags =
        this.cardMatchesSelected(card.tags, this.selectedTags) ||
        exclude === "tag";
      return matchesText && matchesThemes && matchesComponents && matchesTags;
    });
  }

  protected get groupedCards(): GroupedCards[] {
    return Object.entries(
      Object.groupBy(this.filteredCards(), (card) => card.theme.toString())
    )
      .filter(([, value]) => value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => ({
        theme: key,
        cards: value!.slice().sort((c1, c2) => c1.title.localeCompare(c2.title))
      }));
  }

  protected countThemes(theme: Themes) {
    return this.filteredCards("theme").filter((card) =>
      card.theme.includes(theme)
    ).length;
  }

  protected countComponents(component: Components) {
    return this.filteredCards("component").filter((card) =>
      card.components.includes(component)
    ).length;
  }

  protected countTags(tag: Tags) {
    return this.filteredCards("tag").filter((card) => card.tags.includes(tag))
      .length;
  }

  private cardMatchesSelected(
    availableItems: string[],
    selectedItems: Set<string>
  ): boolean {
    if (!Array.isArray(availableItems)) {
      return false;
    } else if (selectedItems.size === 0) {
      return true;
    }

    const cardTagSet = new Set(availableItems.map((t) => t.toLowerCase()));

    for (const t of selectedItems) {
      if (cardTagSet.has(t.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  private cardMatchesQuery(card: ComponentInfo, q: string): boolean {
    for (const value of Object.values(card as Record<string, any>)) {
      const text = this.valueToSearchText(value);
      if (text.includes(q)) {
        return true;
      }
    }
    return false;
  }

  private valueToSearchText(value: unknown): string {
    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value.toLowerCase();
    }
    if (
      typeof value === "number" ||
      typeof value === "boolean" ||
      typeof value === "bigint"
    ) {
      return String(value).toLowerCase();
    }
    try {
      return JSON.stringify(value).toLowerCase();
    } catch {
      return String(value).toLowerCase();
    }
  }

  private sortArrayWithFixedOrder(arrayToSort: string[], fixedOrder: string[]) {
    return arrayToSort.sort((a, b) => {
      const ia = fixedOrder.indexOf(a);
      const ib = fixedOrder.indexOf(b);

      const aInList = ia !== -1;
      const bInList = ib !== -1;

      if (aInList && bInList) {
        return ia - ib;
      }

      if (aInList) return -1;
      if (bInList) return 1;

      return a.localeCompare(b);
    });
  }
}
