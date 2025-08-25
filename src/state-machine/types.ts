/**
 * Core types and interfaces for the AI Engineer State Machine
 */

// All possible states in the state machine (33 states total)
export type StateName =
  // GATHER states - Planning and information gathering
  | 'GATHER_NO_PLAN'
  | 'GATHER_PLAN_DRAFT'
  | 'GATHER_CONTEXT_NONE'
  | 'GATHER_CONTEXT_DRAFT'

  // ACHIEVE states - Task execution
  | 'ACHIEVE_TASK_DRAFT'
  | 'ACHIEVE_TASK_EXECUTED'
  | 'ACHIEVE_COMPLETE'

  // PR states - Pull request review workflow
  | 'PR_COMMENTS_PLAN'
  | 'PR_COMMENTS_TASK'
  | 'PR_TASK_PLAN'
  | 'PR_TASK_TASK'
  | 'PR_TASK_EXECUTED_PLAN'
  | 'PR_TASK_EXECUTED_TASK'
  | 'PR_CONFIRM_COMMENTS_PLAN'
  | 'PR_CONFIRM_COMMENTS_TASK'
  | 'PR_CONFIRM_TASK_PLAN'
  | 'PR_CONFIRM_TASK_TASK'

  // ERROR states - Error handling and recovery
  | 'ERROR_NO_PLAN'
  | 'ERROR_NO_TASK'
  | 'ERROR_NO_TASK_RESULTS'
  | 'ERROR_NO_CONTEXT'
  | 'ERROR_NO_COMMENTS'
  | 'ERROR_NO_REVIEW_TASK'
  | 'ERROR_NO_REVIEW_TASK_RESULTS'
  | 'ERROR_REVIEW_TASK_MISSING'
  | 'ERROR_REVIEW_TASK_RESULTS_MISSING'
  | 'ERROR_PLAN_MISSING'
  | 'ERROR_TASK_MISSING'
  | 'ERROR_TASK_RESULTS_MISSING'
  | 'ERROR_COMMENTS_MISSING'
  | 'ERROR_CONTEXT_MISSING';

// Available spells that can be cast
export type Spell = 'Accio' | 'Expecto' | 'Reparo' | 'Reverto' | 'Finite' | 'Lumos';

// State context contains information about the current workflow state
export interface StateContext {
  readonly currentState: StateName;
  readonly previousState?: StateName;
  readonly timestamp: string;
  readonly sessionId: string;
  readonly workingDirectory: string;
  readonly metadata?: Record<string, unknown>;
}

// Result of a transition execution
export interface TransitionResult {
  readonly success: boolean;
  readonly newState: StateName;
  readonly message: string;
  readonly timestamp?: string;
  readonly previousState?: StateName;
  readonly responseType?: 'transition' | 'blocked' | 'noop' | 'error' | 'confirmation';
  readonly actionsTaken?: string[];
  readonly filesCreated?: string[];
  readonly filesModified?: string[];
  readonly filesDeleted?: string[];
  readonly errors?: string[];
}

// Definition of a state transition
export interface Transition {
  readonly fromState: StateName;
  readonly spell: Spell;
  readonly toState: StateName;
  readonly condition?: (context: StateContext) => boolean;
  readonly execute: (context: StateContext) => Promise<TransitionResult>;
}

// File system interface for abstracting file operations
export interface FileSystem {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  readSafe(path: string, fallback?: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  writeAtomic(path: string, content: string): Promise<void>;
  delete(path: string): Promise<void>;
  archive(sourcePath: string, destinationPath: string): Promise<void>;
  createDirectory(path: string): Promise<void>;
  listFiles(directory: string): Promise<string[]>;
  getBaseDirectory(): string;
  getRelativePath(path: string): string;
  isWithinBaseDirectory(path: string): boolean;
  generateArchiveFilename(originalPath: string, timestamp?: Date): string;
  resolvePath(...segments: string[]): string;
}

// State repository interface for persisting state
export interface StateRepository {
  load(): Promise<StateContext | null>;
  save(context: StateContext): Promise<void>;
  initialize(initialState: StateName, workingDirectory: string): Promise<StateContext>;
  clear(): Promise<void>;
  hasExistingState(): Promise<boolean>;
  updateState(context: StateContext, newState: StateName): Promise<StateContext>;
  updateMetadata(context: StateContext, metadata: Record<string, any>): Promise<StateContext>;
  addToHistory(context: StateContext): Promise<StateContext>;
  getStateHistory(context: StateContext): StateContext[];
  getSessionAge(context: StateContext): number;
  getSessionCreatedAt(context: StateContext): Date | null;
  isSessionOlderThan(context: StateContext, ageInMs: number): boolean;
  createBackup(context: StateContext): Promise<string>;
  restoreFromBackup(backupPath: string): Promise<StateContext>;
}

// Main state machine interface
export interface StateMachine {
  getCurrentState(): Promise<StateContext | null>;
  executeSpell(spell: Spell): Promise<TransitionResult>;
  resetState(): Promise<void>;
  getTemplate(templateName: string): Promise<string>;
  isInitialized(): Promise<boolean>;
  getSessionInfo(): Promise<{ age: number; createdAt: Date | null } | null>;
}

// Configuration for state machine initialization
export interface StateMachineConfig {
  readonly workingDirectory: string;
  readonly fileSystem: FileSystem;
  readonly stateRepository: StateRepository;
  readonly initialState?: StateName;
  readonly sessionId?: string;
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

// Error types specific to the state machine
export class StateMachineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: StateContext
  ) {
    super(message);
    this.name = 'StateMachineError';
  }
}

export class TransitionError extends StateMachineError {
  constructor(
    message: string,
    public readonly fromState: StateName,
    public readonly spell: Spell,
    context?: StateContext
  ) {
    super(message, 'TRANSITION_ERROR', context);
    this.name = 'TransitionError';
  }
}

export class StateNotFoundError extends StateMachineError {
  constructor(state: StateName, context?: StateContext) {
    super(`State '${state}' not found`, 'STATE_NOT_FOUND', context);
    this.name = 'StateNotFoundError';
  }
}

export class InvalidSpellError extends StateMachineError {
  constructor(spell: Spell, state: StateName, context?: StateContext) {
    super(`Spell '${spell}' is not valid in state '${state}'`, 'INVALID_SPELL', context);
    this.name = 'InvalidSpellError';
  }
}
