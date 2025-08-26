import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TaskUtils } from '../../utils/taskUtils';
import { TemplateUtils } from '../../utils/templateUtils';
import { PlanUtils } from '../../utils/planUtils';

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
 * A1b: ACHIEVE_TASK_DRAFTING + Accio -> ERROR_TASK_MISSING
 * From: "Achieve Acceptance Criteria Phase Transitions" table
 * Reference: state-machine/state-machine.md:260
 * Purpose: Handles case when task.md is missing during task drafting state
 */
export const a1bTransition: Transition = {
  fromState: 'ACHIEVE_TASK_DRAFTING',
  spell: 'Accio',
  toState: 'ERROR_TASK_MISSING',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/task.md` exists (missing)
    const taskExists = await fileSystem.exists(FILE_PATHS.TASK_FILE);
    return !taskExists;
  },
  execute: async (_context, _fileSystem) => {
    // No file operations required - just state transition to error state
    const response = ResponseUtils.formatResponse('achieve_transitions_A1b');

    return {
      message: response,
    };
  },
};

/**
 * A2: ACHIEVE_TASK_EXECUTED + Accio -> ACHIEVE_TASK_DRAFTING
 * From: "Achieve Acceptance Criteria Phase Transitions" table
 * Reference: state-machine/state-machine.md:261
 * Purpose: Archives completed task and creates new task for remaining acceptance criteria
 */
export const a2Transition: Transition = {
  fromState: 'ACHIEVE_TASK_EXECUTED',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/task-results.md` exists (exists); Checks `.ai/task/plan.md` exists (exists)
    const taskExists = await fileSystem.exists(FILE_PATHS.TASK_FILE);
    const taskResultsExists = await fileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE);
    const planExists = await fileSystem.exists(FILE_PATHS.PLAN_FILE);
    return taskExists && taskResultsExists && planExists;
  },
  execute: async (context, fileSystem) => {
    // (1) Reads `.ai/task/task.md` frontmatter; (2) Reads `.ai/task/task-results.md` content;
    // (3) Archives task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/`;
    // (4) Replaces `[TASK_RESULTS_PLACEHOLDER]` in response with results content;
    // (5) Creates `.ai/task/task.md` with template

    const taskUtils = new TaskUtils(fileSystem);
    const templateUtils = new TemplateUtils(fileSystem);

    // Read task-results.md content for placeholder replacement
    const taskResultsContent = await fileSystem.read(FILE_PATHS.TASK_RESULTS_FILE);

    // Archive task files
    await taskUtils.archiveTask();

    // Create new task.md from template
    await templateUtils.writeTemplate('task');

    // Format response with task results content
    const response = ResponseUtils.formatResponse('achieve_transitions_A2', {
      TASK_RESULTS_PLACEHOLDER: taskResultsContent,
    });

    return {
      message: response,
    };
  },
};

/**
 * A2b: ACHIEVE_TASK_EXECUTED + Accio -> ERROR_TASK_RESULTS_MISSING
 * From: "Achieve Acceptance Criteria Phase Transitions" table
 * Reference: state-machine/state-machine.md:262
 * Purpose: Handles case when task-results.md is missing during task executed state
 */
export const a2bTransition: Transition = {
  fromState: 'ACHIEVE_TASK_EXECUTED',
  spell: 'Accio',
  toState: 'ERROR_TASK_RESULTS_MISSING',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/task-results.md` exists (missing)
    const taskResultsExists = await fileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE);
    return !taskResultsExists;
  },
  execute: async (_context, _fileSystem) => {
    // No file operations required - just state transition to error state
    const response = ResponseUtils.formatResponse('achieve_transitions_A2b');

    return {
      message: response,
    };
  },
};

/**
 * A3: ACHIEVE_TASK_DRAFTING + Accio -> ACHIEVE_COMPLETE
 * From: "Achieve Acceptance Criteria Phase Transitions" table
 * Reference: state-machine/state-machine.md:263
 * Purpose: Transitions to completion when all acceptance criteria are met
 */
export const a3Transition: Transition = {
  fromState: 'ACHIEVE_TASK_DRAFTING',
  spell: 'Accio',
  toState: 'ACHIEVE_COMPLETE',
  condition: async (context, fileSystem) => {
    // Reads `.ai/task/plan.md` content; Counts unchecked acceptance criteria (lines starting with `- [ ]`) (finds 0); Checks `.ai/task/plan.md` exists (exists)
    const planExists = await fileSystem.exists(FILE_PATHS.PLAN_FILE);
    if (!planExists) {
      return false;
    }

    const planUtils = new PlanUtils(fileSystem);
    return await planUtils.areAllAcceptanceCriteriaCompleted(FILE_PATHS.PLAN_FILE);
  },
  execute: async (_context, _fileSystem) => {
    // No file operations required - just state transition
    const response = ResponseUtils.formatResponse('achieve_transitions_A3');

    return {
      message: response,
    };
  },
};

/**
 * A4: ACHIEVE_COMPLETE + Accio -> ACHIEVE_COMPLETE
 * From: "Achieve Acceptance Criteria Phase Transitions" table
 * Reference: state-machine/state-machine.md:264
 * Purpose: No-op transition that stays in completion state when already complete
 */
export const a4Transition: Transition = {
  fromState: 'ACHIEVE_COMPLETE',
  spell: 'Accio',
  toState: 'ACHIEVE_COMPLETE',
  condition: async () => {
    // No condition - this is a no-op transition that always applies
    return true;
  },
  execute: async (_context, _fileSystem) => {
    // No file operations required - just message explaining the no-op
    const response = ResponseUtils.formatResponse('achieve_transitions_A4');

    return {
      message: response,
    };
  },
};

/**
 * Achieve Acceptance Criteria Phase Transitions
 * Maps to: "Achieve Acceptance Criteria Phase Transitions" table in state-machine.md
 */
export const achieveAcceptanceCriteriaTransitions: Transition[] = [
  a1Transition,
  a1bTransition,
  a2Transition,
  a2bTransition,
  a3Transition,
  a4Transition,
];
