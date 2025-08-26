import { Transition } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

/**
 * GB1: GATHER_EDITING + Reverto -> [BLOCKED]
 * Reverto is not allowed in planning states
 */
export const gb1Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Reverto',
  toState: 'GATHER_EDITING', // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('gather_blocked_GB1');

    return {
      message: response,
    };
  },
};

/**
 * Gather Acceptance Criteria Phase Blocked Transitions
 * Maps to: "Gather Acceptance Criteria Phase Blocked Transitions" table in state-machine.md
 */
export const gatherAcceptanceCriteriaBlocked: Transition[] = [gb1Transition];
