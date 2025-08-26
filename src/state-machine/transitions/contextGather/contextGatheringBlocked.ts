import { Transition } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

/**
 * GCB1: GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT + Reverto -> [BLOCKED]
 * Reverto is not allowed in context gathering states
 */
export const gcb1Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Reverto',
  toState: 'GATHER_NEEDS_CONTEXT', // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('gather_blocked_GCB1');

    return {
      message: response,
    };
  },
};

/**
 * GCB1 variant: GATHER_EDITING_CONTEXT + Reverto -> [BLOCKED]
 * Reverto is not allowed in context gathering states
 */
export const gcb1bTransition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Reverto',
  toState: 'GATHER_EDITING_CONTEXT', // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('gather_blocked_GCB1');

    return {
      message: response,
    };
  },
};

/**
 * GCB2: GATHER_NEEDS_CONTEXT + Expecto -> [BLOCKED]
 * Expecto is not allowed when no context file exists
 */
export const gcb2Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Expecto',
  toState: 'GATHER_NEEDS_CONTEXT', // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('gather_blocked_GCB2');

    return {
      message: response,
    };
  },
};

/**
 * GCB3: GATHER_NEEDS_CONTEXT + Reparo -> [BLOCKED]
 * Reparo is not allowed when no plan exists
 */
export const gcb3Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Reparo',
  toState: 'GATHER_NEEDS_CONTEXT', // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('gather_blocked_GCB3');

    return {
      message: response,
    };
  },
};

/**
 * GCB4: GATHER_EDITING_CONTEXT + Reparo -> [BLOCKED]
 * Reparo is not allowed when no plan exists
 */
export const gcb4Transition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Reparo',
  toState: 'GATHER_EDITING_CONTEXT', // Stay in same state (blocked)
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return blocked response
    const response = ResponseUtils.formatResponse('gather_blocked_GCB4');

    return {
      message: response,
    };
  },
};

/**
 * Context Gathering Phase Blocked Transitions
 * Maps to: "Context Gathering Phase Blocked Transitions" table in state-machine.md
 */
export const contextGatheringBlocked: Transition[] = [
  gcb1Transition,
  gcb1bTransition,
  gcb2Transition,
  gcb3Transition,
  gcb4Transition,
];
