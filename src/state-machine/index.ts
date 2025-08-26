import { AiEngineerStateMachine } from './stateMachine';
import { JsonFileStateRepository } from './stateRepository';
import { NodeFileSystem } from './fileSystem';
import { DEFAULT_TRANSITIONS } from './transitions';
import {
  StateMachine,
  StateRepository,
  FileSystem,
  Transition,
  StateName,
  Spell,
  StateContext,
  TransitionResult,
} from './types';

/**
 * Factory function to create a properly configured AI Engineer state machine
 * with all necessary dependencies injected
 * Note: State file path is fixed at '.ai/task/state.json'
 */
export function createStateMachine(options?: {
  baseDirectory?: string;
  transitions?: readonly Transition[];
}): StateMachine {
  const { baseDirectory = process.cwd(), transitions = DEFAULT_TRANSITIONS } = options || {};

  // Create dependencies
  const fileSystem = new NodeFileSystem(baseDirectory);
  const stateRepository = new JsonFileStateRepository(fileSystem);

  // Create and return the state machine
  return new AiEngineerStateMachine(stateRepository, fileSystem, transitions);
}

/**
 * Factory function to create state machine with custom dependencies
 * Useful for testing and advanced use cases
 */
export function createStateMachineWithDependencies(
  stateRepository: StateRepository,
  fileSystem: FileSystem,
  transitions?: readonly Transition[]
): StateMachine {
  return new AiEngineerStateMachine(
    stateRepository,
    fileSystem,
    transitions || DEFAULT_TRANSITIONS
  );
}

// Re-export core types for external use
export type {
  StateMachine,
  StateRepository,
  FileSystem,
  Transition,
  StateName,
  Spell,
  StateContext,
  TransitionResult,
};

// Re-export implementation classes for advanced use cases
export { AiEngineerStateMachine, JsonFileStateRepository, NodeFileSystem, DEFAULT_TRANSITIONS };
