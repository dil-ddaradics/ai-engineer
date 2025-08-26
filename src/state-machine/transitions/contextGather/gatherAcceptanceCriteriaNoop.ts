import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { PlanUtils } from '../../utils/planUtils';

/**
 * GN1: GATHER_EDITING + Finite -> Same state
 * Finite has no effect in plan editing phase
 */
export const gn1Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Finite',
  toState: 'GATHER_EDITING', // Stay in same state (no-op)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return no-op response
    const response = ResponseUtils.formatResponse('gather_noop_GN1');

    return {
      message: response,
    };
  },
};

/**
 * GN3: GATHER_EDITING + Expecto -> Same state
 * Expecto has no effect when no Atlassian URLs found in plan
 */
export const gn3Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Expecto',
  toState: 'GATHER_EDITING', // Stay in same state (no-op)
  condition: async (context, fileSystem) => {
    // Check if plan.md exists and has no Atlassian URLs
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_FILE))) {
      return false; // This condition doesn't apply if no plan file
    }

    // Check if plan has no Atlassian URLs
    const planUtils = new PlanUtils(fileSystem);
    return !(await planUtils.hasAtlassianUrls(FILE_PATHS.PLAN_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return no-op response
    const response = ResponseUtils.formatResponse('gather_noop_GN3');

    return {
      message: response,
    };
  },
};

/**
 * Gather Acceptance Criteria Phase No-op Transitions
 * Maps to: "Gather Acceptance Criteria Phase No-op Transitions" table in state-machine.md
 */
export const gatherAcceptanceCriteriaNoop: Transition[] = [gn1Transition, gn3Transition];
