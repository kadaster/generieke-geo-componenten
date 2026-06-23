import type { NodePlopAPI } from "plop";

// Components-enum key -> welke import(s) en welke class in de @Component.imports array
const componentImportMap = {
  GGC_MAP: {
    import: 'import { GgcMapComponent, Webservice } from "@kadaster/ggc-map";',
    ngImport: "GgcMapComponent"
  },
  GGC_FEATURE_INFO: {
    import:
      'import { GgcFeatureInfoComponent } from "@kadaster/ggc-feature-info";',
    ngImport: "GgcFeatureInfoComponent"
  }
};

// Mappen in /ggc-home/src/app/examples die je kan aanvinken in de prompt
const directoryChoices = [
  "examples",
  "examples/example-3d",
  "examples/example-dataset-switcher",
  "examples/example-dataset-tree",
  "examples/example-draw",
  "examples/example-format",
  "examples/example-index",
  "examples/example-layer",
  "examples/example-legend",
  "examples/example-map",
  "examples/example-measure",
  "examples/example-search-location",
  "examples/example-snapping",
  "examples/example-toolbar"
];

// Components-enum tags die je kan aanvinken in de prompt
const componentTagChoices = [
  "ggc-dataset-switcher",
  "ggc-dataset-tree",
  "ggc-legend",
  "ggc-map",
  "ggc-search-location",
  "ggc-toolbar",
  "ggc-feature-info",
  "ggc-3d / ggc-cesium"
];

// Tags-enum tags die je kan aanvinken in de prompt
const tagChoices = [
  "controls",
  "dataset",
  "draw",
  "highlight",
  "import",
  "keyboard",
  "layer",
  "legend",
  "location",
  "measure",
  "modify",
  "objectinfo",
  "OGC API",
  "scale",
  "search",
  "select",
  "snap",
  "style",
  "toolbar",
  "trace",
  "zoom"
];

// Themes-enum tags die je kan aanvinken in de prompt
const themeChoices = [
  "Informatie presenteren",
  "Kaartbediening",
  "Kaartlagen",
  "Kaartweergave kiezen",
  "Legenda",
  "Tekenen en meten",
  "Werkbalk",
  "Zoeken"
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function pascalCase(kebab) {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

// ---------------------------------------------------------------------------
// PLOP CONFIG
// ---------------------------------------------------------------------------

export default async function (plop: NodePlopAPI) {
  plop.setHelper("eq", (a, b) => a === b);
  plop.setGenerator("example", {
    description: "Nieuw GGC-Home voorbeeld genereren",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "Bestandsnaam (zonder 'example-' prefix, bv. 'feature-info-basic'):",
        validate: (v) =>
          /^[a-z]+(-[a-z]+)*$/.test(v) ||
          "Gebruik alleen kleine letters en koppeltekens"
      },
      {
        type: "list",
        name: "directory",
        message: "In welke directory hoort het voorbeeld:",
        choices: directoryChoices
      },
      {
        type: "list",
        name: "theme",
        message: "In welke categorie(thema) hoort het voorbeeld:",
        choices: themeChoices
      },
      {
        type: "input",
        name: "title",
        message:
          "Titel van voorbeeld (zichtbaar op index-card en op voorbeeldpagina):"
      },
      {
        type: "list",
        name: "layout",
        message: "Layout van de pagina: ",
        choices: [
          {
            name: "Een kolom (alleen kaart)",
            value: "one-column"
          },
          {
            name: "Twee kolommen (bediening links, kaart rechts)",
            value: "two-column"
          },
          {
            name: "Drie kolommen (bediening links, kaart midden, bediening rechts)",
            value: "three-column"
          }
        ]
      },
      {
        type: "checkbox",
        name: "componentImports",
        message:
          "Welke component worden gebruikt? (Kies alle componenten, dan worden ze geimporteerd): ",
        choices: Object.keys(componentImportMap),
        default: []
      },
      {
        type: "checkbox",
        name: "componentTags",
        message:
          "Welke component tag wil je toevoegen? (Kies standaard een compontent. Kies alleen meerdere componenten als het voorbeeld bedoeld is om de interactie tussen de componenten te laten zien)(laat leeg om later in te vullen): ",
        choices: componentTagChoices,
        default: []
      },
      {
        type: "checkbox",
        name: "tags",
        message: "Welke tags? (laat leeg om later in te vullen): ",
        choices: tagChoices,
        default: []
      },
      {
        type: "confirm",
        name: "confirm",
        message: (data) => {
          const comps = data.componentImports?.length
            ? data.componentImports.join(", ")
            : "(geen)";
          const tagsStr = data.tags?.length ? data.tags.join(", ") : "(geen)";

          return [
            "",
            "Dit gaat er gebeuren:",
            `  Map:          example-${data.name}`,
            `  Titel:        ${data.title}`,
            `  Layout:       ${data.layout}`,
            `  Componenten:  ${comps}`,
            `  Tags:         ${tagsStr}`,
            "",
            "Klopt dit? Bestanden nu aanmaken?"
          ].join("\n");
        },
        default: false
      }
    ],
    actions: (data) => {
      if (!data.confirm) {
        // geen bestanden aangemaakt, alleen een melding
        return [() => "Geannuleerd — er is niets aangemaakt."];
      }

      const kebab = data.name;
      const categoryFolder = data.directory;

      data.className = `Example${pascalCase(kebab)}Component`;
      data.selector = `app-example-${kebab}`;
      data.exampleFolder = `example-${kebab}`;
      data.categoryFolder = categoryFolder;
      data.componentInfoRoute = `/${kebab}`;
      data.imageLocation = `code/examples/${categoryFolder}/${data.exampleFolder}/${data.exampleFolder}.png`;
      data.urlComponentModule = `${categoryFolder}/${data.exampleFolder}/${data.exampleFolder}.component.ts`;
      data.theme = themeChoices[data.theme];
      // router naam

      data.componentImports = (data.componentImports ?? [])
        .map((c) => componentImportMap[c]?.import)
        .filter(Boolean);
      data.ngImports = (data.componentImports ?? [])
        .map((c) => componentImportMap[c]?.ngImport)
        .filter(Boolean);

      // Kan niet automatisch afgeleid worden -> na generatie zelf invullen
      data.tsDocsClass = "TODO_VERVANG_DIT_classpad";

      const dirLocation = `src/app/${categoryFolder}/${data.exampleFolder}`;
      console.log("data Classname:", data.className);
      console.log("categoryFolder: ./", categoryFolder);
      console.log("data.exampleFolder: /", data.exampleFolder);
      console.log("file: /", data.exampleFolder, ".component");
      console.log("plaatslocation:", dirLocation, "/", data.exampleFolder);
      const TEMPLATE_BASE = "src/app/examples/example-format";
      const stripped = categoryFolder.replace(/^examples\//, "");
      const actions = [
        {
          type: "add",
          path: `${dirLocation}/${data.exampleFolder}.component.html`,
          templateFile: `${TEMPLATE_BASE}/example.html.hbs`
        },
        {
          type: "add",
          path: `${dirLocation}/${data.exampleFolder}.component.ts`,
          templateFile: `${TEMPLATE_BASE}/example.ts.hbs`
        },
        {
          type: "modify",
          path: "src/app/examples/example-index/example-index.component.ts",
          pattern: /\/\/ PLOP:IMPORT/,
          template: `import { ${data.className} } from "../${stripped}/${data.exampleFolder}/${data.exampleFolder}.component";\n// PLOP:IMPORT`
        },
        {
          type: "modify",
          path: "src/app/examples/example-index/example-index.component.ts",
          pattern: /\/\/ PLOP:CARD/,
          template: `new ${data.className}().componentInfo,\n    // PLOP:CARD`
        }
      ];

      return actions;
    }
  });
}
