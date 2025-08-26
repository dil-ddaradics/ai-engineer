import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils, TemplateUtils } from '../../utils';

/**
 * A5a: ACHIEVE states + Reparo -> PR_GATHERING_COMMENTS_A
 * From: "Starting PR Review (Reparo) Transitions" table
 * Reference: state-machine/state-machine.md:291
 * Purpose: Start PR review from ACHIEVE states when no comments/review-task files exist
 */
export const a5aTransition: Transition = {
  fromState: [
    'ACHIEVE_TASK_DRAFTING',
    'ACHIEVE_TASK_EXECUTED',
    'ACHIEVE_COMPLETE',
    'ERROR_TASK_MISSING',
    'ERROR_TASK_RESULTS_MISSING',
  ],
  spell: 'Reparo',
  toState: 'PR_GATHERING_COMMENTS_A',
  condition: async (context, fileSystem) => {
    const commentsExists = await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
    const reviewTaskExists = await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
    return !commentsExists && !reviewTaskExists;
  },
  execute: async (_context, fileSystem) => {
    // Create the comments.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('comments');

    const response = ResponseUtils.formatResponse('reparo_transitions_A5a');
    return {
      message: response,
    };
  },
};

/**
 * A5b: ERROR states with [G/A] + Reparo -> PR_GATHERING_COMMENTS_[G/A]
 * From: "Starting PR Review (Reparo) Transitions" table
 * Reference: state-machine/state-machine.md:292
 * Purpose: Start PR review from ERROR states when no comments/review-task files exist
 */
export const a5bTransition: Transition = {
  fromState: [
    'ERROR_COMMENTS_MISSING_G',
    'ERROR_COMMENTS_MISSING_A',
    'ERROR_REVIEW_TASK_MISSING_G',
    'ERROR_REVIEW_TASK_MISSING_A',
  ],
  spell: 'Reparo',
  toState: 'PR_GATHERING_COMMENTS_[G/A]', // Will be resolved automatically
  condition: async (context, fileSystem) => {
    const commentsExists = await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
    const reviewTaskExists = await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
    return !commentsExists && !reviewTaskExists;
  },
  execute: async (_context, fileSystem) => {
    // Create the comments.md file using TemplateUtils
    const templateUtils = new TemplateUtils(fileSystem);
    await templateUtils.writeTemplate('comments');

    const response = ResponseUtils.formatResponse('reparo_transitions_A5b');
    return {
      message: response,
    };
  },
};

/**
 * PR1: GATHER_EDITING + Reparo -> PR_CONFIRM_RESTART_COMMENTS_G
 * From: "Starting PR Review (Reparo) Transitions" table
 * Reference: state-machine/state-machine.md:293
 * Purpose: Start PR review from GATHER_EDITING when comments file exists
 */
export const pr1Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Reparo',
  toState: 'PR_CONFIRM_RESTART_COMMENTS_G',
  condition: async (context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('reparo_transitions_PR1');
    return {
      message: response,
    };
  },
};

/**
 * PR2: ACHIEVE states + Reparo -> PR_CONFIRM_RESTART_COMMENTS_A
 * From: "Starting PR Review (Reparo) Transitions" table
 * Reference: state-machine/state-machine.md:294
 * Purpose: Start PR review from ACHIEVE states when comments file exists
 */
export const pr2Transition: Transition = {
  fromState: ['ACHIEVE_TASK_DRAFTING', 'ACHIEVE_TASK_EXECUTED', 'ACHIEVE_COMPLETE'],
  spell: 'Reparo',
  toState: 'PR_CONFIRM_RESTART_COMMENTS_A',
  condition: async (context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('reparo_transitions_PR2');
    return {
      message: response,
    };
  },
};

/**
 * PR3: GATHER_EDITING + Reparo -> PR_CONFIRM_RESTART_TASK_G
 * From: "Starting PR Review (Reparo) Transitions" table
 * Reference: state-machine/state-machine.md:295
 * Purpose: Start PR review from GATHER_EDITING when review-task file exists
 */
export const pr3Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Reparo',
  toState: 'PR_CONFIRM_RESTART_TASK_G',
  condition: async (context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('reparo_transitions_PR3');
    return {
      message: response,
    };
  },
};

/**
 * PR4: ACHIEVE states + Reparo -> PR_CONFIRM_RESTART_TASK_A
 * From: "Starting PR Review (Reparo) Transitions" table
 * Reference: state-machine/state-machine.md:296
 * Purpose: Start PR review from ACHIEVE states when review-task file exists
 */
export const pr4Transition: Transition = {
  fromState: ['ACHIEVE_TASK_DRAFTING', 'ACHIEVE_TASK_EXECUTED', 'ACHIEVE_COMPLETE'],
  spell: 'Reparo',
  toState: 'PR_CONFIRM_RESTART_TASK_A',
  condition: async (context, fileSystem) => {
    return await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('reparo_transitions_PR4');
    return {
      message: response,
    };
  },
};

/**
 * Starting PR Review (Reparo) Transitions
 * Maps to: "Starting PR Review (Reparo) Transitions" table in state-machine.md
 */
export const startingPrReviewTransitions: Transition[] = [
  a5aTransition,
  a5bTransition,
  pr1Transition,
  pr2Transition,
  pr3Transition,
  pr4Transition,
];
