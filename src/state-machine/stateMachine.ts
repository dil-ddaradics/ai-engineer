import {
  StateMachine,
  Spell,
  TransitionResult,
  FileSystem,
  StateRepository,
  Transition,
} from './types';
import { DEFAULT_TRANSITIONS } from './transitions';
import { TransitionUtils, TaskUtils } from './utils';
import { logger } from '../utils/logger.js';

/**
 * Default transitions imported from transitions module
 * Currently empty arrays to maintain backward compatibility with existing tests
 */

/**
 * Core state machine implementation for AI Engineer workflow
 * Handles spell execution and state transitions based on current state
 */
export class AiEngineerStateMachine implements StateMachine {
  constructor(
    private readonly stateRepository: StateRepository,
    private readonly fileSystem: FileSystem,
    private readonly transitions: readonly Transition[] = DEFAULT_TRANSITIONS
  ) {
    // Initialize base directories on construction to ensure they exist before any operations
    this.initializeBaseDirectories();
  }

  /**
   * Initialize base directories required by the state machine
   * Creates .ai/task, .ai/task/tasks, and pr-reviews directories
   */
  private async initializeBaseDirectories(): Promise<void> {
    try {
      const taskUtils = new TaskUtils(this.fileSystem);
      await taskUtils.createBaseDirectories();
    } catch (error) {
      // Log error but don't throw - directories might already exist or there might be permission issues
      // The system should still function, though some operations might fail later
      console.error('Warning: Failed to initialize base directories:', error);
    }
  }

  async executeSpell(spell: Spell): Promise<TransitionResult> {
    let resultMessage: string;
    let resultSuccess: boolean;

    await logger.info(`Executing spell: ${spell}`);

    try {
      // Load or initialize context
      let context = await this.stateRepository.load();
      if (!context) {
        context = { currentState: 'GATHER_NEEDS_CONTEXT' };
      }

      await logger.info(`Current state: ${context.currentState}`);

      // Find matching transition using injected transitions
      let transition: Transition | undefined;

      for (const t of this.transitions) {
        if (TransitionUtils.matchesFromState(t, context!.currentState) && t.spell === spell) {
          // Check condition if it exists
          if (!t.condition || (await t.condition(context!, this.fileSystem))) {
            transition = t;
            break;
          }
        }
      }

      if (transition) {
        // Transition found - always successful
        await logger.info(`Found transition from ${context.currentState} to ${transition.toState}`);
        const result = await transition.execute(context, this.fileSystem);
        resultSuccess = true;
        resultMessage = result.message;

        // Update context to the new state defined by transition
        // For array-based fromStates, we need to handle potential [G/A] suffix preservation
        const resolvedToState = TransitionUtils.resolveToState(
          context.currentState,
          transition.toState
        );
        context = { currentState: resolvedToState };

        // Save the updated state only after successful transition
        await this.stateRepository.save(context);
        await logger.info(`State transition completed: ${resolvedToState}`);
      } else {
        // No transition found - blocked
        resultSuccess = false;
        resultMessage = `The spell ${spell} is not available in the current state ${context.currentState}`;
        await logger.info(`Spell ${spell} blocked in state ${context.currentState}`);

        // Save the current state (in case it's the first time and we need to persist the initial state)
        await this.stateRepository.save(context);
      }
    } catch (error) {
      // No state modification on error - preserve existing state
      resultSuccess = false;
      resultMessage = `Failed to execute spell ${spell}: ${error instanceof Error ? error.message : String(error)}`;
      await logger.error(
        `Spell execution failed: ${spell} - ${error instanceof Error ? error.message : String(error)}`
      );
    }

    await logger.info(`Spell execution result: ${spell} - success: ${resultSuccess}`);

    return {
      success: resultSuccess,
      message: resultMessage,
    };
  }
}
