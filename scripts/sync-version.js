#!/usr/bin/env node

/**
 * sync-version.js
 *
 * Scans the repository for plugin version references and updates them
 * to the current version from package.json.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// Get current version from package.json
const packageJson = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const CURRENT_VERSION = packageJson.version;

console.log(`Current version: ${CURRENT_VERSION}`);
if (DRY_RUN) {
  console.log('DRY RUN - no files will be modified\n');
}

const VERSION_FILES = [
  'package.json',
  'plugin.json',
  'scripts/install.js',
  'README.md',
];

const changes = [];
let filesUpdated = 0;

function updateJsonVersion(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    let modified = false;

    if (json.version && json.version !== CURRENT_VERSION) {
      const oldVersion = json.version;
      json.version = CURRENT_VERSION;
      modified = true;
      changes.push({
        file: relativePath,
        field: 'version',
        old: oldVersion,
        new: CURRENT_VERSION
      });
    }

    if (modified && !DRY_RUN) {
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      filesUpdated++;
    }
  } catch {
    // Skip
  }
}

function updateFileRegex(filePath, relativePath, regex, replacementFn, label) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updated = content.replace(regex, (match, ...groups) => {
      const result = replacementFn(match, ...groups);
      if (result !== match) {
        changes.push({
          file: relativePath,
          field: label,
          old: match.trim(),
          new: result.trim()
        });
      }
      return result;
    });

    if (updated !== content && !DRY_RUN) {
      fs.writeFileSync(filePath, updated, 'utf8');
      filesUpdated++;
    }
  } catch {
    // Skip
  }
}

console.log('Scanning for plugin version references...\n');

VERSION_FILES.forEach(relPath => {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) return;

  if (relPath.endsWith('.json')) {
    updateJsonVersion(fullPath, relPath);
  } else if (relPath === 'scripts/install.js') {
    updateFileRegex(
      fullPath,
      relPath,
      /v\d+\.\d+\.\d+/g,
      () => `v${CURRENT_VERSION}`,
      'install.js banner'
    );
  } else if (relPath === 'README.md') {
    updateFileRegex(
      fullPath,
      relPath,
      /engineering-docs-agy@\d+\.\d+\.\d+/g,
      () => `engineering-docs-agy@${CURRENT_VERSION}`,
      'README.md version'
    );
  }
});

console.log('='.repeat(60));
console.log(`Files checked: ${VERSION_FILES.length}`);
console.log(`Files updated: ${filesUpdated}`);
console.log('='.repeat(60));

if (changes.length > 0) {
  console.log('\nChanges:');
  changes.forEach(c => {
    console.log(`  ${c.file} [${c.field}]: ${c.old} -> ${c.new}`);
  });
} else {
  console.log('\nAll version references are up to date!');
}
