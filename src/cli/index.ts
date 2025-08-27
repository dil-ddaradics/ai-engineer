/**
 * Demo State Management for AI Engineer
 *
 * Core functionality for managing demo states of the AI Engineer workflow.
 * Provides methods to list, set, reset, and backup demo states.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { StateName } from '../state-machine/types';

export interface DemoState {
  name: string;
  displayName: string;
  description: string;
  state: StateName;
}

export interface TaskBackup {
  timestamp: string;
  originalPath: string;
  backupPath: string;
}

/**
 * Available demo states with their configurations
 */
export const DEMO_STATES: Record<string, DemoState> = {
  '01-empty': {
    name: '01-empty',
    displayName: 'Empty Start',
    description: 'Completely empty directory - fresh start',
    state: 'GATHER_NEEDS_CONTEXT',
  },
  '02-context-gathering': {
    name: '02-context-gathering',
    displayName: 'Context Gathering',
    description: 'Working on project context for calculator',
    state: 'GATHER_EDITING_CONTEXT',
  },
  '03-context-complete': {
    name: '03-context-complete',
    displayName: 'Context Complete',
    description: 'Calculator project context established',
    state: 'GATHER_EDITING_CONTEXT',
  },
  '04-planning': {
    name: '04-planning',
    displayName: 'Planning',
    description: 'Creating project plan with acceptance criteria',
    state: 'GATHER_EDITING',
  },
  '05-plan-ready': {
    name: '05-plan-ready',
    displayName: 'Plan Ready',
    description: 'Complete plan with calculator acceptance criteria',
    state: 'GATHER_EDITING',
  },
  '06-setup-drafting': {
    name: '06-setup-drafting',
    displayName: 'Setup Drafting',
    description: 'TypeScript project setup task in progress',
    state: 'ACHIEVE_TASK_DRAFTING',
  },
  '07-setup-executed': {
    name: '07-setup-executed',
    displayName: 'Setup Executed',
    description: 'TypeScript + Jest project fully configured',
    state: 'ACHIEVE_TASK_EXECUTED',
  },
  '08-calculator-drafting': {
    name: '08-calculator-drafting',
    displayName: 'Calculator Drafting',
    description: 'Calculator implementation task in progress',
    state: 'ACHIEVE_TASK_DRAFTING',
  },
  '09-calculator-executed': {
    name: '09-calculator-executed',
    displayName: 'Calculator Executed',
    description: 'Calculator fully implemented with complete tests',
    state: 'ACHIEVE_TASK_EXECUTED',
  },
  '10-pr-review': {
    name: '10-pr-review',
    displayName: 'PR Review',
    description: 'Pull request review with feedback collected',
    state: 'PR_GATHERING_COMMENTS_G',
  },
  '11-final-complete': {
    name: '11-final-complete',
    displayName: 'Final Complete',
    description: 'All feedback addressed, production ready',
    state: 'ACHIEVE_COMPLETE',
  },
};

export class CliManager {
  private readonly taskDir = '.ai/task';
  private readonly backupDir = '.ai/backups';
  private readonly demosDir: string;

  constructor() {
    // Find demos directory relative to this module location
    // When compiled to dist/demo/index.js, demos is at ../../demos/
    // When running from source, demos is at ../../../demos/
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this.demosDir = path.resolve(__dirname, '..', '..', 'demos');
  }

  /**
   * List all available demo states
   */
  listStates(): DemoState[] {
    return Object.values(DEMO_STATES);
  }

  /**
   * Get current state from state.json if it exists
   */
  async getCurrentState(): Promise<string | null> {
    try {
      const stateFile = path.join(this.taskDir, 'state.json');
      const content = await fs.readFile(stateFile, 'utf-8');
      const state = JSON.parse(content);
      return state.currentState || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if .ai/task directory exists
   */
  async hasTaskDirectory(): Promise<boolean> {
    try {
      await fs.access(this.taskDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Backup current .ai/task directory
   */
  async backup(): Promise<TaskBackup> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.backupDir, timestamp);

    if (!(await this.hasTaskDirectory())) {
      throw new Error('No .ai/task directory exists to backup');
    }

    // Ensure backup directory exists
    await fs.mkdir(this.backupDir, { recursive: true });

    await this.copyDirectory(this.taskDir, backupPath);

    return {
      timestamp,
      originalPath: this.taskDir,
      backupPath,
    };
  }

  /**
   * Restore from backup by folder name
   */
  async restore(backupFolderName?: string): Promise<void> {
    if (!backupFolderName) {
      // Find most recent backup
      const backups = await this.listBackups();
      if (backups.length === 0) {
        throw new Error('No backups found');
      }
      backupFolderName = path.basename(backups[0].backupPath);
    }

    const backupPath = path.join(this.backupDir, backupFolderName);

    // Check if backup exists
    try {
      await fs.access(backupPath);
    } catch {
      throw new Error(`Backup not found: ${backupFolderName}`);
    }

    // Remove current .ai/task directory if it exists
    if (await this.hasTaskDirectory()) {
      await fs.rm(this.taskDir, { recursive: true, force: true });
    }

    // Restore from backup
    await this.copyDirectory(backupPath, this.taskDir);
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<TaskBackup[]> {
    try {
      // Check if backup directory exists
      try {
        await fs.access(this.backupDir);
      } catch {
        return []; // No backups directory exists
      }

      const files = await fs.readdir(this.backupDir);
      const backups: TaskBackup[] = [];

      for (const file of files) {
        const backupPath = path.join(this.backupDir, file);
        const stat = await fs.stat(backupPath);

        if (stat.isDirectory()) {
          backups.push({
            timestamp: file, // folder name is the timestamp
            originalPath: this.taskDir,
            backupPath,
          });
        }
      }

      // Sort by timestamp (newest first)
      return backups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch {
      return [];
    }
  }

  /**
   * Set demo state by copying from demos folder
   */
  async setState(stateName: string): Promise<void> {
    const demoState = DEMO_STATES[stateName];
    if (!demoState) {
      throw new Error(
        `Unknown demo state: ${stateName}. Available states: ${Object.keys(DEMO_STATES).join(', ')}`
      );
    }

    // Safety checks to prevent accidental cleanup
    await this.performSafetyChecks();

    const demoSourcePath = path.join(this.demosDir, stateName);

    // Check if demo folder exists
    try {
      await fs.access(demoSourcePath);
    } catch {
      throw new Error(`Demo folder not found: ${demoSourcePath}`);
    }

    // For 01-empty, just create empty directory
    if (stateName === '01-empty') {
      // Remove everything in current directory except node_modules
      const files = await fs.readdir('.');
      for (const file of files) {
        if (file !== 'node_modules') {
          await fs.rm(file, { recursive: true, force: true });
        }
      }
      return;
    }

    // For other states, copy entire project
    // Remove existing files (except node_modules only)
    const files = await fs.readdir('.');
    for (const file of files) {
      if (file !== 'node_modules') {
        await fs.rm(file, { recursive: true, force: true });
      }
    }

    // Copy demo state content to current directory
    await this.copyDirectory(demoSourcePath, '.');
  }

  /**
   * Reset (remove) .ai/task directory
   */
  async reset(): Promise<void> {
    if (await this.hasTaskDirectory()) {
      await fs.rm(this.taskDir, { recursive: true, force: true });
    }
  }

  /**
   * Perform safety checks before allowing cleanup operations
   */
  private async performSafetyChecks(): Promise<void> {
    // Check if .gitignore exists
    try {
      await fs.access('.gitignore');
      throw new Error(
        'Safety check failed: .gitignore file detected. Demo cleanup is disabled to prevent accidental deletion of a real project.'
      );
    } catch (error: unknown) {
      // If this is our safety error, re-throw it
      if (error instanceof Error && error.message.includes('Safety check failed')) {
        throw error;
      }
      // If the error is not about file not existing, re-throw it
      if (error && typeof error === 'object' && 'code' in error && error.code !== 'ENOENT') {
        throw error;
      }
      // If .gitignore doesn't exist (ENOENT), continue with next check
    }

    // Check if current directory is named 'ai-engineer'
    const currentDir = path.basename(process.cwd());
    if (currentDir === 'ai-engineer') {
      throw new Error(
        'Safety check failed: Current directory is named "ai-engineer". Demo cleanup is disabled to prevent accidental deletion of the project source code.'
      );
    }
  }

  /**
   * Copy directory recursively
   */
  private async copyDirectory(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const files = await fs.readdir(src);

    for (const file of files) {
      const srcFile = path.join(src, file);
      const destFile = path.join(dest, file);
      const stat = await fs.stat(srcFile);

      if (stat.isDirectory()) {
        await this.copyDirectory(srcFile, destFile);
      } else {
        await fs.copyFile(srcFile, destFile);
      }
    }
  }
}
