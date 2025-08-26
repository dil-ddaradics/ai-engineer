import { Transition } from '../../types';
import { ResponseUtils, TransitionUtils } from '../../utils';

/**
 * L2: GATHER_EDITING + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:383
 * Purpose: Shows current state and available actions in GATHER_EDITING
 */
export const l2Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L2');
    return { message: response };
  },
};

/**
 * L3: ACHIEVE_TASK_DRAFTING + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:384
 * Purpose: Shows current state and available actions in ACHIEVE_TASK_DRAFTING
 */
export const l3Transition: Transition = {
  fromState: 'ACHIEVE_TASK_DRAFTING',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L3');
    return { message: response };
  },
};

/**
 * L4: ACHIEVE_TASK_EXECUTED + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:385
 * Purpose: Shows current state and available actions in ACHIEVE_TASK_EXECUTED
 */
export const l4Transition: Transition = {
  fromState: 'ACHIEVE_TASK_EXECUTED',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L4');
    return { message: response };
  },
};

/**
 * L5: ACHIEVE_COMPLETE + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:386
 * Purpose: Shows current state and available actions in ACHIEVE_COMPLETE
 */
export const l5Transition: Transition = {
  fromState: 'ACHIEVE_COMPLETE',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L5');
    return { message: response };
  },
};

/**
 * L6: PR_GATHERING_COMMENTS_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:387
 * Purpose: Shows current state and available actions in PR_GATHERING_COMMENTS_G
 */
export const l6Transition: Transition = {
  fromState: 'PR_GATHERING_COMMENTS_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L6');
    return { message: response };
  },
};

/**
 * L7: PR_GATHERING_COMMENTS_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:388
 * Purpose: Shows current state and available actions in PR_GATHERING_COMMENTS_A
 */
export const l7Transition: Transition = {
  fromState: 'PR_GATHERING_COMMENTS_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L7');
    return { message: response };
  },
};

/**
 * L8: PR_REVIEW_TASK_DRAFT_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:389
 * Purpose: Shows current state and available actions in PR_REVIEW_TASK_DRAFT_G
 */
export const l8Transition: Transition = {
  fromState: 'PR_REVIEW_TASK_DRAFT_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L8');
    return { message: response };
  },
};

/**
 * L9: PR_REVIEW_TASK_DRAFT_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:390
 * Purpose: Shows current state and available actions in PR_REVIEW_TASK_DRAFT_A
 */
export const l9Transition: Transition = {
  fromState: 'PR_REVIEW_TASK_DRAFT_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L9');
    return { message: response };
  },
};

/**
 * L10: PR_APPLIED_PENDING_ARCHIVE_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:391
 * Purpose: Shows current state and available actions in PR_APPLIED_PENDING_ARCHIVE_G
 */
export const l10Transition: Transition = {
  fromState: 'PR_APPLIED_PENDING_ARCHIVE_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L10');
    return { message: response };
  },
};

/**
 * L11: PR_APPLIED_PENDING_ARCHIVE_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:392
 * Purpose: Shows current state and available actions in PR_APPLIED_PENDING_ARCHIVE_A
 */
export const l11Transition: Transition = {
  fromState: 'PR_APPLIED_PENDING_ARCHIVE_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L11');
    return { message: response };
  },
};

/**
 * L12: PR_CONFIRM_RESTART_COMMENTS_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:393
 * Purpose: Shows current state and available actions in PR_CONFIRM_RESTART_COMMENTS_G
 */
export const l12Transition: Transition = {
  fromState: 'PR_CONFIRM_RESTART_COMMENTS_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L12');
    return { message: response };
  },
};

/**
 * L13: PR_CONFIRM_RESTART_COMMENTS_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:394
 * Purpose: Shows current state and available actions in PR_CONFIRM_RESTART_COMMENTS_A
 */
export const l13Transition: Transition = {
  fromState: 'PR_CONFIRM_RESTART_COMMENTS_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L13');
    return { message: response };
  },
};

/**
 * L14: PR_CONFIRM_RESTART_TASK_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:395
 * Purpose: Shows current state and available actions in PR_CONFIRM_RESTART_TASK_G
 */
export const l14Transition: Transition = {
  fromState: 'PR_CONFIRM_RESTART_TASK_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L14');
    return { message: response };
  },
};

/**
 * L15: PR_CONFIRM_RESTART_TASK_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:396
 * Purpose: Shows current state and available actions in PR_CONFIRM_RESTART_TASK_A
 */
export const l15Transition: Transition = {
  fromState: 'PR_CONFIRM_RESTART_TASK_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L15');
    return { message: response };
  },
};

/**
 * L16: ERROR_TASK_MISSING + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:397
 * Purpose: Shows current state and available actions in ERROR_TASK_MISSING
 */
export const l16Transition: Transition = {
  fromState: 'ERROR_TASK_MISSING',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L16');
    return { message: response };
  },
};

/**
 * L17: ERROR_TASK_RESULTS_MISSING + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:398
 * Purpose: Shows current state and available actions in ERROR_TASK_RESULTS_MISSING
 */
export const l17Transition: Transition = {
  fromState: 'ERROR_TASK_RESULTS_MISSING',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L17');
    return { message: response };
  },
};

/**
 * L18: ERROR_PLAN_MISSING + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:399
 * Purpose: Shows current state and available actions in ERROR_PLAN_MISSING
 */
export const l18Transition: Transition = {
  fromState: 'ERROR_PLAN_MISSING',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L18');
    return { message: response };
  },
};

/**
 * L19: ERROR_COMMENTS_MISSING_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:400
 * Purpose: Shows current state and available actions in ERROR_COMMENTS_MISSING_G
 */
export const l19Transition: Transition = {
  fromState: 'ERROR_COMMENTS_MISSING_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L19');
    return { message: response };
  },
};

/**
 * L19a: ERROR_COMMENTS_MISSING_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:401
 * Purpose: Shows current state and available actions in ERROR_COMMENTS_MISSING_A
 */
export const l19aTransition: Transition = {
  fromState: 'ERROR_COMMENTS_MISSING_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L19a');
    return { message: response };
  },
};

/**
 * L20: ERROR_REVIEW_TASK_MISSING_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:402
 * Purpose: Shows current state and available actions in ERROR_REVIEW_TASK_MISSING_G
 */
export const l20Transition: Transition = {
  fromState: 'ERROR_REVIEW_TASK_MISSING_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L20');
    return { message: response };
  },
};

/**
 * L20a: ERROR_REVIEW_TASK_MISSING_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:403
 * Purpose: Shows current state and available actions in ERROR_REVIEW_TASK_MISSING_A
 */
export const l20aTransition: Transition = {
  fromState: 'ERROR_REVIEW_TASK_MISSING_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L20a');
    return { message: response };
  },
};

/**
 * L21: ERROR_REVIEW_TASK_RESULTS_MISSING_G + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:404
 * Purpose: Shows current state and available actions in ERROR_REVIEW_TASK_RESULTS_MISSING_G
 */
export const l21Transition: Transition = {
  fromState: 'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L21');
    return { message: response };
  },
};

/**
 * L21a: ERROR_REVIEW_TASK_RESULTS_MISSING_A + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:405
 * Purpose: Shows current state and available actions in ERROR_REVIEW_TASK_RESULTS_MISSING_A
 */
export const l21aTransition: Transition = {
  fromState: 'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L21a');
    return { message: response };
  },
};

/**
 * L22: GATHER_NEEDS_CONTEXT + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:406
 * Purpose: Shows current state and available actions in GATHER_NEEDS_CONTEXT
 */
export const l22Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L22');
    return { message: response };
  },
};

/**
 * L23: GATHER_EDITING_CONTEXT + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:407
 * Purpose: Shows current state and available actions in GATHER_EDITING_CONTEXT
 */
export const l23Transition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L23');
    return { message: response };
  },
};

/**
 * L24: ERROR_CONTEXT_MISSING + Lumos -> Same state
 * From: Universal Lumos Transitions table
 * Reference: state-machine/state-machine.md:408
 * Purpose: Shows current state and available actions in ERROR_CONTEXT_MISSING
 */
export const l24Transition: Transition = {
  fromState: 'ERROR_CONTEXT_MISSING',
  spell: 'Lumos',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatLumosResponse('lumos_transitions_L24');
    return { message: response };
  },
};

// Export the array including all individual transitions
export const lumosTransitions: Transition[] = [
  l2Transition,
  l3Transition,
  l4Transition,
  l5Transition,
  l6Transition,
  l7Transition,
  l8Transition,
  l9Transition,
  l10Transition,
  l11Transition,
  l12Transition,
  l13Transition,
  l14Transition,
  l15Transition,
  l16Transition,
  l17Transition,
  l18Transition,
  l19Transition,
  l19aTransition,
  l20Transition,
  l20aTransition,
  l21Transition,
  l21aTransition,
  l22Transition,
  l23Transition,
  l24Transition,
];
