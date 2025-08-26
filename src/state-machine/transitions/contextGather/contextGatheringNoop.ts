import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { PlanUtils } from '../../utils/planUtils';

/**
 * GCN1: GATHER_EDITING_CONTEXT + Finite -> Same state
 * Finite has no effect in context editing phase
 */
export const gcn1Transition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Finite',
  toState: 'GATHER_EDITING_CONTEXT', // Stay in same state (no-op)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return no-op response
    const response = ResponseUtils.formatResponse('gather_noop_GCN1');

    return {
      message: response,
    };
  },
};

/**
 * GCN2: GATHER_NEEDS_CONTEXT + Finite -> Same state
 * Finite has no effect when no context exists yet
 */
export const gcn2Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Finite',
  toState: 'GATHER_NEEDS_CONTEXT', // Stay in same state (no-op)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return no-op response
    const response = ResponseUtils.formatResponse('gather_noop_GCN2');

    return {
      message: response,
    };
  },
};

/**
 * GCN3: GATHER_NEEDS_CONTEXT + Expecto -> Same state
 * Expecto has no effect when no Atlassian URLs found in context
 */
export const gcn3Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Expecto',
  toState: 'GATHER_NEEDS_CONTEXT', // Stay in same state (no-op)
  condition: async (context, fileSystem) => {
    // Check if context.md exists and has no Atlassian URLs
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false; // This condition doesn't apply if no context file
    }

    // Check if context has no Atlassian URLs
    const planUtils = new PlanUtils(fileSystem);
    return !(await planUtils.hasAtlassianUrls(FILE_PATHS.CONTEXT_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return no-op response
    const response = ResponseUtils.formatResponse('gather_noop_GCN3');

    return {
      message: response,
    };
  },
};

/**
 * GCN3b: GATHER_EDITING_CONTEXT + Expecto -> Same state
 * Expecto has no effect when no Atlassian URLs found in context
 */
export const gcn3bTransition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Expecto',
  toState: 'GATHER_EDITING_CONTEXT', // Stay in same state (no-op)
  condition: async (context, fileSystem) => {
    // Check if context.md exists and has no Atlassian URLs
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false; // This condition doesn't apply if no context file
    }

    // Check if context has no Atlassian URLs
    const planUtils = new PlanUtils(fileSystem);
    return !(await planUtils.hasAtlassianUrls(FILE_PATHS.CONTEXT_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return no-op response
    const response = ResponseUtils.formatResponse('gather_noop_GCN3');

    return {
      message: response,
    };
  },
};

/**
 * Context Gathering Phase No-op Transitions
 * Maps to: "Context Gathering Phase No-op Transitions" table in state-machine.md
 */
export const contextGatheringNoop: Transition[] = [
  gcn1Transition,
  gcn2Transition,
  gcn3Transition,
  gcn3bTransition,
];
