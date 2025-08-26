import { Transition } from '../../types';
import { ResponseUtils } from '../../utils';

/**
 * F1: Any state except excluded states + Finite -> GATHER_EDITING
 * From: "Finite Transitions (Universal Return to Plan)" table
 * Reference: state-machine/state-machine.md:347
 * Purpose: Universal return to plan editing for most states
 */
export const f1Transition: Transition = {
  fromState: [
    'GATHER_EDITING',
    'ACHIEVE_TASK_DRAFTING',
    'ERROR_TASK_MISSING',
    'ERROR_TASK_RESULTS_MISSING',
  ],
  spell: 'Finite',
  toState: 'GATHER_EDITING',
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('finite_transitions_F1');
    return {
      message: response,
    };
  },
};

/**
 * F2: ACHIEVE_COMPLETE + Finite -> GATHER_EDITING
 * From: "Finite Transitions (Universal Return to Plan)" table
 * Reference: state-machine/state-machine.md:348
 * Purpose: Return to plan editing from completed state
 */
export const f2Transition: Transition = {
  fromState: 'ACHIEVE_COMPLETE',
  spell: 'Finite',
  toState: 'GATHER_EDITING',
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('finite_transitions_F2');
    return {
      message: response,
    };
  },
};

/**
 * Finite Transitions (Universal Return to Plan)
 * Maps to: "Finite Transitions (Universal Return to Plan)" table in state-machine.md
 */
export const finiteTransitions: Transition[] = [f1Transition, f2Transition];
