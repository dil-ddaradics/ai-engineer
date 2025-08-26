import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils, TemplateUtils } from '../../utils';

/**
 * C1: PR_CONFIRM_RESTART_COMMENTS_[G/A] + Reparo -> PR_GATHERING_COMMENTS_[G/A]
 * From: "PR Review Confirmation Transitions" table
 * Reference: state-machine/state-machine.md:302
 * Purpose: Confirm restart of PR comments review and create comments file
 */
export const c1Transition: Transition = {
  fromState: ['PR_CONFIRM_RESTART_COMMENTS_G', 'PR_CONFIRM_RESTART_COMMENTS_A'],
  spell: 'Reparo',
  toState: 'PR_GATHERING_COMMENTS_[G/A]',
  execute: async (_context, fileSystem) => {
    // Create the comments.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('comments');

    const response = ResponseUtils.formatResponse('pr_confirm_C1');
    return {
      message: response,
    };
  },
};

/**
 * C2: PR_CONFIRM_RESTART_TASK_[G/A] + Reparo -> PR_GATHERING_COMMENTS_[G/A]
 * From: "PR Review Confirmation Transitions" table
 * Reference: state-machine/state-machine.md:303
 * Purpose: Confirm restart of PR task review and create comments file
 */
export const c2Transition: Transition = {
  fromState: ['PR_CONFIRM_RESTART_TASK_G', 'PR_CONFIRM_RESTART_TASK_A'],
  spell: 'Reparo',
  toState: 'PR_GATHERING_COMMENTS_[G/A]',
  execute: async (_context, fileSystem) => {
    // Create the comments.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('comments');

    const response = ResponseUtils.formatResponse('pr_confirm_C2');
    return {
      message: response,
    };
  },
};

/**
 * C3a: PR_CONFIRM_RESTART_COMMENTS_[G/A] + Accio -> PR_GATHERING_COMMENTS_[G/A]
 * From: "PR Review Confirmation Transitions" table
 * Reference: state-machine/state-machine.md:304
 * Purpose: Continue PR comments review when comments file exists
 */
export const c3aTransition: Transition = {
  fromState: ['PR_CONFIRM_RESTART_COMMENTS_G', 'PR_CONFIRM_RESTART_COMMENTS_A'],
  spell: 'Accio',
  toState: 'PR_GATHERING_COMMENTS_[G/A]',
  condition: async (_context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_confirm_C3a');
    return {
      message: response,
    };
  },
};

/**
 * C3b: PR_CONFIRM_RESTART_COMMENTS_[G/A] + Accio -> ERROR_COMMENTS_MISSING_[G/A]
 * From: "PR Review Confirmation Transitions" table
 * Reference: state-machine/state-machine.md:305
 * Purpose: Handle missing comments file error
 */
export const c3bTransition: Transition = {
  fromState: ['PR_CONFIRM_RESTART_COMMENTS_G', 'PR_CONFIRM_RESTART_COMMENTS_A'],
  spell: 'Accio',
  toState: 'ERROR_COMMENTS_MISSING_[G/A]',
  condition: async (_context, fileSystem) => {
    return !(await fileSystem.exists(FILE_PATHS.COMMENTS_FILE));
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_confirm_C3b');
    return {
      message: response,
    };
  },
};

/**
 * C3c: PR_CONFIRM_RESTART_TASK_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A]
 * From: "PR Review Confirmation Transitions" table
 * Reference: state-machine/state-machine.md:306
 * Purpose: Continue PR task review when review-task file exists
 */
export const c3cTransition: Transition = {
  fromState: ['PR_CONFIRM_RESTART_TASK_G', 'PR_CONFIRM_RESTART_TASK_A'],
  spell: 'Accio',
  toState: 'PR_REVIEW_TASK_DRAFT_[G/A]',
  condition: async (_context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_confirm_C3c');
    return {
      message: response,
    };
  },
};

/**
 * C3d: PR_CONFIRM_RESTART_TASK_[G/A] + Accio -> ERROR_REVIEW_TASK_MISSING_[G/A]
 * From: "PR Review Confirmation Transitions" table
 * Reference: state-machine/state-machine.md:307
 * Purpose: Handle missing review-task file error
 */
export const c3dTransition: Transition = {
  fromState: ['PR_CONFIRM_RESTART_TASK_G', 'PR_CONFIRM_RESTART_TASK_A'],
  spell: 'Accio',
  toState: 'ERROR_REVIEW_TASK_MISSING_[G/A]',
  condition: async (_context, fileSystem) => {
    return !(await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE));
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('pr_confirm_C3d');
    return {
      message: response,
    };
  },
};

/**
 * PR Review Confirmation Transitions
 * Maps to: "PR Review Confirmation Transitions" table in state-machine.md
 */
export const prReviewConfirmationTransitions: Transition[] = [
  c1Transition,
  c2Transition,
  c3aTransition,
  c3bTransition,
  c3cTransition,
  c3dTransition,
];
