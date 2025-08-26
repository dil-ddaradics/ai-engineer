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

export interface DemoBackup {
  timestamp: string;
  originalPath: string;
  backupPath: string;
}

/**
 * Available demo states with their configurations
 */
export const DEMO_STATES: Record<string, DemoState> = {
  'gather-needs-context': {
    name: 'gather-needs-context',
    displayName: 'Fresh Start',
    description: 'Starting point - no files exist yet, ready to begin calculator project',
    state: 'GATHER_NEEDS_CONTEXT',
  },
  'gather-editing-context': {
    name: 'gather-editing-context',
    displayName: 'Context Created',
    description: 'Context file exists, working on calculator project context',
    state: 'GATHER_EDITING_CONTEXT',
  },
  'gather-editing': {
    name: 'gather-editing',
    displayName: 'Plan Ready',
    description: 'Plan file exists with calculator acceptance criteria, ready to start work',
    state: 'GATHER_EDITING',
  },
  'achieve-task-drafting': {
    name: 'achieve-task-drafting',
    displayName: 'Task Ready',
    description: 'Calculator implementation task file exists, ready to execute work',
    state: 'ACHIEVE_TASK_DRAFTING',
  },
  'achieve-task-executed': {
    name: 'achieve-task-executed',
    displayName: 'Task Completed',
    description: 'Calculator task completed with results, ready for review',
    state: 'ACHIEVE_TASK_EXECUTED',
  },
  'achieve-complete': {
    name: 'achieve-complete',
    displayName: 'Calculator Complete',
    description: 'All calculator acceptance criteria met, workflow complete',
    state: 'ACHIEVE_COMPLETE',
  },
  'pr-gathering-comments': {
    name: 'pr-gathering-comments',
    displayName: 'PR Review Started',
    description: 'Calculator PR review mode, collecting comments from GATHER phase',
    state: 'PR_GATHERING_COMMENTS_G',
  },
  'pr-review-task-draft': {
    name: 'pr-review-task-draft',
    displayName: 'PR Review Task',
    description: 'Calculator PR review task being drafted',
    state: 'PR_REVIEW_TASK_DRAFT_G',
  },
  'error-plan-missing': {
    name: 'error-plan-missing',
    displayName: 'Error State',
    description: 'Error state demonstration - calculator plan file missing',
    state: 'ERROR_PLAN_MISSING',
  },
};

export class DemoManager {
  private readonly aiDir = '.ai';
  private readonly backupDir = '.ai-backup';
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
      const stateFile = path.join(this.aiDir, 'task', 'state.json');
      const content = await fs.readFile(stateFile, 'utf-8');
      const state = JSON.parse(content);
      return state.currentState || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if .ai directory exists
   */
  async hasAiDirectory(): Promise<boolean> {
    try {
      await fs.access(this.aiDir);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Backup current .ai directory
   */
  async backup(): Promise<DemoBackup> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${this.backupDir}-${timestamp}`;

    if (!(await this.hasAiDirectory())) {
      throw new Error('No .ai directory exists to backup');
    }

    await this.copyDirectory(this.aiDir, backupPath);

    return {
      timestamp,
      originalPath: this.aiDir,
      backupPath,
    };
  }

  /**
   * Restore from backup
   */
  async restore(backupPath?: string): Promise<void> {
    if (!backupPath) {
      // Find most recent backup
      const backups = await this.listBackups();
      if (backups.length === 0) {
        throw new Error('No backups found');
      }
      backupPath = backups[0].backupPath;
    }

    // Remove current .ai directory if it exists
    if (await this.hasAiDirectory()) {
      await fs.rm(this.aiDir, { recursive: true, force: true });
    }

    // Restore from backup
    await this.copyDirectory(backupPath, this.aiDir);
  }

  /**
   * List available backups
   */
  async listBackups(): Promise<DemoBackup[]> {
    try {
      const files = await fs.readdir('.');
      const backups: DemoBackup[] = [];

      for (const file of files) {
        if (file.startsWith(this.backupDir + '-')) {
          const timestamp = file.substring(this.backupDir.length + 1);
          backups.push({
            timestamp,
            originalPath: this.aiDir,
            backupPath: file,
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

    const demoSourcePath = path.join(this.demosDir, stateName, '.ai');
    
    // Check if demo folder exists
    try {
      await fs.access(demoSourcePath);
    } catch {
      throw new Error(`Demo folder not found: ${demoSourcePath}`);
    }

    // Remove existing .ai directory
    if (await this.hasAiDirectory()) {
      await fs.rm(this.aiDir, { recursive: true, force: true });
    }

    // Copy demo state from demos folder
    await this.copyDirectory(demoSourcePath, this.aiDir);
  }

  /**
   * Reset (remove) .ai directory
   */
  async reset(): Promise<void> {
    if (await this.hasAiDirectory()) {
      await fs.rm(this.aiDir, { recursive: true, force: true });
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
