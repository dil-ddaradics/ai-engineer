import {
  StateMachine,
  StateContext,
  Spell,
  TransitionResult,
  FileSystem,
  StateRepository,
  Transition,
} from './types';

/**
 * Define explicit state transitions with conditions
 * TODO: Add actual transitions here - currently empty so tests will fail cleanly
 */
const TRANSITIONS: Transition[] = [
  // Transitions will be defined here later
];

/**
 * Core state machine implementation for AI Engineer workflow
 * Handles spell execution and state transitions based on current state
 */
export class AiEngineerStateMachine implements StateMachine {
  constructor(
    private readonly stateRepository: StateRepository,
    private readonly fileSystem: FileSystem,
    private readonly transitions: readonly Transition[] = TRANSITIONS
  ) {}

  async executeSpell(spell: Spell): Promise<TransitionResult> {
    let context: StateContext | null = null;
    let resultMessage: string;
    let resultSuccess: boolean = false;

    try {
      // Load or initialize context
      context = await this.stateRepository.load();
      if (!context) {
        context = { currentState: 'GATHER_NO_PLAN' };
      }

      // Find matching transition using injected transitions
      const transition = this.transitions.find(
        t =>
          t.fromState === context!.currentState &&
          t.spell === spell &&
          (!t.condition || t.condition(context!))
      );

      if (transition) {
        // Transition found - always successful
        const result = await transition.execute(context);
        resultSuccess = true;
        resultMessage = result.message;
        
        // Update context to the new state defined by transition
        context = { currentState: transition.toState };
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
