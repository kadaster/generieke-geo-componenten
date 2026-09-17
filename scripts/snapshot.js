#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.dirname(repoRoot);
const rootPackageJsonPath = path.join(repoRoot, 'package.json');
const angularJsonPath = path.join(repoRoot, 'angular.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args, cwd) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
  });
}

function runCapture(command, args, cwd) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function findFilesRecursive(startDir, fileName, maxDepth, currentDepth = 0, results = []) {
  if (!fs.existsSync(startDir) || currentDepth > maxDepth) {
    return results;
  }

  const entries = fs.readdirSync(startDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(startDir, entry.name);
    if (entry.isFile() && entry.name === fileName) {
      results.push(fullPath);
      continue;
    }

    if (entry.isDirectory()) {
      findFilesRecursive(fullPath, fileName, maxDepth, currentDepth + 1, results);
    }
  }

  return results;
}

function parseArgs(argv) {
  const options = {
    projects: null,
    targets: null,
    dryRun: false,
    interactive: process.stdout.isTTY,
    workspace: workspaceRoot,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--projects' || arg === '--packages') {
      options.projects = argv[index + 1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (arg === '--targets') {
      options.targets = argv[index + 1]
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
      index += 1;
      continue;
    }

    if (arg === '--workspace') {
      options.workspace = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--interactive') {
      options.interactive = true;
      continue;
    }

    if (arg === '--no-interactive') {
      options.interactive = false;
      continue;
    }

    throw new Error(`Onbekend argument: ${arg}`);
  }

  return options;
}

function getSnapshotSuffix() {
  const now = new Date();
  const parts = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, '0'),
    String(now.getUTCDate()).padStart(2, '0'),
    String(now.getUTCHours()).padStart(2, '0'),
    String(now.getUTCMinutes()).padStart(2, '0'),
    String(now.getUTCSeconds()).padStart(2, '0'),
    String(now.getUTCMilliseconds()).padStart(3, '0'),
  ];

  return `snapshot.${parts.join('')}`;
}

function getSnapshotVersion(baseVersion, snapshotSuffix) {
  const [mainVersion] = baseVersion.split('-');
  return `${mainVersion}-${snapshotSuffix}`;
}

function getProjectConfigs() {
  const angularConfig = readJson(angularJsonPath);
  const rootPackageJson = readJson(rootPackageJsonPath);
  const scripts = rootPackageJson.scripts || {};

  return Object.entries(angularConfig.projects)
    .filter(([, config]) => config.projectType === 'library')
    .map(([projectName, config]) => {
      const packageJsonPath = path.join(repoRoot, config.root, 'package.json');
      const packageJson = readJson(packageJsonPath);

      return {
        projectName,
        packageName: packageJson.name,
        packageJsonPath,
        packageRoot: path.dirname(packageJsonPath),
        projectRoot: path.join(repoRoot, config.root),
        distDir: path.join(repoRoot, 'dist', projectName),
        version: packageJson.version,
        dependencies: Object.keys(packageJson.dependencies || {}).filter((dep) => dep.startsWith('@kadaster/ggc-')),
        hasPackScript: Boolean(scripts[`pack:${projectName}`]),
      };
    })
    .filter((project) => project.hasPackScript)
    .sort((left, right) => left.projectName.localeCompare(right.projectName));
}

function getSelectedProjects(allProjects, requestedProjects) {
  if (!requestedProjects || requestedProjects.length === 0) {
    return allProjects;
  }

  const requestedSet = new Set(requestedProjects);
  const selected = allProjects.filter(
    (project) => requestedSet.has(project.projectName) || requestedSet.has(project.packageName),
  );

  const foundKeys = new Set(selected.flatMap((project) => [project.projectName, project.packageName]));
  const unknownProjects = requestedProjects.filter((name) => !foundKeys.has(name));

  if (unknownProjects.length > 0) {
    throw new Error(`Onbekende projecten/packages: ${unknownProjects.join(', ')}`);
  }

  return selected;
}

function sortProjectsByDependency(projects) {
  const byPackageName = new Map(projects.map((project) => [project.packageName, project]));
  const visited = new Set();
  const visiting = new Set();
  const sorted = [];

  function visit(project) {
    if (visited.has(project.projectName)) {
      return;
    }

    if (visiting.has(project.projectName)) {
      throw new Error(`Circulaire dependency gevonden rond ${project.projectName}`);
    }

    visiting.add(project.projectName);
    for (const dependency of project.dependencies) {
      const dependentProject = byPackageName.get(dependency);
      if (dependentProject) {
        visit(dependentProject);
      }
    }

    visiting.delete(project.projectName);
    visited.add(project.projectName);
    sorted.push(project);
  }

  for (const project of projects) {
    visit(project);
  }

  return sorted;
}

function getChangedFiles() {
  const output = runCapture('git', ['status', '--short'], repoRoot);
  if (!output) {
    return [];
  }

  return output
    .split('\n')
    .map((line) => line.slice(2).trim())
    .map((filePath) => {
      const renamedParts = filePath.split(' -> ');
      return renamedParts[renamedParts.length - 1].trim();
    })
    .filter(Boolean)
    .map((filePath) => (path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath)));
}

function getChangedProjects(allProjects) {
  const changedFiles = getChangedFiles();
  const changedProjects = [];

  for (const project of allProjects) {
    const hasChange = changedFiles.some((changedFile) => {
      const relativeToProject = path.relative(project.projectRoot, changedFile);
      return relativeToProject && !relativeToProject.startsWith('..') && !path.isAbsolute(relativeToProject);
    });

    if (hasChange) {
      changedProjects.push(project);
    }
  }

  return changedProjects;
}

function clearScreen() {
  process.stdout.write('\x1Bc');
}

function renderCheckboxPrompt({ title, items, cursorIndex, selectedIndexes, description }) {
  clearScreen();
  process.stdout.write(`${title}\n\n`);
  if (description) {
    process.stdout.write(`${description}\n\n`);
  }

  items.forEach((item, index) => {
    const cursor = index === cursorIndex ? '>' : ' ';
    const checked = selectedIndexes.has(index) ? 'x' : ' ';
    process.stdout.write(`${cursor} [${checked}] ${item}\n`);
  });

  process.stdout.write('\nGebruik pijltjes, spatie om te togglen, a voor alles, n voor niets, Enter om te bevestigen.\n');
}

function promptForCheckboxSelection({ title, items, defaultSelectedIndexes, description }) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return Promise.resolve([...defaultSelectedIndexes].sort((left, right) => left - right));
  }

  return new Promise((resolve, reject) => {
    const selectedIndexes = new Set(defaultSelectedIndexes);
    let cursorIndex = 0;
    let settled = false;

    function cleanup() {
      process.stdin.off('data', onData);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.pause();
      process.stdout.write('\n');
    }

    function finish(result) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      resolve(result);
    }

    function fail(error) {
      if (settled) {
        return;
      }
      settled = true;
      cleanup();
      reject(error);
    }

    function render() {
      renderCheckboxPrompt({
        title,
        items,
        cursorIndex,
        selectedIndexes,
        description,
      });
    }

    function onData(buffer) {
      const key = buffer.toString('utf8');

      if (key === '\u0003') {
        fail(new Error('Afgebroken.'));
        return;
      }

      if (key === '\u001b[A') {
        cursorIndex = cursorIndex > 0 ? cursorIndex - 1 : items.length - 1;
        render();
        return;
      }

      if (key === '\u001b[B') {
        cursorIndex = cursorIndex < items.length - 1 ? cursorIndex + 1 : 0;
        render();
        return;
      }

      if (key === ' ') {
        if (selectedIndexes.has(cursorIndex)) {
          selectedIndexes.delete(cursorIndex);
        } else {
          selectedIndexes.add(cursorIndex);
        }
        render();
        return;
      }

      if (key === 'a' || key === 'A') {
        items.forEach((_, index) => selectedIndexes.add(index));
        render();
        return;
      }

      if (key === 'n' || key === 'N') {
        selectedIndexes.clear();
        render();
        return;
      }

      if (key === '\r' || key === '\n') {
        finish([...selectedIndexes].sort((left, right) => left - right));
      }
    }

    process.stdin.setEncoding('utf8');
    process.stdin.resume();
    process.stdin.setRawMode(true);
    process.stdin.on('data', onData);
    render();
  });
}

async function promptForProjects(allProjects, changedProjects) {
  const changedNames = new Set(changedProjects.map((project) => project.projectName));
  const defaultSelectedIndexes = allProjects
    .map((project, index) => (changedNames.has(project.projectName) ? index : -1))
    .filter((index) => index >= 0);

  const selectedIndexes = await promptForCheckboxSelection({
    title: 'Beschikbare packages voor snapshot',
    description: '[*] in de label betekent dat er git-wijzigingen in die library zijn gevonden.',
    items: allProjects.map(
      (project) => `${changedNames.has(project.projectName) ? '*' : ' '} ${project.projectName} (${project.packageName})`,
    ),
    defaultSelectedIndexes,
  });

  return selectedIndexes.map((index) => allProjects[index]);
}

function writeSnapshotVersion(project, snapshotVersion) {
  const packageJson = readJson(project.packageJsonPath);
  packageJson.version = snapshotVersion;
  writeJson(project.packageJsonPath, packageJson);
}

function restoreVersion(project, originalVersion) {
  const packageJson = readJson(project.packageJsonPath);
  packageJson.version = originalVersion;
  writeJson(project.packageJsonPath, packageJson);
}

function cleanupOldTarballs(project) {
  if (!fs.existsSync(project.distDir)) {
    return;
  }

  for (const entry of fs.readdirSync(project.distDir)) {
    if (entry.endsWith('.tgz')) {
      fs.unlinkSync(path.join(project.distDir, entry));
    }
  }
}

function findGeneratedTarball(project) {
  const tarballs = fs
    .readdirSync(project.distDir)
    .filter((entry) => entry.endsWith('.tgz'))
    .sort();

  if (tarballs.length !== 1) {
    throw new Error(`Verwacht precies 1 tgz in ${project.distDir}, gevonden: ${tarballs.join(', ') || 'geen'}`);
  }

  return path.join(project.distDir, tarballs[0]);
}

function detectInstallTargets(workspace, packageNames, explicitTargets) {
  const packageJsonFiles = findFilesRecursive(workspace, 'package.json', 3);
  const targets = [];
  const normalizedExplicitTargets = explicitTargets
    ? explicitTargets.map((target) => path.resolve(workspace, target))
    : null;

  for (const packageJsonPath of packageJsonFiles) {
    const projectDir = path.dirname(packageJsonPath);
    if (projectDir === repoRoot) {
      continue;
    }

    const angularJsonCandidate = path.join(projectDir, 'angular.json');
    if (!fs.existsSync(angularJsonCandidate)) {
      continue;
    }

    const packageJson = readJson(packageJsonPath);
    const allDependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
      ...(packageJson.peerDependencies || {}),
      ...(packageJson.optionalDependencies || {}),
    };

    const matchingPackages = packageNames.filter((packageName) => Object.hasOwn(allDependencies, packageName));
    if (matchingPackages.length === 0) {
      continue;
    }

    if (
      normalizedExplicitTargets &&
      !normalizedExplicitTargets.includes(projectDir) &&
      !explicitTargets.includes(path.basename(projectDir)) &&
      !explicitTargets.includes(projectDir)
    ) {
      continue;
    }

    targets.push({
      name: packageJson.name || path.basename(projectDir),
      dir: projectDir,
      matchingPackages,
    });
  }

  return targets.sort((left, right) => left.dir.localeCompare(right.dir));
}

async function promptForTargets(targets) {
  const selectedIndexes = await promptForCheckboxSelection({
    title: 'Gevonden Angular-projecten voor installatie',
    items: targets.map(
      (target) => `${path.basename(target.dir)} - ${target.dir} :: ${target.matchingPackages.join(', ')}`,
    ),
    defaultSelectedIndexes: [],
  });

  return selectedIndexes.map((index) => targets[index]);
}

function ensureSnapshotDirectory(targetDir) {
  const snapshotDir = path.join(targetDir, '.snapshots', 'ggc');
  fs.mkdirSync(snapshotDir, { recursive: true });
  return snapshotDir;
}

function stageTarballs(target, orderedProjects, tarballsByPackageName, dryRun) {
  const stagedTarballsByPackageName = new Map();
  const snapshotDir = path.join(target.dir, '.snapshots', 'ggc');

  if (!dryRun) {
    fs.rmSync(snapshotDir, { recursive: true, force: true });
    ensureSnapshotDirectory(target.dir);
  }

  for (const project of orderedProjects) {
    if (!target.matchingPackages.includes(project.packageName)) {
      continue;
    }

    const sourceTarballPath = tarballsByPackageName.get(project.packageName);
    const targetTarballPath = path.join(snapshotDir, path.basename(sourceTarballPath));

    if (!dryRun) {
      fs.copyFileSync(sourceTarballPath, targetTarballPath);
    }

    stagedTarballsByPackageName.set(project.packageName, targetTarballPath);
  }

  return stagedTarballsByPackageName;
}

function installSnapshots(target, orderedProjects, stagedTarballsByPackageName, dryRun) {
  const installArgs = ['install'];

  for (const project of orderedProjects) {
    if (target.matchingPackages.includes(project.packageName)) {
      installArgs.push(path.relative(target.dir, stagedTarballsByPackageName.get(project.packageName)));
    }
  }

  if (installArgs.length === 1) {
    return;
  }

  console.log(`\n${dryRun ? '[dry-run] ' : ''}Installeren in ${target.dir}`);
  console.log(`Packages: ${target.matchingPackages.join(', ')}`);

  if (!dryRun) {
    run('npm', installArgs, target.dir);
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const allProjects = getProjectConfigs();
  const changedProjects = getChangedProjects(allProjects);
  const hasProjectChanges = changedProjects.length > 0;
  const baseSelection = options.projects
    ? getSelectedProjects(allProjects, options.projects)
    : options.interactive
      ? await promptForProjects(allProjects, changedProjects)
      : changedProjects.length > 0
        ? changedProjects
        : [];
  const selectedProjects = sortProjectsByDependency(baseSelection);

  if (selectedProjects.length === 0) {
    console.log(
      hasProjectChanges
        ? 'Geen packages geselecteerd.'
        : 'Geen gewijzigde library-packages gevonden. Kies interactief packages of gebruik --packages.',
    );
    return;
  }

  const snapshotSuffix = getSnapshotSuffix();
  const originalVersions = new Map(selectedProjects.map((project) => [project.projectName, project.version]));
  const tarballsByPackageName = new Map();
  const snapshotVersionsByProjectName = new Map(
    selectedProjects.map((project) => [project.projectName, getSnapshotVersion(project.version, snapshotSuffix)]),
  );

  console.log(`\nSnapshot suffix: ${snapshotSuffix}`);
  console.log(`Projecten: ${selectedProjects.map((project) => project.projectName).join(', ')}`);

  try {
    for (const project of selectedProjects) {
      const snapshotVersion = snapshotVersionsByProjectName.get(project.projectName);
      console.log(`\nBuilden en packen van ${project.projectName}`);
      writeSnapshotVersion(project, snapshotVersion);
      cleanupOldTarballs(project);

      if (!options.dryRun) {
        run('npm', ['run', `pack:${project.projectName}`], repoRoot);
      }

      const tarballPath = options.dryRun
        ? path.join(project.distDir, `<${project.projectName}-${snapshotVersion}.tgz>`)
        : findGeneratedTarball(project);

      tarballsByPackageName.set(project.packageName, tarballPath);
      console.log(`Tarball: ${tarballPath}`);
    }
  } finally {
    for (const project of selectedProjects) {
      restoreVersion(project, originalVersions.get(project.projectName));
    }
  }

  const detectedTargets = detectInstallTargets(
    options.workspace,
    selectedProjects.map((project) => project.packageName),
    options.targets,
  );

  if (detectedTargets.length === 0) {
    console.log('\nGeen Angular-projecten in de workspace gevonden met een dependency op de geselecteerde GGC-packages.');
    return;
  }

  const selectedTargets = options.targets || !options.interactive
    ? detectedTargets
    : await promptForTargets(detectedTargets);

  if (selectedTargets.length === 0) {
    console.log('\nGeen doelprojecten geselecteerd.');
    return;
  }

  console.log('\nInstallatiedoelen:');
  for (const target of selectedTargets) {
    console.log(`- ${target.dir} (${target.matchingPackages.join(', ')})`);
  }

  for (const target of selectedTargets) {
    const stagedTarballsByPackageName = stageTarballs(target, selectedProjects, tarballsByPackageName, options.dryRun);
    installSnapshots(target, selectedProjects, stagedTarballsByPackageName, options.dryRun);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
