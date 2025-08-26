import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TemplateUtils } from '../../utils/templateUtils';

/**
 * GC1: GATHER_NEEDS_CONTEXT + Accio -> GATHER_EDITING_CONTEXT
 * Creates context.md file and copies guide files if missing
 */
export const gc1Transition: Transition = {
  fromState: 'GATHER_NEEDS_CONTEXT',
  spell: 'Accio',
  toState: 'GATHER_EDITING_CONTEXT',
  execute: async (context, fileSystem) => {
    // Create TemplateUtils instance
    const templateUtils = new TemplateUtils(fileSystem);

    // (1) Creates `.ai/task/context.md` with template
    await templateUtils.writeTemplate(FILE_PATHS.CONTEXT_FILE, 'context');

    // (2) Copies `.ai/plan-guide.md` and `.ai/task-guide.md` from MCP resources if missing
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_GUIDE_FILE))) {
      await templateUtils.writeTemplate(FILE_PATHS.PLAN_GUIDE_FILE, 'plan_guide');
    }

    if (!(await fileSystem.exists(FILE_PATHS.TASK_GUIDE_FILE))) {
      await templateUtils.writeTemplate(FILE_PATHS.TASK_GUIDE_FILE, 'task_guide');
    }

    // Get response template
    const response = ResponseUtils.formatResponse('gather_transitions_GC1');

    return {
      message: response,
    };
  },
};

/**
 * Context Gathering Phase Transitions
 * Maps to: "Context Gathering Phase Transitions" table in state-machine.md
 */
export const contextGatheringTransitions: Transition[] = [gc1Transition];
