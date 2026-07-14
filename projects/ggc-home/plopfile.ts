import type { NodePlopAPI } from "plop";
// @ts-ignore
import {
  buildExamplePaths,
  buildComponentMetadata,
  resolveComponentImports,
  buildExampleMetadata,
  componentImportMap
} from "./plop-helpers.ts";
// @ts-ignore
import {
  directoryChoices,
  componentTagChoices,
  tagChoices,
  themeChoices,
  layoutChoices
} from "./plop-config.ts";

export default async function (plop: NodePlopAPI) {
  plop.setHelper("eq", (a, b) => a === b);
  plop.setGenerator("example", {
    description: "Nieuw GGC-Home voorbeeld genereren",
    prompts: [
      {
        type: "list",
        name: "directory",
        message: "In welke directory hoort het voorbeeld:",
        choices: directoryChoices
      },
      {
        type: "input",
        name: "customDirectory",
        message:
          "Geef de parent directory op (bijv. 'example-draw' voor submap. Let op: alle directories starten met 'example-'):",
        when: (answers) => answers.directory === "Aangepaste map...",
        validate: (v) => {
          // Lege string is OK (betekent 'examples' root)
          if (v.trim() === "") {
            return true;
          }
          if (!/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/.test(v)) {
            return "Gebruik alleen kleine letters, cijfers, koppeltekens en slashes";
          }
          return true;
        },
        filter: (v) => {
          // Als leeg, gebruik 'examples' als root directory
          if (!v || v.trim() === "") {
            return "examples";
          }
          // Voeg 'examples/' toe als het niet al aanwezig is
          if (!v.startsWith("examples/") && v !== "examples") {
            return v.startsWith("/") ? `examples${v}` : `examples/${v}`;
          }
          return v;
        }
      },
      {
        type: "input",
        name: "name",
        message:
          "Hoe heten de bestanden (zonder 'example-' prefix, bv. 'feature-info-basic'):",
        validate: (v) =>
          /^[a-z0-9]+(-[a-z0-9]+)*$/.test(v) ||
          "Gebruik alleen kleine letters, cijfers en koppeltekens"
      },

      {
        type: "list",
        name: "theme",
        message: "In welke categorie (thema) hoort het voorbeeld:",
        choices: themeChoices
      },
      {
        type: "input",
        name: "title",
        message:
          "Titel van voorbeeld (zichtbaar op index-card en op voorbeeldpagina. Voorbeelden: Objectinformatie weergeven, Kaartlaag toevoegen, Dataset wisselen):"
      },
      {
        type: "list",
        name: "layout",
        message: "Hoeveel kolommen wil je op de pagina:",
        choices: layoutChoices
      },
      {
        type: "checkbox",
        name: "componentImports",
        message: "Welke componenten moeten worden geimporteerd:",
        choices: Object.keys(componentImportMap)
      },
      {
        type: "checkbox",
        name: "componentTags",
        message:
          "Welke component tag wil je toevoegen? (Kies standaard één component. Kies alleen meerdere componenten als het voorbeeld bedoeld is om de interactie tussen de componenten te laten zien) (laat leeg om later in te vullen):",
        choices: componentTagChoices
      },
      {
        type: "checkbox",
        name: "tags",
        message: "Welke tags? (laat leeg om later in te vullen):",
        choices: tagChoices,
        default: []
      },
      {
        type: "input",
        name: "route",
        message:
          "Welke titel voor de router? (wordt in tabblad in browser getoond, houd het zo kort mogelijk. Er wordt automatisch '| GGC-Home' achter gevoegd):"
      },
      {
        type: "confirm",
        name: "scss",
        message: "Wil je een scss toevoegen:"
      },
      {
        type: "confirm",
        name: "includeMap",
        message: "Wil je een kaart met kaartconfiguratie toevoegen:"
      },
      {
        type: "confirm",
        name: "confirm",
        message: (data) => {
          const comps = data.componentImports?.length
            ? data.componentImports.join(", ")
            : "(geen)";
          const tagsStr = data.tags?.length ? data.tags.join(", ") : "(geen)";
          const compTagStr = data.componentTags?.length
            ? data.componentTags.join(", ")
            : "(geen)";

          const actualDirectory =
            data.directory === "Aangepaste map..."
              ? data.customDirectory
              : data.directory;

          return [
            "",
            "Dit gaat er gebeuren:",
            `  Directory:           ${actualDirectory}/example-${data.name}`,
            `  Titel:               ${data.title}`,
            `  Theme:               ${data.theme}`,
            `  Layout:              ${data.layout}`,
            `  Component imports:   ${comps}`,
            `  Component tags:      ${compTagStr}`,
            `  Tags:                ${tagsStr}`,
            `  Tabblad naam:        ${data.route}`,
            `  SCSS:                ${data.scss}`,
            `  Map:                 ${data.includeMap}`,
            "",
            "Klopt dit?"
          ].join("\n");
        },
        default: false
      }
    ],
    actions: (data) => {
      if (!data.confirm) {
        return [() => "Geannuleerd — er is niets aangemaakt."];
      }

      // Gebruik customDirectory als directory "Aangepaste map..." is
      const actualDirectory =
        data.directory === "Aangepaste map..."
          ? data.customDirectory
          : data.directory;

      const paths = buildExamplePaths(data.name, actualDirectory);
      const component = buildComponentMetadata(data.name);

      // Auto-import ggc-map als includeMap true is en nog niet geïmporteerd
      const componentImports = data.componentImports ?? [];
      if (data.includeMap && !componentImports.includes("GGC_MAP")) {
        componentImports.push("GGC_MAP");
      }

      const imports = resolveComponentImports(componentImports);
      const metadata = buildExampleMetadata(actualDirectory, paths);

      Object.assign(data, {
        // Component metadata
        className: component.className,
        selector: component.selector,
        componentInfoRoute: component.route,

        // Paths
        exampleFolder: paths.folderName,
        categoryFolder: actualDirectory,
        examplesRoot: paths.examplesRootPath,

        // Imports
        componentImports: imports.importStatements,
        ngImports: imports.ngModuleNames,

        // Metadata
        imageLocation: metadata.imagePath,
        urlComponentModule: metadata.componentModulePath,

        // Kan niet automatisch worden afgeleid, moet na generatie handmatig ingevuld worden
        tsDocsClass: "TODO_VERVANG_DIT_classpad"
      });

      const TEMPLATE_BASE = "src/app/examples/example-format";

      const actions = [
        {
          type: "add",
          path: `${paths.absoluteDir}/${paths.htmlTemplate}`,
          templateFile: `${TEMPLATE_BASE}/example.html.hbs`
        },
        {
          type: "add",
          path: `${paths.absoluteDir}/${paths.typescriptTemplate}`,
          templateFile: `${TEMPLATE_BASE}/example.ts.hbs`
        },

        {
          type: "add",
          path: `${paths.absoluteDir}/example-{{name}}.png`,
          templateFile: `${TEMPLATE_BASE}/example-placeholder.png`
        },

        // Update example index
        {
          type: "modify",
          path: "src/app/examples/example-index/example-index.component.ts",
          pattern: /\/\/ PLOP:IMPORT/,
          template: `import { ${component.className} } from "${paths.relativeImportPath}/${paths.folderName}/${paths.folderName}.component";\n// PLOP:IMPORT`
        },
        {
          type: "modify",
          path: "src/app/examples/example-index/example-index.component.ts",
          pattern: /\/\/ PLOP:CARD/,
          template: `new ${component.className}().componentInfo,\n    // PLOP:CARD`
        },

        // Update app routes
        {
          type: "modify",
          path: "src/app/app.routes.ts",
          pattern: /\/\/ PLOP:ROUTE/,
          template: `{
    path: "${data.name}",
    title: "${data.route} | GGC-Home",
    component: ${component.className},
    data: { label: "${data.name}" }
  },
  // PLOP:ROUTE`
        },
        {
          type: "modify",
          path: "src/app/app.routes.ts",
          pattern: /\/\/ PLOP:IMPORTROUTE/,
          template: `import { ${component.className} } from "./${actualDirectory}/${paths.folderName}/${paths.folderName}.component";\n// PLOP:IMPORTROUTE`
        }
      ];

      if (data.includeMap) {
        actions.push({
          type: "add",
          path: `${paths.absoluteDir}/kaartconfig.json`,
          templateFile: `${TEMPLATE_BASE}/kaartconfig.json.hbs`
        });
      }

      if (data.scss) {
        actions.push({
          type: "add",
          path: `${paths.absoluteDir}/${paths.scssTemplate}`,
          templateFile: `${TEMPLATE_BASE}/example.scss.hbs`
        });
      }

      return actions;
    }
  });
}
