#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// CLI commands that should route to CLI tool
const cliCommands = [
  'list',
  'ls',
  'set',
  'reset',
  'clear',
  'current',
  'status',
  'backup',
  'restore',
  'help',
  '-h',
  '--help',
];

// Check if first argument is a CLI command
const firstArg = process.argv[2];
const isCliCommand = cliCommands.includes(firstArg);

if (isCliCommand) {
  // Route to CLI tool
  const cliPath = join(__dirname, 'cli.mjs');
  await import(cliPath);
} else {
  // Route to MCP server (default behavior)
  const serverPath = join(__dirname, 'server-cli.mjs');
  await import(serverPath);
}
