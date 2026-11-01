#!/usr/bin/env node
"use strict";

/**
 * check-progress.js — SessionStart hook for engineering-docs
 *
 * Checks whether a .engineering-docs/ folder exists in the current working
 * directory (or active Antigravity workspace), reads index.md if present,
 * and outputs a reminder about any in-progress or draft documentation.
 *
 * Supports both Antigravity JSON contract (stdin/stdout) and Claude Code / CLI stdout.
 */

const fs = require("fs");
const path = require("path");

function run() {
  let isAntigravity = false;
  let workspaceDir = process.cwd();

  // Read stdin if piped (Antigravity provides session context via stdin)
  if (!process.stdin.isTTY) {
    try {
      const stdinData = fs.readFileSync(0, "utf8");
      if (stdinData && stdinData.trim().startsWith("{")) {
        const payload = JSON.parse(stdinData);
        if (payload.workspacePaths || payload.conversationId) {
          isAntigravity = true;
          if (Array.isArray(payload.workspacePaths) && payload.workspacePaths.length > 0) {
            workspaceDir = payload.workspacePaths[0];
          }
        }
      }
    } catch {
      // Ignore stdin parse errors, fallback to process.cwd()
    }
  }

  const DOCS_DIR = path.join(workspaceDir, ".engineering-docs");
  const INDEX_FILE = path.join(DOCS_DIR, "index.md");

  // 1. Check if .engineering-docs/ exists
  if (!fs.existsSync(DOCS_DIR)) {
    if (isAntigravity) process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  // 2. Try to read index.md
  if (!fs.existsSync(INDEX_FILE)) {
    const msg = "[engineering-docs] A .engineering-docs/ folder exists but has no index.md. Run using-engineering-docs to initialize it.";
    if (isAntigravity) {
      process.stdout.write(JSON.stringify({ injectSteps: [{ systemMessage: { systemMessage: msg } }] }));
    } else {
      console.log(msg);
    }
    process.exit(0);
  }

  const content = fs.readFileSync(INDEX_FILE, "utf8");

  // 3. Look for in-progress or draft documents
  const draftLines = [];
  const lines = content.split("\n");

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("draft") || lower.includes("in-progress") || lower.includes("in progress")) {
      draftLines.push(line.trim());
    }
  }

  // 4. Count total documents mentioned
  const docLinks = content.match(/\[.*?\]\(.*?\.md\)/g) || [];

  if (draftLines.length === 0 && docLinks.length === 0) {
    if (isAntigravity) process.stdout.write(JSON.stringify({}));
    process.exit(0);
  }

  // 5. Build reminder message
  const reminderParts = [
    "[engineering-docs] Documentation in progress for this project:",
    `  - ${docLinks.length} document(s) in the index`
  ];

  if (draftLines.length > 0) {
    reminderParts.push(`  - ${draftLines.length} item(s) still in draft or in-progress status:`);
    for (const line of draftLines.slice(0, 5)) {
      const cleaned = line.replace(/\|/g, "").replace(/\s+/g, " ").trim();
      if (cleaned) reminderParts.push(`    > ${cleaned}`);
    }
    if (draftLines.length > 5) {
      reminderParts.push(`    ... and ${draftLines.length - 5} more`);
    }
  }

  reminderParts.push("");
  reminderParts.push("  To continue, invoke using-engineering-docs — it will read the existing index and resume from where you left off.");

  const fullReminder = reminderParts.join("\n");

  if (isAntigravity) {
    process.stdout.write(JSON.stringify({
      injectSteps: [
        {
          systemMessage: {
            systemMessage: fullReminder
          }
        }
      ]
    }));
  } else {
    console.log("");
    console.log(fullReminder);
    console.log("");
  }
}

try {
  run();
} catch {
  process.exit(0);
}
