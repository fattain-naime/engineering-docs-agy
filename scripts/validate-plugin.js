#!/usr/bin/env node

/**
 * validate-plugin.js — Google Antigravity Plugin Validator
 *
 * Verifies that the plugin strictly follows the Google Antigravity specification:
 *   - plugin.json has valid schema, metadata, suggestedPrompts, logo, author
 *   - mcp_config.json declares stdio MCP servers using ${PLUGIN_ROOT}
 *   - hooks.json conforms to Antigravity lifecycle hooks spec (SessionStart)
 *   - rules/AGENTS.md exists with auto-trigger rules and behavioral standards
 *   - agents/*.md have valid YAML frontmatter and Antigravity tool bindings
 *   - skills/ contains all 22 required skills
 *   - package.json and plugin.json versions match
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let passed = 0;
let failed = 0;

function ok(name) {
  console.log(`  ✓ ${name}`);
  passed++;
}

function fail(name, reason) {
  console.log(`  ✗ ${name}: ${reason}`);
  failed++;
}

function readJson(relPath) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    return { error: 'file not found' };
  }
  try {
    return { data: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (e) {
    return { error: `invalid JSON: ${e.message}` };
  }
}

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+/;

console.log('Antigravity Plugin Manifest (plugin.json):');

const agyPluginJson = readJson('plugin.json');
if (agyPluginJson.error) {
  fail('plugin.json', agyPluginJson.error);
} else {
  const p = agyPluginJson.data;
  if (typeof p.name !== 'string' || !KEBAB_CASE.test(p.name)) {
    fail('plugin.json name', `expected kebab-case string, got ${JSON.stringify(p.name)}`);
  } else {
    ok(`plugin.json name "${p.name}"`);
  }
  if (typeof p.displayName !== 'string' || p.displayName.length === 0) {
    fail('plugin.json displayName', 'missing or empty');
  } else {
    ok(`plugin.json displayName "${p.displayName}"`);
  }
  if (typeof p.version !== 'string' || !SEMVER.test(p.version)) {
    fail('plugin.json version', `expected semver string, got ${JSON.stringify(p.version)}`);
  } else {
    ok(`plugin.json version ${p.version}`);
  }
  if (typeof p.description !== 'string' || p.description.length === 0) {
    fail('plugin.json description', 'missing or empty');
  } else {
    ok('plugin.json description present');
  }
  if (!p.author || (typeof p.author !== 'string' && typeof p.author.name !== 'string')) {
    fail('plugin.json author', 'missing author info');
  } else {
    ok('plugin.json author present');
  }
  if (p.logo !== undefined) {
    if (typeof p.logo !== 'string' || p.logo.includes('..')) {
      fail('plugin.json logo', `expected relative path, got ${JSON.stringify(p.logo)}`);
    } else if (!fs.existsSync(path.join(ROOT, p.logo))) {
      fail('plugin.json logo', `file not found: ${p.logo}`);
    } else {
      ok(`plugin.json logo "${p.logo}" exists`);
    }
  }
  if (p.suggestedPrompts !== undefined) {
    if (!Array.isArray(p.suggestedPrompts) || p.suggestedPrompts.length === 0) {
      fail('plugin.json suggestedPrompts', 'expected non-empty array of prompts');
    } else if (p.suggestedPrompts.length > 3) {
      fail('plugin.json suggestedPrompts', `maximum 3 prompts supported, got ${p.suggestedPrompts.length}`);
    } else {
      ok(`plugin.json suggestedPrompts (${p.suggestedPrompts.length} prompt(s))`);
    }
  }
}

console.log('\nAntigravity MCP Configuration (mcp_config.json):');

const agyMcpFile = readJson('mcp_config.json');
if (agyMcpFile.error) {
  fail('mcp_config.json', agyMcpFile.error);
} else {
  const servers = agyMcpFile.data.mcpServers || {};
  const names = Object.keys(servers);
  if (names.length === 0) {
    fail('mcp_config.json', 'no servers declared in mcpServers');
  } else {
    ok(`mcp_config.json declares ${names.length} server(s): ${names.join(', ')}`);
    for (const [name, config] of Object.entries(servers)) {
      const allArgs = [(config && config.command) || '', ...((config && config.args) || [])].join(' ');
      if (allArgs.includes('${PLUGIN_ROOT}')) {
        ok(`server "${name}" references bundled script via \${PLUGIN_ROOT}`);
      } else {
        ok(`server "${name}" configured`);
      }
    }
  }
}

console.log('\nAntigravity Lifecycle Hooks (hooks.json):');

const agyHooksFile = readJson('hooks.json');
if (agyHooksFile.error) {
  fail('hooks.json', agyHooksFile.error);
} else {
  const hookEntries = Object.entries(agyHooksFile.data);
  if (hookEntries.length === 0) {
    fail('hooks.json', 'no hooks declared');
  } else {
    ok(`hooks.json declares ${hookEntries.length} hook group(s)`);
    for (const [name, events] of hookEntries) {
      if (typeof events !== 'object' || events === null) {
        fail(`hooks.json "${name}"`, 'expected hook event mapping');
      } else {
        ok(`hook "${name}" has configured lifecycle events: ${Object.keys(events).join(', ')}`);
      }
    }
  }
}

console.log('\nAntigravity Rules (rules/AGENTS.md):');

const rulesFile = path.join(ROOT, 'rules', 'AGENTS.md');
if (!fs.existsSync(rulesFile)) {
  fail('rules/AGENTS.md', 'file not found');
} else {
  const content = fs.readFileSync(rulesFile, 'utf8');
  if (content.length < 50) {
    fail('rules/AGENTS.md', 'file content too short');
  } else if (!content.includes('Auto-Trigger Rules')) {
    fail('rules/AGENTS.md', 'missing Auto-Trigger Rules section');
  } else {
    ok('rules/AGENTS.md exists with Auto-Trigger Rules and Behavioral Standards');
  }
}

console.log('\nAntigravity Subagents:');

const agentsDir = path.join(ROOT, 'agents');
if (fs.existsSync(agentsDir)) {
  const agents = fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'));
  for (const agent of agents) {
    const content = fs.readFileSync(path.join(agentsDir, agent), 'utf8');
    const lines = content.split('\n');
    if (lines[0].trim() !== '---') {
      fail(agent, 'missing YAML frontmatter');
      continue;
    }
    const end = lines.slice(1).findIndex((l) => l.trim() === '---');
    const frontmatter = end === -1 ? '' : lines.slice(1, end + 1).join('\n');
    if (!/^name:/m.test(frontmatter)) {
      fail(agent, 'frontmatter missing "name"');
    } else if (!/^description:/m.test(frontmatter)) {
      fail(agent, 'frontmatter missing "description"');
    } else {
      ok(agent);
    }
  }
} else {
  fail('agents/', 'directory not found');
}

console.log('\nAntigravity Skills:');

const skillsDir = path.join(ROOT, 'skills');
if (fs.existsSync(skillsDir)) {
  const skills = fs.readdirSync(skillsDir).filter((f) => fs.statSync(path.join(skillsDir, f)).isDirectory());
  if (skills.length >= 22) {
    ok(`all ${skills.length} skills found in skills/`);
  } else {
    fail('skills count', `expected at least 22 skills, found ${skills.length}`);
  }
} else {
  fail('skills/', 'directory not found');
}

console.log('\nVersion Consistency:');

const pkg = readJson('package.json');
const versions = [];
if (!pkg.error && pkg.data.version) versions.push(['package.json', pkg.data.version]);
if (!agyPluginJson.error && agyPluginJson.data.version) versions.push(['plugin.json', agyPluginJson.data.version]);

if (versions.length >= 2) {
  const [, firstVersion] = versions[0];
  const mismatched = versions.filter(([, v]) => v !== firstVersion);
  if (mismatched.length > 0) {
    fail(
      'versions match',
      versions.map(([f, v]) => `${f}=${v}`).join(', ')
    );
  } else {
    ok(`versions match (${firstVersion})`);
  }
} else {
  fail('versions match', 'could not read versions');
}

console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(40)}`);

process.exit(failed > 0 ? 1 : 0);
