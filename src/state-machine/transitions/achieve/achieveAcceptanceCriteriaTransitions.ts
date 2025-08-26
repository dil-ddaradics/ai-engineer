import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

/**
 * A1: ACHIEVE_TASK_DRAFTING + Accio -> ACHIEVE_TASK_EXECUTED
 * From: "Achieve Acceptance Criteria Phase Transitions" table
 * Reference: state-machine/state-machine.md:259
 * Purpose: Executes the task defined in task.md and transitions to executed state
 */
export const a1Transition: Transition = {
  fromState: 'ACHIEVE_TASK_DRAFTING',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_EXECUTED',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/plan.md` exists (exists)
    const taskExists = await fileSystem.exists(FILE_PATHS.TASK_FILE);
    const planExists = await fileSystem.exists(FILE_PATHS.PLAN_FILE);
    return taskExists && planExists;
  },
  execute: async (_context, _fileSystem) => {
    // No file operations required - just state transition
    const response = ResponseUtils.formatResponse('achieve_transitions_A1');

    return {
      message: response,
    };
  },
};

/**
 * Achieve Acceptance Criteria Phase Transitions
 * Maps to: "Achieve Acceptance Criteria Phase Transitions" table in state-machine.md
 */
export const achieveAcceptanceCriteriaTransitions: Transition[] = [a1Transition];
