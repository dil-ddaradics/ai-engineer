/**
 * Core types and interfaces for the AI Engineer State Machine
 */

// All possible states in the state machine (33 states total)
export const STATE_NAMES = [
  // GATHER states - Planning and information gathering
  'GATHER_NO_PLAN',
  'GATHER_PLAN_DRAFT',
  'GATHER_CONTEXT_NONE',
  'GATHER_CONTEXT_DRAFT',

  // ACHIEVE states - Task execution
  'ACHIEVE_TASK_DRAFT',
  'ACHIEVE_TASK_EXECUTED',
  'ACHIEVE_COMPLETE',

  // PR states - Pull request review workflow
  'PR_COMMENTS_PLAN',
  'PR_COMMENTS_TASK',
  'PR_TASK_PLAN',
  'PR_TASK_TASK',
  'PR_TASK_EXECUTED_PLAN',
  'PR_TASK_EXECUTED_TASK',
  'PR_CONFIRM_COMMENTS_PLAN',
  'PR_CONFIRM_COMMENTS_TASK',
  'PR_CONFIRM_TASK_PLAN',
  'PR_CONFIRM_TASK_TASK',

  // ERROR states - Error handling and recovery
  'ERROR_NO_PLAN',
  'ERROR_NO_TASK',
  'ERROR_NO_TASK_RESULTS',
  'ERROR_NO_CONTEXT',
  'ERROR_NO_COMMENTS',
  'ERROR_NO_REVIEW_TASK',
  'ERROR_NO_REVIEW_TASK_RESULTS',
  'ERROR_REVIEW_TASK_MISSING',
  'ERROR_REVIEW_TASK_RESULTS_MISSING',
  'ERROR_PLAN_MISSING',
  'ERROR_TASK_MISSING',
  'ERROR_TASK_RESULTS_MISSING',
  'ERROR_COMMENTS_MISSING',
  'ERROR_CONTEXT_MISSING',
] as const;

export type StateName = (typeof STATE_NAMES)[number];

// Available spells that can be cast
export type Spell = 'Accio' | 'Expecto' | 'Reparo' | 'Reverto' | 'Finite' | 'Lumos';

// State context contains information about the current workflow state
export interface StateContext {
  readonly currentState: StateName;
}

// Result of a transition execution
export interface TransitionResult {
  readonly success: boolean;
  readonly message: string;
}

// Definition of a state transition
export interface Transition {
  readonly fromState: StateName;
  readonly spell: Spell;
  readonly toState: StateName;
  readonly condition?: (context: StateContext, fileSystem: FileSystem) => Promise<boolean>;
  readonly execute: (context: StateContext, fileSystem: FileSystem) => Promise<{ message: string }>;
}

// File system interface for abstracting file operations
export interface FileSystem {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  readSafe(path: string): Promise<string>; // Returns empty string if file doesn't exist
  write(path: string, content: string): Promise<void>;
  delete(path: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  listFiles(directory: string): Promise<string[]>;
  getBaseDirectory(): string;
  getRelativePath(path: string): string;
  isWithinBaseDirectory(path: string): boolean;
  validateFilePath(path: string): boolean; // Alias for isWithinBaseDirectory for clarity
  resolvePath(...segments: string[]): string;
}

// State repository interface for persisting state
export interface StateRepository {
  load(): Promise<StateContext | null>;
  save(context: StateContext): Promise<void>;
  initialize(initialState: StateName, workingDirectory: string): Promise<StateContext>;
  clear(): Promise<void>;
  updateState(context: StateContext, newState: StateName): Promise<StateContext>;
}

// Main state machine interface
export interface StateMachine {
  executeSpell(spell: Spell): Promise<TransitionResult>;
}

// File paths used by the state machine
export const FILE_PATHS = {
  STATE_FILE: '.ai/task/state.json',
  PLAN_FILE: '.ai/task/plan.md',
  TASK_FILE: '.ai/task/task.md',
  TASK_RESULTS_FILE: '.ai/task/task-results.md',
  CONTEXT_FILE: '.ai/task/context.md',
  COMMENTS_FILE: '.ai/task/comments.md',
  REVIEW_TASK_FILE: '.ai/task/review-task.md',
  REVIEW_TASK_RESULTS_FILE: '.ai/task/review-task-results.md',
  PLAN_GUIDE_FILE: '.ai/plan-guide.md',
  TASK_GUIDE_FILE: '.ai/task-guide.md',
  SYSTEM_EXPLANATION_FILE: '.ai/system-explanation.md',
  ATLASSIAN_REFS_FILE: '.ai/task/.atlassian-refs',
  TASK_BASE_DIR: '.ai/task',
  ARCHIVE_BASE_DIR: '.ai/archive',
} as const;

// Utility type for file path constants
export type FilePath = (typeof FILE_PATHS)[keyof typeof FILE_PATHS];
