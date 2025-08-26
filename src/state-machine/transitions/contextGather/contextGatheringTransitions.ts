import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TemplateUtils } from '../../utils/templateUtils';
import { PlanUtils } from '../../utils/planUtils';

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
    await templateUtils.writeTemplate('context');

    // (2) Copies `.ai/plan-guide.md` and `.ai/task-guide.md` from MCP resources if missing
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_GUIDE_FILE))) {
      await templateUtils.writeTemplate('plan_guide');
    }

    if (!(await fileSystem.exists(FILE_PATHS.TASK_GUIDE_FILE))) {
      await templateUtils.writeTemplate('task_guide');
    }

    // Get response template
    const response = ResponseUtils.formatResponse('gather_transitions_GC1');

    return {
      message: response,
    };
  },
};

/**
 * GC2a: GATHER_EDITING_CONTEXT + Accio -> GATHER_EDITING
 * Creates plan.md file when Atlassian URLs are found in context.md
 */
export const gc2aTransition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Accio',
  toState: 'GATHER_EDITING',
  condition: async (context, fileSystem) => {
    // Check if context.md exists
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false;
    }

    // Check if Atlassian URLs are found in context.md
    const planUtils = new PlanUtils(fileSystem);
    return await planUtils.hasAtlassianUrls(FILE_PATHS.CONTEXT_FILE);
  },
  execute: async (context, fileSystem) => {
    // Create TemplateUtils and PlanUtils instances
    const templateUtils = new TemplateUtils(fileSystem);
    const planUtils = new PlanUtils(fileSystem);

    // Creates `.ai/task/plan.md` file
    await templateUtils.writeTemplate('plan');

    // Extract Atlassian URLs for response placeholder
    const atlassianUrls = await planUtils.extractAtlassianUrls(FILE_PATHS.CONTEXT_FILE);
    const urlsList = atlassianUrls.map(url => `- ${url}`).join('\n');

    // Get response template and replace placeholder
    const response = ResponseUtils.formatResponse('gather_transitions_GC2', {
      ATLASSIAN_URLS_PLACEHOLDER: urlsList,
    });

    return {
      message: response,
    };
  },
};

/**
 * GC2b: GATHER_EDITING_CONTEXT + Accio -> GATHER_EDITING
 * Creates plan.md file when no Atlassian URLs are found in context.md
 */
export const gc2bTransition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Accio',
  toState: 'GATHER_EDITING',
  condition: async (context, fileSystem) => {
    // Check if context.md exists
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false;
    }

    // Check if Atlassian URLs are NOT found in context.md
    const planUtils = new PlanUtils(fileSystem);
    return !(await planUtils.hasAtlassianUrls(FILE_PATHS.CONTEXT_FILE));
  },
  execute: async (context, fileSystem) => {
    // Create TemplateUtils instance
    const templateUtils = new TemplateUtils(fileSystem);

    // Creates `.ai/task/plan.md` file
    await templateUtils.writeTemplate('plan');

    // Get response template
    const response = ResponseUtils.formatResponse('gather_transitions_GC2-no-urls');

    return {
      message: response,
    };
  },
};

/**
 * GC2c: GATHER_EDITING_CONTEXT + Accio -> ERROR_CONTEXT_MISSING
 * Error transition when context.md is missing
 */
export const gc2cTransition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Accio',
  toState: 'ERROR_CONTEXT_MISSING',
  condition: async (context, fileSystem) => {
    // Check if context.md does NOT exist
    return !(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE));
  },
  execute: async (_context, _fileSystem) => {
    // No MCP actions - just return error response
    const response = ResponseUtils.formatResponse('gather_transitions_GC2b');

    return {
      message: response,
    };
  },
};

/**
 * Context Gathering Phase Transitions
 * Maps to: "Context Gathering Phase Transitions" table in state-machine.md
 */
export const contextGatheringTransitions: Transition[] = [
  gc1Transition,
  gc2aTransition,
  gc2bTransition,
  gc2cTransition,
];
