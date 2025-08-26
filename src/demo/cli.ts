/**
 * CLI Command Handlers for AI Engineer Demo Tool
 *
 * Handles command-line interface for managing demo states.
 * Supports commands: list, set, reset, current, backup, restore
 */

import { DemoManager, DEMO_STATES } from './index.js';

export interface CliOptions {
  args: string[];
}

/**
 * Main CLI runner function
 */
export async function runDemoCli(args: string[]): Promise<void> {
  const demoManager = new DemoManager();
  const command = args[0];
  const subArgs = args.slice(1);

  try {
    switch (command) {
      case 'list':
      case 'ls':
        await handleListCommand(demoManager);
        break;

      case 'set':
        await handleSetCommand(demoManager, subArgs);
        break;

      case 'reset':
      case 'clear':
        await handleResetCommand(demoManager);
        break;

      case 'current':
      case 'status':
        await handleCurrentCommand(demoManager);
        break;

      case 'backup':
        await handleBackupCommand(demoManager);
        break;

      case 'restore':
        await handleRestoreCommand(demoManager, subArgs);
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
          console.error('Run "npx ai-engineer-demo help" for usage information.');
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
async function handleListCommand(demoManager: DemoManager): Promise<void> {
  console.log('📋 Available Demo States:\n');

  const states = demoManager.listStates();
  const currentState = await demoManager.getCurrentState();

  states.forEach(state => {
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
async function handleSetCommand(demoManager: DemoManager, args: string[]): Promise<void> {
  if (args.length === 0) {
    console.error('❌ Error: Please specify a demo state name.');
    console.error('Use "npx ai-engineer-demo list" to see available states.');
    process.exit(1);
  }

  const stateName = args[0];

  if (!DEMO_STATES[stateName]) {
    console.error(`❌ Error: Unknown demo state "${stateName}".`);
    console.error('Available states:', Object.keys(DEMO_STATES).join(', '));
    process.exit(1);
  }

  // Check if .ai directory exists and offer backup
  if (await demoManager.hasAiDirectory()) {
    console.log('⚠️  Existing .ai directory detected.');
    console.log('This will replace your current .ai folder.');
    console.log('Consider running "npx ai-engineer-demo backup" first.\n');

    // In a real CLI, we'd prompt for confirmation here
    // For now, we'll just warn and proceed
    console.log('🔄 Proceeding with demo state setup...');
  }

  console.log(`🚀 Setting up demo state: ${DEMO_STATES[stateName].displayName}`);

  await demoManager.setState(stateName);

  console.log('✅ Demo state configured successfully!');
  console.log(`📁 .ai folder created with state: ${DEMO_STATES[stateName].state}`);
  console.log('\n💡 Next steps:');
  console.log('   - Open your AI assistant (Claude Code, Cursor, etc.)');
  console.log('   - Navigate to this directory');
  console.log('   - Use the ai-engineer MCP server to interact with the workflow');
}

/**
 * Handle 'reset' command - remove .ai directory
 */
async function handleResetCommand(demoManager: DemoManager): Promise<void> {
  if (!(await demoManager.hasAiDirectory())) {
    console.log('ℹ️  No .ai directory found. Nothing to reset.');
    return;
  }

  console.log('🧹 Removing .ai directory...');
  await demoManager.reset();
  console.log('✅ Demo state cleared successfully!');
}

/**
 * Handle 'current' command - show current state
 */
async function handleCurrentCommand(demoManager: DemoManager): Promise<void> {
  const currentState = await demoManager.getCurrentState();

  if (!currentState) {
    console.log('📭 No current state detected.');
    console.log('   - No .ai directory found, or');
    console.log('   - No state.json file exists');
    console.log('\n💡 Use "npx ai-engineer-demo set <state>" to create a demo state.');
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
async function handleBackupCommand(demoManager: DemoManager): Promise<void> {
  if (!(await demoManager.hasAiDirectory())) {
    console.log('ℹ️  No .ai directory found. Nothing to backup.');
    return;
  }

  console.log('💾 Creating backup of current .ai directory...');
  const backup = await demoManager.backup();

  console.log('✅ Backup created successfully!');
  console.log(`📁 Backup location: ${backup.backupPath}`);
  console.log(`⏰ Timestamp: ${backup.timestamp}`);
}

/**
 * Handle 'restore' command - restore from backup
 */
async function handleRestoreCommand(demoManager: DemoManager, args: string[]): Promise<void> {
  const backups = await demoManager.listBackups();

  if (backups.length === 0) {
    console.log('📭 No backups found.');
    console.log('💡 Create a backup with "npx ai-engineer-demo backup" before making changes.');
    return;
  }

  let backupPath: string | undefined;

  if (args.length > 0) {
    backupPath = args[0];
  } else {
    // Use most recent backup
    backupPath = backups[0].backupPath;
    console.log(`🔄 Restoring from most recent backup: ${backupPath}`);
  }

  console.log('♻️  Restoring .ai directory from backup...');
  await demoManager.restore(backupPath);

  console.log('✅ Restore completed successfully!');
  console.log('📁 .ai directory restored from backup');

  // Show current state after restore
  const currentState = await demoManager.getCurrentState();
  if (currentState) {
    console.log(`📊 Current state: ${currentState}`);
  }
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(`
🧙‍♂️ AI Engineer Demo Tool

USAGE:
  npx ai-engineer-demo <command> [options]

COMMANDS:
  list, ls              List all available demo states
  set <state-name>      Set up a specific demo state
  reset, clear          Remove current .ai directory
  current, status       Show current state and file structure
  backup                Create backup of current .ai directory
  restore [path]        Restore from backup (uses most recent if no path)
  help, -h, --help      Show this help message

EXAMPLES:
  npx ai-engineer-demo list
  npx ai-engineer-demo set gather-editing
  npx ai-engineer-demo current
  npx ai-engineer-demo backup
  npx ai-engineer-demo restore

DEMO STATES:
${Object.entries(DEMO_STATES)
  .map(([key, state]) => `  ${key.padEnd(20)} ${state.displayName}`)
  .join('\n')}

For more information, visit: https://github.com/your-org/ai-engineer
`);
}
