import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils';

/**
 * V1: PR_GATHERING_COMMENTS_G, PR_REVIEW_TASK_DRAFT_G, PR_CONFIRM_RESTART_COMMENTS_G, PR_CONFIRM_RESTART_TASK_G, ERROR_COMMENTS_MISSING_G + Reverto -> GATHER_EDITING
 * From: Reverto Transitions (Exit PR Review) table
 * Reference: state-machine/state-machine.md:362
 * Purpose: Exit PR review from G states back to editing mode
 */
export const v1Transition: Transition = {
  fromState: [
    'PR_GATHERING_COMMENTS_G',
    'PR_REVIEW_TASK_DRAFT_G',
    'PR_CONFIRM_RESTART_COMMENTS_G',
    'PR_CONFIRM_RESTART_TASK_G',
    'ERROR_COMMENTS_MISSING_G',
  ],
  spell: 'Reverto',
  toState: 'GATHER_EDITING',
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return response
    const response = ResponseUtils.formatResponse('reverto_transitions_V1');

    return {
      message: response,
    };
  },
};

/**
 * V2a: PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A + Reverto -> ACHIEVE_TASK_DRAFTING
 * From: Reverto Transitions (Exit PR Review) table
 * Reference: state-machine/state-machine.md:363
 * Purpose: Exit PR review from A states when task.md exists but task-results.md doesn't
 */
export const v2aTransition: Transition = {
  fromState: [
    'PR_GATHERING_COMMENTS_A',
    'PR_REVIEW_TASK_DRAFT_A',
    'PR_CONFIRM_RESTART_COMMENTS_A',
    'PR_CONFIRM_RESTART_TASK_A',
    'ERROR_COMMENTS_MISSING_A',
  ],
  spell: 'Reverto',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (_context, fileSystem) => {
    // Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/task-results.md` exists (doesn't exist)
    const taskExists = await fileSystem.exists(FILE_PATHS.TASK_FILE);
    const taskResultsExists = await fileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE);

    return taskExists && !taskResultsExists;
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return response
    const response = ResponseUtils.formatResponse('reverto_transitions_V2a');

    return {
      message: response,
    };
  },
};

/**
 * V2b: PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A + Reverto -> ACHIEVE_TASK_EXECUTED
 * From: Reverto Transitions (Exit PR Review) table
 * Reference: state-machine/state-machine.md:364
 * Purpose: Exit PR review from A states when both task.md and task-results.md exist
 */
export const v2bTransition: Transition = {
  fromState: [
    'PR_GATHERING_COMMENTS_A',
    'PR_REVIEW_TASK_DRAFT_A',
    'PR_CONFIRM_RESTART_COMMENTS_A',
    'PR_CONFIRM_RESTART_TASK_A',
    'ERROR_COMMENTS_MISSING_A',
  ],
  spell: 'Reverto',
  toState: 'ACHIEVE_TASK_EXECUTED',
  condition: async (_context, fileSystem) => {
    // Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/task-results.md` exists (exists)
    const taskExists = await fileSystem.exists(FILE_PATHS.TASK_FILE);
    const taskResultsExists = await fileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE);

    return taskExists && taskResultsExists;
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return response
    const response = ResponseUtils.formatResponse('reverto_transitions_V2b');

    return {
      message: response,
    };
  },
};

/**
 * Reverto Transitions (Exit PR Review)
 * Maps to: "Reverto Transitions (Exit PR Review)" table in state-machine.md
 */
export const revertoTransitions: Transition[] = [v1Transition, v2aTransition, v2bTransition];
