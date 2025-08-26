import { Transition } from '../../types';
import { ResponseUtils, StateUtils } from '../../utils';

/**
 * F1: Any state except excluded states + Finite -> GATHER_EDITING
 * From: "Finite Transitions (Universal Return to Plan)" table
 * Reference: state-machine/state-machine.md:347
 * Purpose: Universal return to plan editing for most states
 * 
 * States that block finite (excluded from this transition):
 * - ACHIEVE_TASK_EXECUTED: Must process task results first
 * - GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT: No plan to return to yet
 * - PR_APPLIED_PENDING_ARCHIVE_*: Must archive PR results first
 * - PR_GATHERING_COMMENTS_*, PR_REVIEW_TASK_DRAFT_*, PR_CONFIRM_RESTART_*: In PR workflow
 * - ERROR_PLAN_MISSING, ERROR_CONTEXT_MISSING: Missing required files
 * - ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING: Must fix task state first
 * - ERROR_REVIEW_TASK_MISSING_*, ERROR_REVIEW_TASK_RESULTS_MISSING_*: Must fix review state first
 */
export const f1Transition: Transition = {
  fromState: StateUtils.anyStateExcept([
    // States that must complete their current action before returning to plan
    'ACHIEVE_TASK_EXECUTED',
    
    // States with no plan to return to yet
    'GATHER_NEEDS_CONTEXT',
    'GATHER_EDITING_CONTEXT',
    
    // PR states that must archive results or are in active workflow
    'PR_APPLIED_PENDING_ARCHIVE_G',
    'PR_APPLIED_PENDING_ARCHIVE_A',
    'PR_GATHERING_COMMENTS_G',
    'PR_GATHERING_COMMENTS_A',
    'PR_REVIEW_TASK_DRAFT_G',
    'PR_REVIEW_TASK_DRAFT_A',
    'PR_CONFIRM_RESTART_COMMENTS_G',
    'PR_CONFIRM_RESTART_COMMENTS_A',
    'PR_CONFIRM_RESTART_TASK_G',
    'PR_CONFIRM_RESTART_TASK_A',
    
    // Error states that must be resolved first
    'ERROR_PLAN_MISSING',
    'ERROR_CONTEXT_MISSING',
    'ERROR_TASK_MISSING',
    'ERROR_TASK_RESULTS_MISSING',
    'ERROR_REVIEW_TASK_MISSING_G',
    'ERROR_REVIEW_TASK_MISSING_A',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
    'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
  ]),
  spell: 'Finite',
  toState: 'GATHER_EDITING',
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('finite_transitions_F1');
    return {
      message: response,
    };
  },
};

/**
 * F2: ACHIEVE_COMPLETE + Finite -> GATHER_EDITING
 * From: "Finite Transitions (Universal Return to Plan)" table
 * Reference: state-machine/state-machine.md:348
 * Purpose: Return to plan editing from completed state
 */
export const f2Transition: Transition = {
  fromState: 'ACHIEVE_COMPLETE',
  spell: 'Finite',
  toState: 'GATHER_EDITING',
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('finite_transitions_F2');
    return {
      message: response,
    };
  },
};

/**
 * Finite Transitions (Universal Return to Plan)
 * Maps to: "Finite Transitions (Universal Return to Plan)" table in state-machine.md
 */
export const finiteTransitions: Transition[] = [f1Transition, f2Transition];
