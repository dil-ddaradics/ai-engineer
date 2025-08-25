import { StateContext, StateRepository, StateName, FILE_PATHS, STATE_NAMES } from './types';
import { FileSystem } from './types';
import { z } from 'zod';

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
      await this.fileSystem.write(FILE_PATHS.STATE_FILE, content);
    } catch (error) {
      throw new Error(
        `Failed to save state: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async initialize(initialState: StateName, workingDirectory: string): Promise<StateContext> {
    const context: StateContext = {
      currentState: initialState,
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
      currentState: newState,
    };

    await this.save(updatedContext);
    return updatedContext;
  }


  /**
   * Zod schema for validating state context
   */
  private stateContextSchema = z.object({
    currentState: z.enum(STATE_NAMES),
  });

  /**
   * Validate that the loaded state context has all required fields
   */
  private validateStateContext(parsed: any): StateContext {
    try {
      return this.stateContextSchema.parse(parsed);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid state context: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Invalid state context: ${error}`);
    }
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${randomPart}`;
  }
}
