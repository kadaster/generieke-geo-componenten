const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const PROJECTS_DIR = path.join(ROOT, "projects");
const GENERIC_README = path.join(ROOT, "README.md");

// Lees generieke README
function getGenericContent() {
  let content = fs.readFileSync(GENERIC_README, "utf-8");

  content = content.replace(
    " De documentatie in GGC Home (onder `/projects/ggc-home`) is gelicentieerd onder [Creative Commons Attribution Share Alike 4.0 International (`CC-BY-SA-4.0`)](https://creativecommons.org/licenses/by-sa/4.0/deed.nl).",
    ""
  );
  content = content.replace(
    "CONTRIBUTING.md",
    "https://github.com/kadaster/generieke-geo-componenten/tree/main?tab=contributing-ov-file"
  );

  return content;
}

// Verwerk elk project
function processProjects() {
  const genericContent = getGenericContent();

  const projects = fs.readdirSync(PROJECTS_DIR);
  projects.forEach((project) => {
    const projectPath = path.join(PROJECTS_DIR, project, "src");

    if (!fs.existsSync(projectPath)) return;

    const projectReadmePath = path.join(projectPath, "README.project.md");

    let projectSpecific = "";

    if (fs.existsSync(projectReadmePath)) {
      projectSpecific = fs.readFileSync(projectReadmePath, "utf-8");
    } else {
      console.log(
        `ℹ️ Geen project README voor ${project}, alleen generieke content`
      );
    }

    const title = `# Generieke Geo Componenten - ${project}`;

    // Titel weghalen, wordt later aan het begin toegevoegd
    let modifiedGeneric = genericContent.replace(/^# .*/m, "");

    // Alle projecten, behalve ggc-home, vallen onder EUPL v1.2. Daarom voor ggc-home de licentie vervangen:
    if (project === "ggc-home") {
      modifiedGeneric = modifiedGeneric.replace(
        "European Union Public License (EUPL) v1.2",
        "CC BY-SA 4.0 licentie"
      );
    }

    const finalContent = projectSpecific
      ? `${title}\n${projectSpecific}\n\n---\n${modifiedGeneric}`
      : `${title}${modifiedGeneric}`;

    const outputPath = path.join(projectPath, "README.md");

    fs.writeFileSync(outputPath, finalContent, "utf-8");

    console.log(`✅ README gegenereerd voor ${project}`);
  });
}

processProjects();
