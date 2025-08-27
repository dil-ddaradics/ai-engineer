/**
 * CLI Command Handlers for AI Engineer
 *
 * Handles command-line interface for managing workflow states.
 * Supports commands: list, set, reset, current, backup, restore
 */

import { CliManager, DEMO_STATES, DemoState } from './index.js';
import * as path from 'path';

export interface CliOptions {
  args: string[];
}

/**
 * Main CLI runner function
 */
export async function runCli(args: string[]): Promise<void> {
  const cliManager = new CliManager();
  const command = args[0];
  const subArgs = args.slice(1);

  try {
    switch (command) {
      case 'list':
      case 'ls':
        await handleListCommand(cliManager);
        break;

      case 'set':
        await handleSetCommand(cliManager, subArgs);
        break;

      case 'reset':
      case 'clear':
        await handleResetCommand(cliManager);
        break;

      case 'current':
      case 'status':
        await handleCurrentCommand(cliManager);
        break;

      case 'backup':
        await handleBackupCommand(cliManager);
        break;

      case 'restore':
        await handleRestoreCommand(cliManager, subArgs);
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        if (!command) {
          showHelp();
        } else {
          console.error(`Unknown command: ${command}`);
          console.error('Run "npx ai-engineer help" for usage information.');
          process.exit(1);
        }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Handle 'list' command - show available demo states
 */
async function handleListCommand(cliManager: CliManager): Promise<void> {
  console.log('📋 Available Demo States:\n');

  const states = cliManager.listStates();
  const currentState = await cliManager.getCurrentState();

  states.forEach((state: DemoState) => {
    const indicator = currentState === state.state ? '→ ' : '  ';
    const status = currentState === state.state ? ' (current)' : '';

    console.log(`${indicator}${state.name}${status}`);
    console.log(`   ${state.displayName} - ${state.description}`);
    console.log(`   State: ${state.state}\n`);
  });

  if (!currentState) {
    console.log('💡 No current state detected. Use "set" command to choose a demo state.');
  }
}

/**
 * Handle 'set' command - set a specific demo state
 */
async function handleSetCommand(cliManager: CliManager, args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: Please specify a demo state name.');
    console.error('Use "npx ai-engineer list" to see available states.');
    process.exit(1);
  }

  const stateName = args[0];

  if (!DEMO_STATES[stateName]) {
    console.error(`❌ Error: Unknown demo state "${stateName}".`);
    console.error('Available states:', Object.keys(DEMO_STATES).join(', '));
    process.exit(1);
  }

  // Check if .ai directory exists and offer backup
  if (await cliManager.hasTaskDirectory()) {
    console.log('⚠️  Existing .ai/task directory detected.');
    console.log('This will replace your current task state.');
    console.log('Consider running "npx ai-engineer backup" first.\n');

    // In a real CLI, we'd prompt for confirmation here
    // For now, we'll just warn and proceed
    console.log('🔄 Proceeding with demo state setup...');
  }

  console.log(`🚀 Setting up demo state: ${DEMO_STATES[stateName].displayName}`);

  await cliManager.setState(stateName);

  console.log('✅ Demo state configured successfully!');

  if (stateName === '01-empty') {
    console.log('📁 Directory cleared - fresh start!');
  } else {
    console.log(
      `📁 Complete project structure created with state: ${DEMO_STATES[stateName].state}`
    );
  }

  console.log('\n💡 Next steps:');
  console.log('   - Open your AI assistant (Claude Code, Cursor, etc.)');
  console.log('   - Navigate to this directory');
  console.log('   - Use the ai-engineer MCP server to interact with the workflow');
}

/**
 * Handle 'reset' command - remove .ai directory
 */
async function handleResetCommand(cliManager: CliManager): Promise<void> {
  if (!(await cliManager.hasTaskDirectory())) {
    console.log('ℹ️  No .ai/task directory found. Nothing to reset.');
    return;
  }

  console.log('🧹 Removing .ai/task directory...');
  await cliManager.reset();
  console.log('✅ Task state cleared successfully!');
}

/**
 * Handle 'current' command - show current state
 */
async function handleCurrentCommand(cliManager: CliManager): Promise<void> {
  const currentState = await cliManager.getCurrentState();

  if (!currentState) {
    console.log('📭 No current state detected.');
    console.log('   - No .ai directory found, or');
    console.log('   - No state.json file exists');
    console.log('\n💡 Use "npx ai-engineer set <state>" to create a demo state.');
    return;
  }

  console.log('📊 Current State Information:\n');
  console.log(`State: ${currentState}`);

  // Find matching demo state for additional info
  const demoState = Object.values(DEMO_STATES).find(s => s.state === currentState);
  if (demoState) {
    console.log(`Demo: ${demoState.displayName}`);
    console.log(`Description: ${demoState.description}`);
  }

  // Show file structure
  console.log('\n📁 .ai Directory Structure:');
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const showDirectory = async (dir: string, prefix: string = '') => {
      try {
        const files = await fs.readdir(dir);
        files.sort();

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fullPath = path.join(dir, file);
          const stat = await fs.stat(fullPath);
          const isLast = i === files.length - 1;
          const connector = isLast ? '└── ' : '├── ';

          console.log(`${prefix}${connector}${file}`);

          if (stat.isDirectory()) {
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            await showDirectory(fullPath, newPrefix);
          }
        }
      } catch {
        // Directory might not exist or be accessible
      }
    };

    await showDirectory('.ai');
  } catch {
    console.log('   (Unable to read directory structure)');
  }
}

/**
 * Handle 'backup' command - backup current .ai directory
 */
async function handleBackupCommand(cliManager: CliManager): Promise<void> {
  if (!(await cliManager.hasTaskDirectory())) {
    console.log('ℹ️  No .ai/task directory found. Nothing to backup.');
    return;
  }

  console.log('💾 Creating backup of current .ai/task directory...');
  const backup = await cliManager.backup();

  console.log('✅ Backup created successfully!');
  console.log(`📁 Backup location: ${backup.backupPath}`);
  console.log(`⏰ Timestamp: ${backup.timestamp}`);
}

/**
 * Handle 'restore' command - restore from backup
 */
async function handleRestoreCommand(cliManager: CliManager, args: string[]): Promise<void> {
  const backups = await cliManager.listBackups();

  if (backups.length === 0) {
    console.log('📭 No backups found.');
    console.log('💡 Create a backup with "npx ai-engineer backup" before making changes.');
    return;
  }

  let backupFolderName: string | undefined;

  if (args.length > 0) {
    backupFolderName = args[0];
  } else {
    // Use most recent backup
    backupFolderName = path.basename(backups[0].backupPath);
    console.log(`🔄 Restoring from most recent backup: ${backupFolderName}`);
  }

  console.log('♻️  Restoring .ai/task directory from backup...');
  await cliManager.restore(backupFolderName);

  console.log('✅ Restore completed successfully!');
  console.log('📁 .ai/task directory restored from backup');

  // Show current state after restore
  const currentState = await cliManager.getCurrentState();
  if (currentState) {
    console.log(`📊 Current state: ${currentState}`);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
🧙‍♂️ AI Engineer CLI Tool

USAGE:
  npx ai-engineer <command> [options]

COMMANDS:
  list, ls              List all available demo states
  set <state-name>      Set up a specific demo state
  reset, clear          Remove current demo content
  current, status       Show current state and file structure
  backup                Create backup of current directory
  restore [path]        Restore from backup
  help, -h, --help      Show this help message

EXAMPLES:
  npx ai-engineer list
  npx ai-engineer set 01-empty
  npx ai-engineer set 05-plan-ready
  npx ai-engineer set 09-calculator-executed
  npx ai-engineer current

DEMO STATES:
  01-empty              Empty Start - Fresh directory
  02-context-gathering  Context Gathering - Working on context
  03-context-complete   Context Complete - Context established
  04-planning           Planning - Creating project plan
  05-plan-ready         Plan Ready - Complete plan ready
  06-setup-drafting     Setup Drafting - Project setup in progress
  07-setup-executed     Setup Executed - TypeScript + Jest ready
  08-calculator-drafting Calculator Drafting - Implementation in progress
  09-calculator-executed Calculator Executed - Full implementation
  10-pr-review          PR Review - Review feedback phase
  11-final-complete     Final Complete - Production ready

For more information, visit: https://github.com/your-org/ai-engineer
`);
}
