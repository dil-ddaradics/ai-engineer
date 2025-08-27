#!/usr/bin/env node

/**
 * AI Engineer CLI
 *
 * Command-line tool for managing workflow states of the AI Engineer.
 * Can be run with: npx ai-engineer <command>
 */

import { runCli } from '../dist/cli/cli.js';

// Run the CLI with command line arguments
runCli(process.argv.slice(2))
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('CLI error:', error.message);
    process.exit(1);
  });
