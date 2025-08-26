import { Transition } from '../../types';
import { ResponseUtils, TransitionUtils } from '../../utils';

/**
 * PB1: PR_APPLIED_PENDING_ARCHIVE_[G/A] + Reverto -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:370
 * Purpose: Blocks Reverto spell when PR review results need to be archived first
 */
export const pb1Transition: Transition = {
  fromState: ['PR_APPLIED_PENDING_ARCHIVE_G', 'PR_APPLIED_PENDING_ARCHIVE_A'],
  spell: 'Reverto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB1');

    return {
      message: response,
    };
  },
};

/**
 * PB2: PR_GATHERING_COMMENTS_[G/A] + Expecto -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:371
 * Purpose: Blocks Expecto spell during comment gathering phase
 */
export const pb2Transition: Transition = {
  fromState: ['PR_GATHERING_COMMENTS_G', 'PR_GATHERING_COMMENTS_A'],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB2');

    return {
      message: response,
    };
  },
};

/**
 * PB2b: PR_REVIEW_TASK_DRAFT_[G/A] + Expecto -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:372
 * Purpose: Blocks Expecto spell during task draft review phase
 */
export const pb2bTransition: Transition = {
  fromState: ['PR_REVIEW_TASK_DRAFT_G', 'PR_REVIEW_TASK_DRAFT_A'],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB2b');

    return {
      message: response,
    };
  },
};

/**
 * PB2d: PR_APPLIED_PENDING_ARCHIVE_[G/A] + Expecto -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:373
 * Purpose: Blocks Expecto spell when PR review results need to be archived
 */
export const pb2dTransition: Transition = {
  fromState: ['PR_APPLIED_PENDING_ARCHIVE_G', 'PR_APPLIED_PENDING_ARCHIVE_A'],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB2d');

    return {
      message: response,
    };
  },
};

/**
 * PB3: PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] + Finite -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:374
 * Purpose: Blocks Finite spell during active PR review phases
 */
export const pb3Transition: Transition = {
  fromState: [
    'PR_GATHERING_COMMENTS_G',
    'PR_GATHERING_COMMENTS_A',
    'PR_REVIEW_TASK_DRAFT_G',
    'PR_REVIEW_TASK_DRAFT_A',
  ],
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB3');

    return {
      message: response,
    };
  },
};

/**
 * PB4: PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] + Reparo -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:375
 * Purpose: Blocks Reparo spell during active PR review phases
 */
export const pb4Transition: Transition = {
  fromState: [
    'PR_GATHERING_COMMENTS_G',
    'PR_GATHERING_COMMENTS_A',
    'PR_REVIEW_TASK_DRAFT_G',
    'PR_REVIEW_TASK_DRAFT_A',
  ],
  spell: 'Reparo',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB4');

    return {
      message: response,
    };
  },
};

/**
 * PB5: PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] + Finite -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:376
 * Purpose: Blocks Finite spell during PR restart confirmation phases
 */
export const pb5Transition: Transition = {
  fromState: [
    'PR_CONFIRM_RESTART_COMMENTS_G',
    'PR_CONFIRM_RESTART_COMMENTS_A',
    'PR_CONFIRM_RESTART_TASK_G',
    'PR_CONFIRM_RESTART_TASK_A',
  ],
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB5');

    return {
      message: response,
    };
  },
};

/**
 * PB6: PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] + Expecto -> [BLOCKED]
 * From: PR Review Phase Blocked Transitions table
 * Reference: state-machine/state-machine.md:377
 * Purpose: Blocks Expecto spell during PR restart confirmation phases
 */
export const pb6Transition: Transition = {
  fromState: [
    'PR_CONFIRM_RESTART_COMMENTS_G',
    'PR_CONFIRM_RESTART_COMMENTS_A',
    'PR_CONFIRM_RESTART_TASK_G',
    'PR_CONFIRM_RESTART_TASK_A',
  ],
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_blocked_PB6');

    return {
      message: response,
    };
  },
};

/**
 * PR Review Phase Blocked Transitions
 * Maps to: "PR Review Phase Blocked Transitions" table in state-machine.md
 */
export const prReviewBlocked: Transition[] = [
  pb1Transition,
  pb2Transition,
  pb2bTransition,
  pb2dTransition,
  pb3Transition,
  pb4Transition,
  pb5Transition,
  pb6Transition,
];
