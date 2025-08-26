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
 * Gather Acceptance Criteria Phase Transitions
 * Maps to: "Gather Acceptance Criteria Phase Transitions" table in state-machine.md
 */
export const gatherAcceptanceCriteriaTransitions: Transition[] = [g2Transition];
