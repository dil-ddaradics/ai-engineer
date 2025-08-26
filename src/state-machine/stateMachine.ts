import {
  StateMachine,
  Spell,
  TransitionResult,
  FileSystem,
  StateRepository,
  Transition,
} from './types';
import { DEFAULT_TRANSITIONS } from './transitions';
import { TransitionUtils } from './utils';

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
  ) {}

  async executeSpell(spell: Spell): Promise<TransitionResult> {
    let resultMessage: string;
    let resultSuccess: boolean;

    try {
      // Load or initialize context
      let context = await this.stateRepository.load();
      if (!context) {
        context = { currentState: 'GATHER_NEEDS_CONTEXT' };
      }

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
      } else {
        // No transition found - blocked
        resultSuccess = false;
        resultMessage = `The spell ${spell} is not available in the current state ${context.currentState}`;
      }

      // Single save operation - only for successful processing
      await this.stateRepository.save(context);
    } catch (error) {
      // No state modification on error - preserve existing state
      resultSuccess = false;
      resultMessage = `Failed to execute spell ${spell}: ${error instanceof Error ? error.message : String(error)}`;
    }

    return {
      success: resultSuccess,
      message: resultMessage,
    };
  }
}
