import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TemplateUtils } from '../../utils/templateUtils';
import { TaskUtils } from '../../utils/taskUtils';

/**
 * P1: PR_GATHERING_COMMENTS_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A]
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:278
 * Purpose: Creates review-task.md when comments.md exists
 */
export const p1Transition: Transition = {
  fromState: ['PR_GATHERING_COMMENTS_G', 'PR_GATHERING_COMMENTS_A'],
  spell: 'Accio',
  toState: 'PR_REVIEW_TASK_DRAFT_[G/A]',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/comments.md` exists (exists)
    return await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
  },
  execute: async (context, fileSystem) => {
    // Create TemplateUtils instance
    const templateUtils = new TemplateUtils(fileSystem);

    // Creates `.ai/task/review-task.md` with template
    await templateUtils.writeTemplate('review_task');

    // Get response template
    const response = ResponseUtils.formatResponse('pr_transitions_P1');

    return {
      message: response,
    };
  },
};

/**
 * P1b: PR_GATHERING_COMMENTS_[G/A] + Accio -> ERROR_COMMENTS_MISSING_[G/A]
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:279
 * Purpose: Handle missing comments.md file error during PR review task creation
 */
export const p1bTransition: Transition = {
  fromState: ['PR_GATHERING_COMMENTS_G', 'PR_GATHERING_COMMENTS_A'],
  spell: 'Accio',
  toState: 'ERROR_COMMENTS_MISSING_[G/A]',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/comments.md` exists (missing)
    return !(await fileSystem.exists(FILE_PATHS.COMMENTS_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // Get response template
    const response = ResponseUtils.formatResponse('pr_transitions_P1b');

    return {
      message: response,
    };
  },
};

/**
 * P2: PR_REVIEW_TASK_DRAFT_[G/A] + Accio -> PR_APPLIED_PENDING_ARCHIVE_[G/A]
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:280
 * Purpose: Execute review task when review-task.md exists
 */
export const p2Transition: Transition = {
  fromState: ['PR_REVIEW_TASK_DRAFT_G', 'PR_REVIEW_TASK_DRAFT_A'],
  spell: 'Accio',
  toState: 'PR_APPLIED_PENDING_ARCHIVE_[G/A]',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/review-task.md` exists (exists)
    return await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
  },
  execute: async (_context, _fileSystem) => {
    // Get response template - no MCP Actions specified
    const response = ResponseUtils.formatResponse('pr_transitions_P2');

    return {
      message: response,
    };
  },
};

/**
 * P2b: PR_REVIEW_TASK_DRAFT_[G/A] + Accio -> ERROR_REVIEW_TASK_MISSING_[G/A]
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:281
 * Purpose: Handle missing review-task.md file error during review task execution
 */
export const p2bTransition: Transition = {
  fromState: ['PR_REVIEW_TASK_DRAFT_G', 'PR_REVIEW_TASK_DRAFT_A'],
  spell: 'Accio',
  toState: 'ERROR_REVIEW_TASK_MISSING_[G/A]',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/review-task.md` exists (missing)
    return !(await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // Get response template
    const response = ResponseUtils.formatResponse('pr_transitions_P2b');

    return {
      message: response,
    };
  },
};

/**
 * P3: PR_APPLIED_PENDING_ARCHIVE_G + Accio -> GATHER_EDITING
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:282
 * Purpose: Archive review files and return to GATHER_EDITING (from G state)
 */
export const p3Transition: Transition = {
  fromState: 'PR_APPLIED_PENDING_ARCHIVE_G',
  spell: 'Accio',
  toState: 'GATHER_EDITING',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/review-task-results.md` exists (exists)
    return await fileSystem.exists(FILE_PATHS.REVIEW_TASK_RESULTS_FILE);
  },
  execute: async (context, fileSystem) => {
    // (1) Archives review files to `pr-reviews/pr-review-<date>/`
    const taskUtils = new TaskUtils(fileSystem);
    const { reviewTaskResultsPath } = await taskUtils.archiveReviewTask();

    // (2) Replaces placeholder with file path reference
    const response = ResponseUtils.formatResponse('pr_transitions_P3', {
      REVIEW_TASK_RESULTS_FILE_PLACEHOLDER: reviewTaskResultsPath,
    });

    return {
      message: response,
    };
  },
};

/**
 * P3b: PR_APPLIED_PENDING_ARCHIVE_[G/A] + Accio -> ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A]
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:283
 * Purpose: Handle missing review-task-results.md file error during archive
 */
export const p3bTransition: Transition = {
  fromState: ['PR_APPLIED_PENDING_ARCHIVE_G', 'PR_APPLIED_PENDING_ARCHIVE_A'],
  spell: 'Accio',
  toState: 'ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A]',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/review-task-results.md` exists (missing)
    return !(await fileSystem.exists(FILE_PATHS.REVIEW_TASK_RESULTS_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // Get response template
    const response = ResponseUtils.formatResponse('pr_transitions_P3b');

    return {
      message: response,
    };
  },
};

/**
 * P4a: PR_APPLIED_PENDING_ARCHIVE_A + Accio -> ACHIEVE_TASK_DRAFTING
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:284
 * Purpose: Archive review files and return to ACHIEVE_TASK_DRAFTING (from A state, task.md exists)
 */
export const p4aTransition: Transition = {
  fromState: 'PR_APPLIED_PENDING_ARCHIVE_A',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/review-task-results.md` exists (exists); Checks `.ai/task/task.md` exists (exists)
    return (
      (await fileSystem.exists(FILE_PATHS.REVIEW_TASK_RESULTS_FILE)) &&
      (await fileSystem.exists(FILE_PATHS.TASK_FILE))
    );
  },
  execute: async (context, fileSystem) => {
    // (1) Archives review files to `pr-reviews/pr-review-<date>/`
    const taskUtils = new TaskUtils(fileSystem);
    const { reviewTaskResultsPath } = await taskUtils.archiveReviewTask();

    // (2) Replaces placeholder with file path reference
    const response = ResponseUtils.formatResponse('pr_transitions_P4a', {
      REVIEW_TASK_RESULTS_FILE_PLACEHOLDER: reviewTaskResultsPath,
    });

    return {
      message: response,
    };
  },
};

/**
 * P4b: PR_APPLIED_PENDING_ARCHIVE_A + Accio -> ACHIEVE_TASK_DRAFTING
 * From: PR Review Phase Transitions table
 * Reference: state-machine/state-machine.md:285
 * Purpose: Archive review files, create task.md and return to ACHIEVE_TASK_DRAFTING (from A state, task.md missing)
 */
export const p4bTransition: Transition = {
  fromState: 'PR_APPLIED_PENDING_ARCHIVE_A',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (context, fileSystem) => {
    // Checks `.ai/task/review-task-results.md` exists (exists); Checks `.ai/task/task.md` exists (doesn't exist)
    return (
      (await fileSystem.exists(FILE_PATHS.REVIEW_TASK_RESULTS_FILE)) &&
      !(await fileSystem.exists(FILE_PATHS.TASK_FILE))
    );
  },
  execute: async (context, fileSystem) => {
    // (1) Archives review files to `pr-reviews/pr-review-<date>/`
    const taskUtils = new TaskUtils(fileSystem);
    const { reviewTaskResultsPath } = await taskUtils.archiveReviewTask();

    // (2) Creates `.ai/task/task.md` with template
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('task');

    // (3) Replaces placeholder with file path reference
    const response = ResponseUtils.formatResponse('pr_transitions_P4b', {
      REVIEW_TASK_RESULTS_FILE_PLACEHOLDER: reviewTaskResultsPath,
    });

    return {
      message: response,
    };
  },
};

/**
 * PR Review Phase Transitions
 * Maps to: "PR Review Phase Transitions" table in state-machine.md
 */
export const prReviewTransitions: Transition[] = [
  p1Transition,
  p1bTransition,
  p2Transition,
  p2bTransition,
  p3Transition,
  p3bTransition,
  p4aTransition,
  p4bTransition,
];
