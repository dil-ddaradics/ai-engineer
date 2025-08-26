/**
 * Core types and interfaces for the AI Engineer State Machine
 */
import { TransitionUtils } from './utils';

// All possible states in the state machine (exact match to state-machine.md specification)
export const STATE_NAMES = [
  // GATHER states - Planning and information gathering
  'GATHER_NEEDS_CONTEXT',
  'GATHER_EDITING_CONTEXT',
  'GATHER_EDITING',

  // ACHIEVE states - Task execution
  'ACHIEVE_TASK_DRAFTING',
  'ACHIEVE_TASK_EXECUTED',
  'ACHIEVE_COMPLETE',

  // PR states - Pull request review workflow
  'PR_GATHERING_COMMENTS_G',
  'PR_GATHERING_COMMENTS_A',
  'PR_REVIEW_TASK_DRAFT_G',
  'PR_REVIEW_TASK_DRAFT_A',
  'PR_APPLIED_PENDING_ARCHIVE_G',
  'PR_APPLIED_PENDING_ARCHIVE_A',
  'PR_CONFIRM_RESTART_COMMENTS_G',
  'PR_CONFIRM_RESTART_COMMENTS_A',
  'PR_CONFIRM_RESTART_TASK_G',
  'PR_CONFIRM_RESTART_TASK_A',

  // ERROR states - Error handling and recovery
  'ERROR_TASK_MISSING',
  'ERROR_TASK_RESULTS_MISSING',
  'ERROR_PLAN_MISSING',
  'ERROR_COMMENTS_MISSING_G',
  'ERROR_COMMENTS_MISSING_A',
  'ERROR_REVIEW_TASK_MISSING_G',
  'ERROR_REVIEW_TASK_MISSING_A',
  'ERROR_CONTEXT_MISSING',
  'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
  'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
] as const;

export type StateName = (typeof STATE_NAMES)[number];

// Template states with [G/A] placeholders for transitions that preserve G/A suffixes
export type TemplateStateName =
  | 'PR_GATHERING_COMMENTS_[G/A]'
  | 'PR_REVIEW_TASK_DRAFT_[G/A]'
  | 'PR_APPLIED_PENDING_ARCHIVE_[G/A]'
  | 'PR_CONFIRM_RESTART_COMMENTS_[G/A]'
  | 'PR_CONFIRM_RESTART_TASK_[G/A]'
  | 'ERROR_COMMENTS_MISSING_[G/A]'
  | 'ERROR_REVIEW_TASK_MISSING_[G/A]'
  | 'ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A]';

// Valid toState values: actual states, template states with placeholders, or stay-in-same-state
export type ToStateValue =
  | StateName
  | TemplateStateName
  | typeof TransitionUtils.STAY_IN_SAME_STATE;

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
  readonly fromState: StateName | StateName[];
  readonly spell: Spell;
  readonly toState: ToStateValue;
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
