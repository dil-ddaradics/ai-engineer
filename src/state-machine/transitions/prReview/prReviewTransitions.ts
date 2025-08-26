import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TemplateUtils } from '../../utils/templateUtils';

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
 * PR Review Phase Transitions
 * Maps to: "PR Review Phase Transitions" table in state-machine.md
 */
export const prReviewTransitions: Transition[] = [p1Transition];
