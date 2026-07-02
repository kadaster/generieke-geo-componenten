// Types
export interface ExamplePaths {
  /** example-feature-info-basic */
  folderName: string;
  /** src/app/examples/example-feature-info-basic */
  absoluteDir: string;
  /** example-feature-info-basic.component.ts */
  typescriptTemplate: string;
  /** example-feature-info-basic.component.html */
  htmlTemplate: string;
  /** example-feature-info-basic.component.scss */
  scssTemplate: string;
  /** ../example-feature-info-basic of .. */
  relativeImportPath: string;
  /** ../ of "" afhankelijk van directory structuur */
  examplesRootPath: string;
}

export interface ComponentMetadata {
  /** ExampleFeatureInfoBasicComponent */
  className: string;
  /** app-example-feature-info-basic */
  selector: string;
  /** /feature-info-basic */
  route: string;
}

export interface ComponentImports {
  /** Array van import statements */
  importStatements: string[];
  /** Array van Angular module/component namen */
  ngModuleNames: string[];
}

export interface ExampleMetadata {
  /** code/examples/examples/example-feature-info-basic/example-feature-info-basic.png */
  imagePath: string;
  /** examples/example-feature-info-basic/example-feature-info-basic.component.ts */
  componentModulePath: string;
}

// COMPONENT IMPORT MAPPING
export const componentImportMap = {
  GGC_MAP_3D: {
    import: 'import { GgcCesiumComponent } from "@kadaster/ggc-map-3d";',
    ngImport: "GgcCesiumComponent"
  },
  GGC_DATASET_TREE: {
    import:
      'import { GgcDatasetTreeComponent } from "@kadaster/ggc-dataset-tree";',
    ngImport: "GgcDatasetTreeComponent"
  },
  GGC_FEATURE_INFO: {
    import:
      'import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";',
    ngImport: "GgcFeatureInfoComponent"
  },
  GGC_LEGEND: {
    import: 'import { GgcLegendComponent } from "@kadaster/ggc-legend";',
    ngImport: "GgcLegendComponent"
  },
  GGC_MAP: {
    import: 'import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";',
    ngImport: "GgcMapComponent"
  },
  GGC_SEARCH_LOCATION: {
    import:
      'import { GgcSearchLocationComponent } from "@kadaster/ggc-search-location";',
    ngImport: "GgcSearchLocationComponent"
  },
  GGC_TOOLBAR: {
    import: 'import { GgcToolbarComponent } from "@kadaster/ggc-toolbar";',
    ngImport: "GgcToolbarComponent"
  }
} as const;

// HELPER FUNCTIONS
export function pascalCase(kebab: string): string {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function buildExamplePaths(
  exampleName: string,
  directory: string
): ExamplePaths {
  const folderName = `example-${exampleName}`;
  const isNestedInExamples = directory.startsWith("examples/");

  return {
    folderName,
    absoluteDir: `src/app/${directory}/${folderName}`,
    typescriptTemplate: `${folderName}.component.ts`,
    htmlTemplate: `${folderName}.component.html`,
    scssTemplate: `${folderName}.component.scss`,
    relativeImportPath: isNestedInExamples
      ? directory.replace(/^examples\//, "../")
      : "..",
    examplesRootPath: isNestedInExamples ? "../" : ""
  };
}

export function buildComponentMetadata(exampleName: string): ComponentMetadata {
  return {
    className: `Example${pascalCase(exampleName)}Component`,
    selector: `app-example-${exampleName}`,
    route: `/${exampleName}`
  };
}

export function resolveComponentImports(
  selectedComponents: string[]
): ComponentImports {
  return {
    importStatements: selectedComponents
      .map((key) => componentImportMap[key]?.import)
      .filter(Boolean),
    ngModuleNames: selectedComponents
      .map((key) => componentImportMap[key]?.ngImport)
      .filter(Boolean)
  };
}

export function buildExampleMetadata(
  directory: string,
  paths: ExamplePaths
): ExampleMetadata {
  const relativePath = paths.absoluteDir.replace("src/app/examples/", "");
  return {
    imagePath: `code/examples/${relativePath}/${paths.folderName}.png`,
    componentModulePath: `${relativePath}/${paths.folderName}.component.ts`
  };
}
