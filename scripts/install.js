#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI Colors
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

console.log(`
${CYAN}${BOLD}+-------------------------------------------------+
|                                                 |
|     ENGINEERING DOCUMENTATION PLUGIN (AGY)      |
|           Google Antigravity Edition            |
|              v1.0.0 - 22 Skills                 |
|                                                 |
+-------------------------------------------------+${RESET}
`);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const homeDir = process.env.USERPROFILE || process.env.HOME;
const workDir = process.cwd();

const OPTIONS = [
  {
    name: 'Google Antigravity - Global (~/.gemini/config/plugins/engineering-docs)',
    path: path.join(homeDir, '.gemini', 'config', 'plugins', 'engineering-docs'),
    flag: '--global',
    alias: '-g',
    kind: 'antigravity'
  },
  {
    name: 'Google Antigravity - Workspace (.agents/plugins/engineering-docs)',
    path: path.join(workDir, '.agents', 'plugins', 'engineering-docs'),
    flag: '--local',
    alias: '-l',
    kind: 'antigravity'
  }
];

function copyFolderSync(from, to) {
  if (fs.cpSync) {
    fs.cpSync(from, to, { recursive: true, force: true });
  } else {
    if (!fs.existsSync(to)) {
      fs.mkdirSync(to, { recursive: true });
    }
    fs.readdirSync(from).forEach(element => {
      const srcEl = path.join(from, element);
      const destEl = path.join(to, element);
      if (fs.lstatSync(srcEl).isDirectory()) {
        copyFolderSync(srcEl, destEl);
      } else {
        fs.copyFileSync(srcEl, destEl);
      }
    });
  }
}

function installAntigravity(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  ['plugin.json', 'mcp_config.json', 'hooks.json', 'README.md', 'LICENSE', 'package.json'].forEach(file => {
    const srcFile = path.join(srcDir, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, path.join(destDir, file));
      console.log(`  ${GREEN}copied ${file}${RESET}`);
    }
  });

  ['skills', 'agents', 'rules', 'hooks', 'assets', 'scripts'].forEach(dir => {
    const srcSubDir = path.join(srcDir, dir);
    if (fs.existsSync(srcSubDir)) {
      copyFolderSync(srcSubDir, path.join(destDir, dir));
      console.log(`  ${GREEN}copied ${dir}/${RESET}`);
    }
  });

  console.log(`  ${GREEN}Antigravity plugin installed successfully${RESET}`);
}

function installTo(selected) {
  const srcDir = path.join(__dirname, '..');
  installAntigravity(srcDir, selected.path);
}

function handleChoice(input) {
  const cleanInput = input.trim().toUpperCase();
  if (cleanInput === 'Q') {
    console.log(`\n${YELLOW}Installation cancelled.${RESET}\n`);
    rl.close();
    process.exit(0);
  }

  const choice = parseInt(cleanInput, 10);
  if (isNaN(choice) || choice < 1 || choice > OPTIONS.length) {
    console.log(`\n${RED}Invalid choice. Please select 1, 2, or Q.${RESET}\n`);
    showMenu();
    return;
  }

  const selected = OPTIONS[choice - 1];
  console.log(`\n${GREEN}Installing to: ${RESET}${BOLD}${selected.path}${RESET}...\n`);

  try {
    installTo(selected);
    console.log(`\n${GREEN}${BOLD}Installation Completed Successfully!${RESET}\n`);
    console.log(`${YELLOW}Note: Restart Antigravity or open a new conversation to load the plugin.${RESET}\n`);
  } catch (err) {
    console.error(`\n${RED}Error during installation:${RESET}`, err.message);
  }

  rl.close();
}

function showMenu() {
  console.log(`${BOLD}Select installation target for Google Antigravity:${RESET}\n`);
  OPTIONS.forEach((opt, idx) => {
    console.log(`  ${CYAN}[${idx + 1}]${RESET} ${BOLD}${opt.name}${RESET}`);
    console.log('      Target: ' + YELLOW + opt.path + RESET + '\n');
  });
  console.log(`  ${CYAN}[Q]${RESET} Quit\n`);
  rl.question(`${BOLD}Enter your choice (1-${OPTIONS.length} or Q): ${RESET}`, handleChoice);
}

const args = process.argv.slice(2);

function runDirectInstall(selectedOption) {
  rl.close();
  console.log(`\n${GREEN}Installing to: ${RESET}${BOLD}${selectedOption.path}${RESET}...\n`);
  try {
    installTo(selectedOption);
    console.log(`\n${GREEN}${BOLD}Installation Completed Successfully!${RESET}\n`);
    console.log(`${YELLOW}Note: Restart Antigravity or open a new conversation to load the plugin.${RESET}\n`);
  } catch (err) {
    console.error(`\n${RED}Error during installation:${RESET}`, err.message);
    process.exit(1);
  }
  process.exit(0);
}

for (const option of OPTIONS) {
  if (args.includes(option.flag) || (option.alias && args.includes(option.alias))) {
    runDirectInstall(option);
  }
}

if (args.includes('--help') || args.includes('-h')) {
  rl.close();
  console.log(`Usage: npx engineering-docs-agy [options]

Options:
  install              Show interactive menu (default)
  --global, -g         Install globally (~/.gemini/config/plugins/engineering-docs)
  --local, -l          Install to current workspace (.agents/plugins/engineering-docs)
  --help, -h           Show this help menu
`);
  process.exit(0);
}

showMenu();
