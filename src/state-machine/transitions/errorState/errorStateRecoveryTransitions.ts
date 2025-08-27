import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils, TemplateUtils, TaskUtils } from '../../utils';

/**
 * R1: ERROR_TASK_MISSING + Accio -> ACHIEVE_TASK_DRAFTING
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:313
 * Purpose: Recover from missing task by creating new task file
 */
export const r1Transition: Transition = {
  fromState: 'ERROR_TASK_MISSING',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  execute: async (_context, fileSystem) => {
    // Create the task.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('task');

    const response = ResponseUtils.formatResponse('error_recovery_R1');
    return {
      message: response,
    };
  },
};

/**
 * R2: ERROR_TASK_RESULTS_MISSING + Accio -> ACHIEVE_TASK_DRAFTING (exists)
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:314
 * Purpose: Recover when task-results.md exists by archiving and creating new task
 */
export const r2Transition: Transition = {
  fromState: 'ERROR_TASK_RESULTS_MISSING',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (_context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE);
  },
  execute: async (_context, fileSystem) => {
    // Archive task files using TaskUtils
    const taskUtils = new TaskUtils(fileSystem);
    const { archiveDir, taskResultsPath } = await taskUtils.archiveTask();

    // Create new task.md file
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('task');

    // Format response with placeholders replaced
    const response = ResponseUtils.formatResponse('error_recovery_R2', {
      ARCHIVE_PATH_PLACEHOLDER: archiveDir,
      TASK_RESULTS_FILE_PLACEHOLDER: taskResultsPath,
    });

    return {
      message: response,
    };
  },
};

/**
 * R3: ERROR_TASK_RESULTS_MISSING + Accio -> ACHIEVE_TASK_DRAFTING (missing)
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:315
 * Purpose: Recover when task-results.md is missing by archiving incomplete task
 */
export const r3Transition: Transition = {
  fromState: 'ERROR_TASK_RESULTS_MISSING',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (_context, fileSystem) => {
    return !(await fileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE));
  },
  execute: async (_context, fileSystem) => {
    // Archive incomplete task using TaskUtils
    const taskUtils = new TaskUtils(fileSystem);
    await taskUtils.archiveTask();

    // Create new task.md file
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('task');

    const response = ResponseUtils.formatResponse('error_recovery_R3');
    return {
      message: response,
    };
  },
};

/**
 * R4: ERROR_PLAN_MISSING + Accio -> GATHER_NEEDS_CONTEXT
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:316
 * Purpose: Recover from missing plan by returning to context gathering
 */
export const r4Transition: Transition = {
  fromState: 'ERROR_PLAN_MISSING',
  spell: 'Accio',
  toState: 'GATHER_NEEDS_CONTEXT',
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_recovery_R4');
    return {
      message: response,
    };
  },
};

/**
 * R5a: ERROR_COMMENTS_MISSING_G + Accio -> PR_GATHERING_COMMENTS_G
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:317
 * Purpose: Recover from missing comments by creating comments file (G variant)
 */
export const r5aTransition: Transition = {
  fromState: 'ERROR_COMMENTS_MISSING_G',
  spell: 'Accio',
  toState: 'PR_GATHERING_COMMENTS_G',
  execute: async (_context, fileSystem) => {
    // Create the comments.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('comments');

    const response = ResponseUtils.formatResponse('error_recovery_R5a');
    return {
      message: response,
    };
  },
};

/**
 * R5b: ERROR_COMMENTS_MISSING_A + Accio -> PR_GATHERING_COMMENTS_A
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:318
 * Purpose: Recover from missing comments by creating comments file (A variant)
 */
export const r5bTransition: Transition = {
  fromState: 'ERROR_COMMENTS_MISSING_A',
  spell: 'Accio',
  toState: 'PR_GATHERING_COMMENTS_A',
  execute: async (_context, fileSystem) => {
    // Create the comments.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('comments');

    const response = ResponseUtils.formatResponse('error_recovery_R5b');
    return {
      message: response,
    };
  },
};

/**
 * R6a: ERROR_REVIEW_TASK_MISSING_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A] (exists)
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:319
 * Purpose: Recover from missing review-task when comments file exists
 */
export const r6aTransition: Transition = {
  fromState: ['ERROR_REVIEW_TASK_MISSING_G', 'ERROR_REVIEW_TASK_MISSING_A'],
  spell: 'Accio',
  toState: 'PR_REVIEW_TASK_DRAFT_[G/A]',
  condition: async (_context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
  },
  execute: async (_context, fileSystem) => {
    // Create the review-task.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('review_task');

    const response = ResponseUtils.formatResponse('error_recovery_R6a');
    return {
      message: response,
    };
  },
};

/**
 * R7a: ERROR_REVIEW_TASK_MISSING_[G/A] + Accio -> ERROR_COMMENTS_MISSING_[G/A] (missing)
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:320
 * Purpose: Handle missing review-task when comments file is also missing
 */
export const r7aTransition: Transition = {
  fromState: ['ERROR_REVIEW_TASK_MISSING_G', 'ERROR_REVIEW_TASK_MISSING_A'],
  spell: 'Accio',
  toState: 'ERROR_COMMENTS_MISSING_[G/A]',
  condition: async (_context, fileSystem) => {
    return !(await fileSystem.exists(FILE_PATHS.COMMENTS_FILE));
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_recovery_R7a');
    return {
      message: response,
    };
  },
};

/**
 * R8a: ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A]
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:321
 * Purpose: Recover from missing review-task-results when review-task exists
 */
export const r8aTransition: Transition = {
  fromState: ['ERROR_REVIEW_TASK_RESULTS_MISSING_G', 'ERROR_REVIEW_TASK_RESULTS_MISSING_A'],
  spell: 'Accio',
  toState: 'PR_REVIEW_TASK_DRAFT_[G/A]',
  condition: async (_context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('error_recovery_R8a');
    return {
      message: response,
    };
  },
};

/**
 * R9: ERROR_CONTEXT_MISSING + Accio -> GATHER_EDITING_CONTEXT
 * From: "Error State Recovery Transitions" table
 * Reference: state-machine/state-machine.md:322
 * Purpose: Recover from missing context by creating context file
 */
export const r9Transition: Transition = {
  fromState: 'ERROR_CONTEXT_MISSING',
  spell: 'Accio',
  toState: 'GATHER_EDITING_CONTEXT',
  execute: async (_context, fileSystem) => {
    // Create the context.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('context');

    const response = ResponseUtils.formatResponse('error_recovery_R9');
    return {
      message: response,
    };
  },
};

/**
 * Error State Recovery Transitions
 * Maps to: "Error State Recovery Transitions" table in state-machine.md
 */
export const errorStateRecoveryTransitions: Transition[] = [
  r1Transition,
  r2Transition,
  r3Transition,
  r4Transition,
  r5aTransition,
  r5bTransition,
  r6aTransition,
  r7aTransition,
  r8aTransition,
  r9Transition,
];
