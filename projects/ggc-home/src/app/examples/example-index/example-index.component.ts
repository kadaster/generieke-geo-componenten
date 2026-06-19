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
import { ExampleLegendZoomComponent } from "../example-legend/example-legend-zoom/example-legend-zoom.component";
import { ExampleLegendDatasetTreeComponent } from "../example-legend/example-legend-dataset-tree/example-legend-dataset-tree.component";
import { ExampleDatasetTreeBasicListComponent } from "../example-dataset-tree/example-dataset-tree-basic-list/example-dataset-tree-basic-list.component";
import { ExampleLayerImageComponent } from "../example-layer/example-layer-image/example-layer-image.component";
import { ExampleLayerWmsComponent } from "../example-layer/example-layer-wms/example-layer-wms.component";
import { ExampleLayerWmtsComponent } from "../example-layer/example-layer-wmts/example-layer-wmts.component";
import { ExampleLayerGeojsonComponent } from "../example-layer/example-layer-geojson/example-layer-geojson.component";
import { ExampleLayerGeojsonWfsComponent } from "../example-layer/example-layer-geojson-wfs/example-layer-geojson-wfs.component";
import { ExampleLayerGeojsonOgcComponent } from "../example-layer/example-layer-geojson-ogc/example-layer-geojson-ogc.component";
import { ExampleLayerVectorTileComponent } from "../example-layer/example-layer-vector-tile/example-layer-vector-tile.component";
import { ExampleLayerHtmlConfig } from "../example-layer/example-layer-html-config/example-layer-html-config.component";
import { ExampleLayerJsonConfig } from "../example-layer/example-layer-json-config/example-layer-json-config.component";
import { ExampleToolbarLocation } from "../example-toolbar/example-toolbar-location/example-toolbar-location.component";
import { ExampleToolbar } from "../example-toolbar/example-toolbar/example-toolbar.component";
import { ExampleDrawBasicComponent } from "../example-draw/example-draw-basic/example-draw-basic.component";
import { ExampleDrawTracingComponent } from "../example-draw/example-draw-tracing/example-draw-tracing.component";
import { ExampleDrawEditBasicComponent } from "../example-draw/example-draw-edit-basic/example-draw-edit-basic.component";
import { ExampleDrawCenterDrawComponent } from "../example-draw/example-draw-center-draw/example-draw-center-draw.component";
import { ExampleMeasure } from "../example-measure/example-measure/example-measure.component";
import { ExampleDrawStyle } from "../example-draw/example-draw-style/example-draw-style.component";
import { ExampleMeasureOwnStyleLabel } from "../example-measure/example-measure-own-style-label/example-measure-own-style-label.component";
import { ExampleDrawCenterEditBasicComponent } from "../example-draw/example-draw-center-edit-basic/example-draw-center-edit-basic.component";
import { ExampleMapZoomScalePositionComponent } from "../example-map/example-map-zoom-scale-position/example-map-zoom-scale-position.component";
import { ExampleDatasetSwitcherRadioButtonsComponent } from "../example-dataset-switcher/example-dataset-switcher-radio-buttons/example-dataset-switcher-radio-buttons.component";
import { Tags } from "../tags.enum";
import { Components } from "../components.enum";
import { Themes } from "../themes.enum";
import { SortPipe } from "../../pipes/sort.pipe";
import { ExampleMapSelectComponent } from "../example-map/example-map-select/example-map-select.component";
import { ExampleMapSelectHoverClickComponent } from "../example-map/example-map-select-hover-click/example-map-select-hover-click.component";
import { ExampleMapSelectWmsComponent } from "../example-map/example-map-select-wms/example-map-select-wms.component";
import { ExampleMapSelectDatasetTreeComponent } from "../example-map/example-map-select-dataset-tree/example-map-select-dataset-tree.component";
import { ExampleFeatureInfoBasicComponent } from "../example-map/example-feature-info-basic/example-feature-info-basic.component";
import { ExampleFeatureInfoTabsComponent } from "../example-map/example-feature-info-tabs/example-feature-info-tabs.component";
import { ExampleFeatureInfoCustomNamesValuesComponent } from "../example-map/example-feature-info-custom-names-values/example-feature-info-custom-names-values.component";
import { Example3dBasicComponent } from "../example-3d/example-3d-basic/example-3d-basic.component";
import { ExampleSearchLocationOnlyLocationComponent } from "../example-search-location/example-search-location-only-location/example-search-location-only-location.component";
import { Example3dDatasetTreeLegendComponent } from "../example-3d/example-3d-dataset-tree-legend/example3d-dataset-tree-legend.component";
import { Example3dLayerCameraOptionsComponent } from "../example-3d/example-3d-layer-camera-options/example3d-layer-camera-options.component";
import { Example3dDatasetSwitcherComponent } from "../example-3d/example-3d-dataset-switcher/example3d-dataset-switcher.component";
import { Example3dFeatureInfoComponent } from "../example-3d/example-3d-feature-info/example3d-feature-info.component";
import { Example3dFeatureInfoAutoConnectComponent } from "../example-3d/example-3d-feature-info-auto-connect/example3d-feature-info-auto-connect.component";

interface GroupedCards {
  theme: string;
  cards: ComponentInfo[];
}

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
  protected themeOrder = [
    Themes.KAARTLAGEN,
    Themes.KAARTBEDIENING,
    Themes.INFORMATIE_OP_KAART,
    Themes.TEKENEN,
    Themes.LEGENDA,
    Themes.ZOEKEN,
    Themes.KAARTWEERGAVE_KIEZEN,
    Themes.WERKBALK
  ];
  protected selectedComponents = new Set<string>();
  protected selectedTags = new Set<string>();
  protected cards: ComponentInfo[] = [
    new ExampleSearchLocationComponent().componentInfo,
    new ExampleSearchLocationOnlyLocationComponent().componentInfo,
    new ExampleDatasetTreeBasicComponent().componentInfo,
    new ExampleDatasetTreeBasicListComponent().componentInfo,
    new ExampleDrawBasicComponent().componentInfo,
    new ExampleDrawStyle().componentInfo,
    new ExampleDatasetTreeTemplatesComponent().componentInfo,
    new ExampleDrawEditBasicComponent().componentInfo,
    new ExampleDrawCenterEditBasicComponent().componentInfo,
    new ExampleDrawTracingComponent().componentInfo,
    new ExampleSearchLocationWoonplaatsComponent().componentInfo,
    new ExampleSnappingBasicComponent().componentInfo,
    new ExampleDatasetSwitcherBasicComponent().componentInfo,
    new ExampleDatasetSwitcherRadioButtonsComponent().componentInfo,
    new ExampleLegendZoomComponent().componentInfo,
    new ExampleLegendDatasetTreeComponent().componentInfo,
    new ExampleDatasetTreeLayerEnabledCallback().componentInfo,
    new ExampleLayerImageComponent().componentInfo,
    new ExampleLayerWmsComponent().componentInfo,
    new ExampleLayerWmtsComponent().componentInfo,
    new ExampleLayerGeojsonComponent().componentInfo,
    new ExampleLayerGeojsonWfsComponent().componentInfo,
    new ExampleLayerGeojsonOgcComponent().componentInfo,
    new ExampleLayerVectorTileComponent().componentInfo,
    new ExampleLayerHtmlConfig().componentInfo,
    new ExampleLayerJsonConfig().componentInfo,
    new ExampleToolbar().componentInfo,
    new ExampleToolbarLocation().componentInfo,
    new ExampleDrawCenterDrawComponent().componentInfo,
    new ExampleMeasure().componentInfo,
    new ExampleMeasureOwnStyleLabel().componentInfo,
    new ExampleMapZoomScalePositionComponent().componentInfo,
    new ExampleMapSelectComponent().componentInfo,
    new ExampleMapSelectHoverClickComponent().componentInfo,
    new ExampleMapSelectWmsComponent().componentInfo,
    new ExampleMapSelectDatasetTreeComponent().componentInfo,
    new ExampleMapZoomScalePositionComponent().componentInfo,
    new ExampleFeatureInfoBasicComponent().componentInfo,
    new ExampleFeatureInfoTabsComponent().componentInfo,
    new ExampleFeatureInfoCustomNamesValuesComponent().componentInfo,
    new Example3dBasicComponent().componentInfo,
    new Example3dDatasetTreeLegendComponent().componentInfo,
    new Example3dLayerCameraOptionsComponent().componentInfo,
    new Example3dDatasetSwitcherComponent().componentInfo,
    new Example3dFeatureInfoComponent().componentInfo,
    new Example3dFeatureInfoAutoConnectComponent().componentInfo
  ];

  private readonly selectedComponentsKey = "selectedComponents";
  private readonly selectedTagsKey = "selectedTags";
  private readonly selectedThemesKey = "selectedThemes";
  private readonly searchTermKey = "searchTerm";

  constructor() {
    const storedSelectedThemes = sessionStorage.getItem(this.selectedThemesKey);
    if (storedSelectedThemes) {
      this.selectedThemes = new Set(JSON.parse(storedSelectedThemes));
    }

    const storedSelectedComponents = sessionStorage.getItem(
      this.selectedComponentsKey
    );
    if (storedSelectedComponents) {
      this.selectedComponents = new Set(JSON.parse(storedSelectedComponents));
    }

    const storedSelectedTags = sessionStorage.getItem(this.selectedTagsKey);
    if (storedSelectedTags) {
      this.selectedTags = new Set(JSON.parse(storedSelectedTags));
    }

    const storedSearchTerm = sessionStorage.getItem(this.searchTermKey);
    if (storedSearchTerm) {
      this.searchTerm = storedSearchTerm;
    }
  }

  protected get availableThemes(): string[] {
    const set = new Set<string>();
    for (const card of this.cards) {
      for (const tag of (card as any)?.theme ?? []) {
        set.add(tag);
      }
    }

    return this.sortArrayWithFixedOrder(Array.from(set), this.themeOrder);
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

  protected get groupedCards(): GroupedCards[] {
    return Object.entries(
      Object.groupBy(this.filteredCards(), (card) => card.theme.toString())
    )
      .filter(([, value]) => value)
      .sort(
        ([a], [b]) =>
          this.themeOrder.indexOf(a as Themes) -
          this.themeOrder.indexOf(b as Themes)
      )
      .map(([key, value]) => ({
        theme: key,
        cards: value!.slice().sort((c1, c2) => c1.title.localeCompare(c2.title))
      }));
  }

  protected storeSearchTerm(value: string) {
    this.searchTerm = value;
    sessionStorage.setItem("searchTerm", value);
  }

  protected toggleTheme(theme: string): void {
    if (this.selectedThemes.has(theme)) {
      this.selectedThemes.delete(theme);
    } else {
      this.selectedThemes.add(theme);
    }
    this.selectedThemes = new Set(this.selectedThemes);
    sessionStorage.setItem(
      this.selectedThemesKey,
      JSON.stringify(Array.from(this.selectedThemes))
    );
  }

  protected toggleComponent(component: string): void {
    if (this.selectedComponents.has(component)) {
      this.selectedComponents.delete(component);
    } else {
      this.selectedComponents.add(component);
    }
    this.selectedComponents = new Set(this.selectedComponents);
    sessionStorage.setItem(
      this.selectedComponentsKey,
      JSON.stringify(Array.from(this.selectedComponents))
    );
  }

  protected toggleTag(tag: string): void {
    if (this.selectedTags.has(tag)) {
      this.selectedTags.delete(tag);
    } else {
      this.selectedTags.add(tag);
    }
    this.selectedTags = new Set(this.selectedTags);
    sessionStorage.setItem(
      this.selectedTagsKey,
      JSON.stringify(Array.from(this.selectedTags))
    );
  }

  protected resetFilters(): void {
    this.clearComponentFilter();
    this.clearThemeFilter();
    this.clearTagFilter();
    this.searchTerm = "";
    sessionStorage.removeItem(this.searchTermKey);
  }

  protected clearThemeFilter(): void {
    this.selectedThemes = new Set<string>();
    sessionStorage.removeItem(this.selectedThemesKey);
  }

  protected clearComponentFilter(): void {
    this.selectedComponents = new Set<string>();
    sessionStorage.removeItem(this.selectedComponentsKey);
  }

  protected clearTagFilter(): void {
    this.selectedTags = new Set<string>();
    sessionStorage.removeItem(this.selectedTagsKey);
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
      return "";
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
