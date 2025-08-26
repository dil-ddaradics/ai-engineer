import { Transition } from '../../types';
import { ResponseUtils, TransitionUtils } from '../../utils';

/**
 * F3: PR_APPLIED_PENDING_ARCHIVE_[G/A] + Finite -> [BLOCKED]
 * From: Blocked Finite Transitions table
 * Reference: state-machine/state-machine.md:354
 * Purpose: Blocks Finite spell when PR review results need to be archived first
 */
export const f3Transition: Transition = {
  fromState: ['PR_APPLIED_PENDING_ARCHIVE_G', 'PR_APPLIED_PENDING_ARCHIVE_A'],
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('finite_blocked_F3');

    return {
      message: response,
    };
  },
};

/**
 * F4: GATHER_NEEDS_CONTEXT + Finite -> [BLOCKED]
 * From: Blocked Finite Transitions table
 * Reference: state-machine/state-machine.md:355
 * Purpose: Blocks Finite spell when no context has been created yet
 */
export const f4Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('finite_blocked_F4');

    return {
      message: response,
    };
  },
};

/**
 * F5: GATHER_EDITING_CONTEXT + Finite -> [BLOCKED]
 * From: Blocked Finite Transitions table
 * Reference: state-machine/state-machine.md:356
 * Purpose: Blocks Finite spell when context exists but plan hasn't been generated yet
 */
export const f5Transition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Finite',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('finite_blocked_F5');

    return {
      message: response,
    };
  },
};

/**
 * Blocked Finite Transitions
 * Maps to: "Blocked Finite Transitions" table in state-machine.md
 */
export const finiteBlocked: Transition[] = [f3Transition, f4Transition, f5Transition];
