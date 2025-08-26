#!/usr/bin/env node

/**
 * AI Engineer Demo CLI
 *
 * Command-line tool for setting up demo states of the AI Engineer workflow.
 * Can be run with: npx ai-engineer-demo <command>
 */

import { runDemoCli } from '../dist/demo/cli.js';

// Run the CLI with command line arguments
runDemoCli(process.argv.slice(2))
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('Demo CLI error:', error.message);
    process.exit(1);
  });
