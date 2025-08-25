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
    private readonly fileSystem: FileSystem
  ) {}

  async executeSpell(spell: Spell): Promise<TransitionResult> {
    try {
      // Load current state context
      const context = await this.stateRepository.load();

      if (!context) {
        // No state exists, start with initial state
        const initialContext = await this.stateRepository.initialize(
          'GATHER_NO_PLAN',
          this.fileSystem.getBaseDirectory()
        );
        return this.handleTransition(initialContext, spell);
      }

      return this.handleTransition(context, spell);
    } catch (error) {
      // Save error state
      const errorContext = await this.stateRepository.initialize('ERROR_NO_PLAN', this.fileSystem.getBaseDirectory());
      return {
        success: false,
        message: `Failed to execute spell ${spell}: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }


  /**
   * Handle spell execution using explicit transitions
   */
  private async handleTransition(context: StateContext, spell: Spell): Promise<TransitionResult> {
    // Find matching transition
    const transition = TRANSITIONS.find(
      t =>
        t.fromState === context.currentState &&
        t.spell === spell &&
        (!t.condition || t.condition(context))
    );

    if (transition) {
      // Execute the transition and update state
      const result = await transition.execute(context);

      // Always save state after transition attempt
      if (result.success) {
        // For successful transitions, the transition.execute should have already updated the state
        // But we ensure it's saved here
        await this.stateRepository.save(context);
      }

      return {
        success: result.success,
        message: result.message,
      };
    }

    // No valid transition found - save current state to ensure persistence
    await this.stateRepository.save(context);
    return {
      success: false,
      message: `The spell ${spell} is not available in the current state ${context.currentState}`,
    };
  }

}
