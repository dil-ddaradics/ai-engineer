import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TemplateUtils } from '../../utils/templateUtils';
import { PlanUtils } from '../../utils/planUtils';

/**
 * G2: GATHER_EDITING + Accio -> ACHIEVE_TASK_DRAFTING
 * Creates task.md when plan has acceptance criteria and task.md doesn't exist
 */
export const g2Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (context, fileSystem) => {
    // Check if plan.md exists
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_FILE))) {
      return false;
    }

    // Check if task.md doesn't exist
    if (await fileSystem.exists(FILE_PATHS.TASK_FILE)) {
      return false;
    }

    // Check if plan has at least one acceptance criterion (- [ ])
    const planUtils = new PlanUtils(fileSystem);
    const { pending } = await planUtils.parseAcceptanceCriteria(FILE_PATHS.PLAN_FILE);
    return pending.length >= 1;
  },
  execute: async (context, fileSystem) => {
    // Create TemplateUtils instance
    const templateUtils = new TemplateUtils(fileSystem);

    // Creates `.ai/task/task.md` with template
    await templateUtils.writeTemplate('task');

    // Get response template
    const response = ResponseUtils.formatResponse('gather_transitions_G2');

    return {
      message: response,
    };
  },
};

/**
 * G2b: GATHER_EDITING, ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED + Accio -> ERROR_PLAN_MISSING
 * Error transition when plan.md is missing
 */
export const g2bTransition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Accio',
  toState: 'ERROR_PLAN_MISSING',
  condition: async (context, fileSystem) => {
    // Check if plan.md does NOT exist
    return !(await fileSystem.exists(FILE_PATHS.PLAN_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return error response
    const response = ResponseUtils.formatResponse('gather_transitions_G2b');

    return {
      message: response,
    };
  },
};

/**
 * G3: GATHER_EDITING + Accio -> GATHER_EDITING
 * No-op transition when plan has no acceptance criteria
 */
export const g3Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Accio',
  toState: 'GATHER_EDITING',
  condition: async (context, fileSystem) => {
    // Check if plan.md exists
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_FILE))) {
      return false;
    }

    // Check if plan has no pending acceptance criteria (finds 0)
    const planUtils = new PlanUtils(fileSystem);
    const { pending } = await planUtils.parseAcceptanceCriteria(FILE_PATHS.PLAN_FILE);
    return pending.length === 0;
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return response
    const response = ResponseUtils.formatResponse('gather_transitions_G3');

    return {
      message: response,
    };
  },
};

/**
 * G4: GATHER_EDITING + Accio -> ACHIEVE_TASK_DRAFTING
 * Transition when task.md already exists
 */
export const g4Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Accio',
  toState: 'ACHIEVE_TASK_DRAFTING',
  condition: async (context, fileSystem) => {
    // Check if task.md exists AND plan.md exists
    return (
      (await fileSystem.exists(FILE_PATHS.TASK_FILE)) &&
      (await fileSystem.exists(FILE_PATHS.PLAN_FILE))
    );
  },
  execute: async (context, fileSystem) => {
    // (1) Reads `.ai/task/task.md` content
    const taskContent = await fileSystem.readSafe(FILE_PATHS.TASK_FILE);

    // (2) Replaces `[TASK_CONTENT_PLACEHOLDER]` in response with task content
    const response = ResponseUtils.formatResponse('gather_transitions_G4', {
      TASK_CONTENT_PLACEHOLDER: taskContent,
    });

    return {
      message: response,
    };
  },
};

/**
 * G5: GATHER_EDITING + Reparo -> PR_GATHERING_COMMENTS_G
 * Initiates PR review process from gather phase
 */
export const g5Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Reparo',
  toState: 'PR_GATHERING_COMMENTS_G',
  condition: async (context, fileSystem) => {
    // Check if neither comments.md nor review-task.md exist
    const commentsExist = await fileSystem.exists(FILE_PATHS.COMMENTS_FILE);
    const reviewTaskExist = await fileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE);
    return !commentsExist && !reviewTaskExist;
  },
  execute: async (context, fileSystem) => {
    // Create TemplateUtils instance
    const templateUtils = new TemplateUtils(fileSystem);

    // Creates `.ai/task/comments.md` file
    await templateUtils.writeTemplate('comments');

    // Get response template
    const response = ResponseUtils.formatResponse('gather_transitions_G5');

    return {
      message: response,
    };
  },
};

/**
 * Gather Acceptance Criteria Phase Transitions
 * Maps to: "Gather Acceptance Criteria Phase Transitions" table in state-machine.md
 */
export const gatherAcceptanceCriteriaTransitions: Transition[] = [
  g2Transition,
  g2bTransition,
  g3Transition,
  g4Transition,
  g5Transition,
];
