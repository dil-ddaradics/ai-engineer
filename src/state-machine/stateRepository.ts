import { StateContext, StateRepository, StateName, FILE_PATHS } from './types.js';
import { FileSystem } from './types.js';

/**
 * JSON file-based state repository
 * Persists state information to .ai/task/state.json
 */
export class JsonFileStateRepository implements StateRepository {
  constructor(private readonly fileSystem: FileSystem) {}

  async load(): Promise<StateContext | null> {
    try {
      if (!(await this.fileSystem.exists(FILE_PATHS.STATE_FILE))) {
        return null;
      }

      const content = await this.fileSystem.read(FILE_PATHS.STATE_FILE);
      const parsed = JSON.parse(content);

      // Validate the loaded state
      return this.validateStateContext(parsed);
    } catch (error) {
      throw new Error(
        `Failed to load state: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async save(context: StateContext): Promise<void> {
    try {
      const content = JSON.stringify(context, null, 2);
      await this.fileSystem.writeAtomic(FILE_PATHS.STATE_FILE, content);
    } catch (error) {
      throw new Error(
        `Failed to save state: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async initialize(initialState: StateName, workingDirectory: string): Promise<StateContext> {
    const context: StateContext = {
      currentState: initialState,
      timestamp: new Date().toISOString(),
      sessionId: this.generateSessionId(),
      workingDirectory,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    await this.save(context);
    return context;
  }

  async clear(): Promise<void> {
    try {
      if (await this.fileSystem.exists(FILE_PATHS.STATE_FILE)) {
        await this.fileSystem.delete(FILE_PATHS.STATE_FILE);
      }
    } catch (error) {
      throw new Error(
        `Failed to clear state: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Update the current state and save
   */
  async updateState(currentContext: StateContext, newState: StateName): Promise<StateContext> {
    const updatedContext: StateContext = {
      ...currentContext,
      previousState: currentContext.currentState,
      currentState: newState,
      timestamp: new Date().toISOString(),
    };

    await this.save(updatedContext);
    return updatedContext;
  }

  /**
   * Add metadata to the current context
   */
  async updateMetadata(
    currentContext: StateContext,
    metadata: Record<string, unknown>
  ): Promise<StateContext> {
    const updatedContext: StateContext = {
      ...currentContext,
      metadata: {
        ...currentContext.metadata,
        ...metadata,
      },
      timestamp: new Date().toISOString(),
    };

    await this.save(updatedContext);
    return updatedContext;
  }

  /**
   * Get the state history from metadata
   */
  getStateHistory(context: StateContext): StateContext[] {
    const history = context.metadata?.history as StateContext[] | undefined;
    return history || [];
  }

  /**
   * Add current state to history before transitioning
   */
  async addToHistory(currentContext: StateContext): Promise<StateContext> {
    const currentHistory = this.getStateHistory(currentContext);
    const newHistory = [...currentHistory, currentContext];

    // Keep only the last 50 state changes to prevent unbounded growth
    const trimmedHistory = newHistory.slice(-50);

    return this.updateMetadata(currentContext, { history: trimmedHistory });
  }

  /**
   * Validate that the loaded state context has all required fields
   */
  private validateStateContext(parsed: any): StateContext {
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid state context: not an object');
    }

    const required = ['currentState', 'timestamp', 'sessionId', 'workingDirectory'];
    for (const field of required) {
      if (!(field in parsed)) {
        throw new Error(`Invalid state context: missing field '${field}'`);
      }
    }

    // Validate state name
    const validStates: StateName[] = [
      'GATHER_NO_PLAN',
      'GATHER_PLAN_DRAFT',
      'GATHER_CONTEXT_NONE',
      'GATHER_CONTEXT_DRAFT',
      'ACHIEVE_TASK_DRAFT',
      'ACHIEVE_TASK_EXECUTED',
      'ACHIEVE_COMPLETE',
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
    ];

    if (!validStates.includes(parsed.currentState)) {
      throw new Error(`Invalid state context: unknown state '${parsed.currentState}'`);
    }

    return {
      currentState: parsed.currentState,
      previousState: parsed.previousState,
      timestamp: parsed.timestamp,
      sessionId: parsed.sessionId,
      workingDirectory: parsed.workingDirectory,
      metadata: parsed.metadata || {},
    };
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
  }

  /**
   * Check if a state file exists
   */
  async hasExistingState(): Promise<boolean> {
    return this.fileSystem.exists(FILE_PATHS.STATE_FILE);
  }

  /**
   * Get the creation time of the current session
   */
  getSessionCreatedAt(context: StateContext): Date | null {
    const createdAt = context.metadata?.createdAt as string | undefined;
    return createdAt ? new Date(createdAt) : null;
  }

  /**
   * Get the age of the current session in milliseconds
   */
  getSessionAge(context: StateContext): number {
    const createdAt = this.getSessionCreatedAt(context);
    return createdAt ? Date.now() - createdAt.getTime() : 0;
  }

  /**
   * Check if the session is older than the specified age in milliseconds
   */
  isSessionOlderThan(context: StateContext, ageInMs: number): boolean {
    return this.getSessionAge(context) > ageInMs;
  }

  /**
   * Create a backup of the current state with a timestamp
   */
  async createBackup(context: StateContext): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${FILE_PATHS.ARCHIVE_BASE_DIR}/state-backup-${timestamp}.json`;

    const content = JSON.stringify(context, null, 2);
    await this.fileSystem.write(backupPath, content);

    return backupPath;
  }

  /**
   * Restore state from a backup file
   */
  async restoreFromBackup(backupPath: string): Promise<StateContext> {
    const content = await this.fileSystem.read(backupPath);
    const parsed = JSON.parse(content);
    const context = this.validateStateContext(parsed);

    await this.save(context);
    return context;
  }
}
