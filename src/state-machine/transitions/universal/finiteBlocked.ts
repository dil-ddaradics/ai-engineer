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
 * Blocked Finite Transitions
 * Maps to: "Blocked Finite Transitions" table in state-machine.md
 */
export const finiteBlocked: Transition[] = [f3Transition];
