import {
  StateMachine,
  StateContext,
  Spell,
  TransitionResult,
  FileSystem,
  StateRepository,
  Transition,
} from './types.js';
import { TEMPLATES } from './templates.js';

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
      return {
        success: false,
        newState: 'ERROR_NO_PLAN',
        message: `Failed to execute spell ${spell}: ${error instanceof Error ? error.message : String(error)}`,
        responseType: 'error',
      };
    }
  }

  async getCurrentState(): Promise<StateContext | null> {
    return this.stateRepository.load();
  }

  async resetState(): Promise<void> {
    await this.stateRepository.clear();
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

      // Update the state repository with new state
      if (result.success && result.newState !== context.currentState) {
        await this.stateRepository.updateState(context, result.newState);
      }

      return {
        ...result,
        previousState: context.currentState,
      };
    }

    // No valid transition found
    return {
      success: false,
      newState: context.currentState,
      message: `The spell ${spell} is not available in the current state ${context.currentState}`,
      responseType: 'blocked',
    };
  }

  /**
   * Get template content for creating new files
   */
  async getTemplate(templateName: string): Promise<string> {
    return TEMPLATES[templateName] || '';
  }

  /**
   * Check if the state machine has been initialized
   */
  async isInitialized(): Promise<boolean> {
    return await this.stateRepository.hasExistingState();
  }

  /**
   * Get the current session information
   */
  async getSessionInfo(): Promise<{ age: number; createdAt: Date | null } | null> {
    const context = await this.getCurrentState();
    if (!context) return null;

    return {
      age: this.stateRepository.getSessionAge(context),
      createdAt: this.stateRepository.getSessionCreatedAt(context),
    };
  }
}
