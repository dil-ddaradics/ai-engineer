import { Transition } from '../../types';
import { ResponseUtils, TransitionUtils } from '../../utils';

/**
 * ER1: ERROR_PLAN_MISSING + Finite -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:328
 * Purpose: Block Finite spell in ERROR_PLAN_MISSING state
 */
export const er1Transition: Transition = {
  fromState: 'ERROR_PLAN_MISSING',
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER1');
    return {
      message: response,
    };
  },
};

/**
 * ER2: ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Finite -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:329
 * Purpose: Block Finite spell in review task missing error states
 */
export const er2Transition: Transition = {
  fromState: [
    'ERROR_REVIEW_TASK_MISSING_G',
    'ERROR_REVIEW_TASK_MISSING_A',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
  ],
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER2');
    return {
      message: response,
    };
  },
};

/**
 * ER3a: ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Reparo -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:330
 * Purpose: Block Reparo spell in plan missing and review task results missing error states
 */
export const er3aTransition: Transition = {
  fromState: [
    'ERROR_PLAN_MISSING',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
  ],
  spell: 'Reparo',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER3a');
    return {
      message: response,
    };
  },
};

/**
 * ER3b: PR_APPLIED_PENDING_ARCHIVE_[G/A] + Reparo -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:331
 * Purpose: Block Reparo spell in PR applied pending archive states
 */
export const er3bTransition: Transition = {
  fromState: ['PR_APPLIED_PENDING_ARCHIVE_G', 'PR_APPLIED_PENDING_ARCHIVE_A'],
  spell: 'Reparo',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER3b');
    return {
      message: response,
    };
  },
};

/**
 * ER4: ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Reverto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:332
 * Purpose: Block Reverto spell in multiple error states
 */
export const er4Transition: Transition = {
  fromState: [
    'ERROR_TASK_MISSING',
    'ERROR_TASK_RESULTS_MISSING',
    'ERROR_PLAN_MISSING',
    'ERROR_REVIEW_TASK_MISSING_G',
    'ERROR_REVIEW_TASK_MISSING_A',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
  ],
  spell: 'Reverto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER4');
    return {
      message: response,
    };
  },
};

/**
 * ER5: ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING + Finite -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:333
 * Purpose: Block Finite spell in task missing error states
 */
export const er5Transition: Transition = {
  fromState: ['ERROR_TASK_MISSING', 'ERROR_TASK_RESULTS_MISSING'],
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER5');
    return {
      message: response,
    };
  },
};

/**
 * ER6: ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING_[G/A] + Expecto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:334
 * Purpose: Block Expecto spell in task missing and comments missing error states
 */
export const er6Transition: Transition = {
  fromState: [
    'ERROR_TASK_MISSING',
    'ERROR_TASK_RESULTS_MISSING',
    'ERROR_COMMENTS_MISSING_G',
    'ERROR_COMMENTS_MISSING_A',
  ],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER6');
    return {
      message: response,
    };
  },
};

/**
 * ER7a: ERROR_PLAN_MISSING + Expecto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:335
 * Purpose: Block Expecto spell in ERROR_PLAN_MISSING state
 */
export const er7aTransition: Transition = {
  fromState: 'ERROR_PLAN_MISSING',
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER7a');
    return {
      message: response,
    };
  },
};

/**
 * ER7b: PR_APPLIED_PENDING_ARCHIVE_[G/A] + Expecto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:336
 * Purpose: Block Expecto spell in PR applied pending archive states
 */
export const er7bTransition: Transition = {
  fromState: ['PR_APPLIED_PENDING_ARCHIVE_G', 'PR_APPLIED_PENDING_ARCHIVE_A'],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER7b');
    return {
      message: response,
    };
  },
};

/**
 * ER8: ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Expecto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:337
 * Purpose: Block Expecto spell in review task missing error states
 */
export const er8Transition: Transition = {
  fromState: [
    'ERROR_REVIEW_TASK_MISSING_G',
    'ERROR_REVIEW_TASK_MISSING_A',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
  ],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stays in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER8');
    return {
      message: response,
    };
  },
};

/**
 * ER9: ERROR_CONTEXT_MISSING + Finite -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:338
 * Purpose: Block Finite spell in ERROR_CONTEXT_MISSING state
 */
export const er9Transition: Transition = {
  fromState: 'ERROR_CONTEXT_MISSING',
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER9');
    return {
      message: response,
    };
  },
};

/**
 * ER10: ERROR_CONTEXT_MISSING + Reparo -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:339
 * Purpose: Block Reparo spell in ERROR_CONTEXT_MISSING state
 */
export const er10Transition: Transition = {
  fromState: 'ERROR_CONTEXT_MISSING',
  spell: 'Reparo',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER10');
    return {
      message: response,
    };
  },
};

/**
 * ER11: ERROR_CONTEXT_MISSING + Reverto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:340
 * Purpose: Block Reverto spell in ERROR_CONTEXT_MISSING state
 */
export const er11Transition: Transition = {
  fromState: 'ERROR_CONTEXT_MISSING',
  spell: 'Reverto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER11');
    return {
      message: response,
    };
  },
};

/**
 * ER12: ERROR_CONTEXT_MISSING + Expecto -> [BLOCKED]
 * From: "Error State Other Transitions" table
 * Reference: state-machine/state-machine.md:341
 * Purpose: Block Expecto spell in ERROR_CONTEXT_MISSING state
 */
export const er12Transition: Transition = {
  fromState: 'ERROR_CONTEXT_MISSING',
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE, // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_other_ER12');
    return {
      message: response,
    };
  },
};

/**
 * Error State Other Transitions
 * Maps to: "Error State Other Transitions" table in state-machine.md
 */
export const errorStateOtherTransitions: Transition[] = [
  er1Transition,
  er2Transition,
  er3aTransition,
  er3bTransition,
  er4Transition,
  er5Transition,
  er6Transition,
  er7aTransition,
  er7bTransition,
  er8Transition,
  er9Transition,
  er10Transition,
  er11Transition,
  er12Transition,
];
