import { Transition } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

/**
 * AB1: ACHIEVE_TASK_EXECUTED + Finite -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:270
 * Purpose: Blocks Finite when task results need to be integrated first
 */
export const ab1Transition: Transition = {
  fromState: 'ACHIEVE_TASK_EXECUTED',
  spell: 'Finite',
  toState: 'ACHIEVE_TASK_EXECUTED', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB1');

    return {
      message: response,
    };
  },
};

/**
 * AB2: ACHIEVE states + Reverto -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:271
 * Purpose: Blocks Reverto in achieve states (only available in PR states)
 */
export const ab2Transition: Transition = {
  fromState: 'ACHIEVE_TASK_DRAFTING', // Will be duplicated for other states
  spell: 'Reverto',
  toState: 'ACHIEVE_TASK_DRAFTING', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB2');

    return {
      message: response,
    };
  },
};

/**
 * AB2b: ACHIEVE_TASK_EXECUTED + Reverto -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:271
 * Purpose: Blocks Reverto in achieve states (only available in PR states)
 */
export const ab2bTransition: Transition = {
  fromState: 'ACHIEVE_TASK_EXECUTED',
  spell: 'Reverto',
  toState: 'ACHIEVE_TASK_EXECUTED', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB2');

    return {
      message: response,
    };
  },
};

/**
 * AB2c: ACHIEVE_COMPLETE + Reverto -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:271
 * Purpose: Blocks Reverto in achieve states (only available in PR states)
 */
export const ab2cTransition: Transition = {
  fromState: 'ACHIEVE_COMPLETE',
  spell: 'Reverto',
  toState: 'ACHIEVE_COMPLETE', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB2');

    return {
      message: response,
    };
  },
};

/**
 * AB3: ACHIEVE states + Expecto -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:272
 * Purpose: Blocks Expecto in achieve states (only available in GATHER states)
 */
export const ab3Transition: Transition = {
  fromState: 'ACHIEVE_TASK_DRAFTING', // Will be duplicated for other states
  spell: 'Expecto',
  toState: 'ACHIEVE_TASK_DRAFTING', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB3');

    return {
      message: response,
    };
  },
};

/**
 * AB3b: ACHIEVE_TASK_EXECUTED + Expecto -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:272
 * Purpose: Blocks Expecto in achieve states (only available in GATHER states)
 */
export const ab3bTransition: Transition = {
  fromState: 'ACHIEVE_TASK_EXECUTED',
  spell: 'Expecto',
  toState: 'ACHIEVE_TASK_EXECUTED', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB3');

    return {
      message: response,
    };
  },
};

/**
 * AB3c: ACHIEVE_COMPLETE + Expecto -> [BLOCKED]
 * From: "Achieve Acceptance Criteria Phase Blocked Transitions" table
 * Reference: state-machine/state-machine.md:272
 * Purpose: Blocks Expecto in achieve states (only available in GATHER states)
 */
export const ab3cTransition: Transition = {
  fromState: 'ACHIEVE_COMPLETE',
  spell: 'Expecto',
  toState: 'ACHIEVE_COMPLETE', // BLOCKED transitions stay in same state
  execute: async (_context, _fileSystem) => {
    // No file operations - just return blocked message
    const response = ResponseUtils.formatResponse('achieve_blocked_AB3');

    return {
      message: response,
    };
  },
};

/**
 * Achieve Acceptance Criteria Phase Blocked Transitions
 * Maps to: "Achieve Acceptance Criteria Phase Blocked Transitions" table in state-machine.md
 */
export const achieveAcceptanceCriteriaBlocked: Transition[] = [
  ab1Transition,
  ab2Transition,
  ab2bTransition,
  ab2cTransition,
  ab3Transition,
  ab3bTransition,
  ab3cTransition,
];
