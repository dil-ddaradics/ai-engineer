import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { PlanUtils } from '../../utils/planUtils';
import { TransitionUtils } from '../../utils/transitionUtils';

/**
 * E1b: GATHER_EDITING_CONTEXT + Expecto -> GATHER_EDITING_CONTEXT
 * From: Universal Expecto Transitions table
 * Reference: state-machine/state-machine.md:414
 * Purpose: Enriches context with Atlassian resources that haven't been processed yet
 */
export const e1bTransition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Expecto',
  toState: 'GATHER_EDITING_CONTEXT',
  condition: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Check if context.md exists
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false;
    }

    // Check if there are unprocessed URLs
    const unprocessedUrls = await planUtils.getUnprocessedUrls(FILE_PATHS.CONTEXT_FILE);
    return unprocessedUrls.length > 0;
  },
  execute: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Get unprocessed URLs from context.md
    const unprocessedUrls = await planUtils.getUnprocessedUrls(FILE_PATHS.CONTEXT_FILE);

    // Format response with URL list
    const urlList = unprocessedUrls.join('\n');
    const response = ResponseUtils.formatResponse('universal_expecto_E1b', {
      ATLASSIAN_URLS_PLACEHOLDER: urlList,
    });

    // Update .atlassian-refs with processed URLs
    await planUtils.updateProcessedUrls(unprocessedUrls);

    return {
      message: response,
    };
  },
};

/**
 * E2: GATHER_EDITING + Expecto -> GATHER_EDITING
 * From: Universal Expecto Transitions table
 * Reference: state-machine/state-machine.md:415
 * Purpose: Enriches plan with Atlassian resources that haven't been processed yet
 */
export const e2Transition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Expecto',
  toState: 'GATHER_EDITING',
  condition: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Check if plan.md exists
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_FILE))) {
      return false;
    }

    // Check if there are unprocessed URLs
    const unprocessedUrls = await planUtils.getUnprocessedUrls(FILE_PATHS.PLAN_FILE);
    return unprocessedUrls.length > 0;
  },
  execute: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Get unprocessed URLs from plan.md
    const unprocessedUrls = await planUtils.getUnprocessedUrls(FILE_PATHS.PLAN_FILE);

    // Format response with URL list
    const urlList = unprocessedUrls.join('\n');
    const response = ResponseUtils.formatResponse('universal_expecto_E2', {
      ATLASSIAN_URLS_PLACEHOLDER: urlList,
    });

    // Update .atlassian-refs with processed URLs
    await planUtils.updateProcessedUrls(unprocessedUrls);

    return {
      message: response,
    };
  },
};

/**
 * E3: GATHER_EDITING_CONTEXT + Expecto -> Same state
 * From: Universal Expecto Transitions table
 * Reference: state-machine/state-machine.md:416
 * Purpose: Handles case when context.md has no Atlassian URLs to process
 */
export const e3Transition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  condition: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Check if context.md exists
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false;
    }

    // Check if there are no Atlassian URLs in the file
    const hasUrls = await planUtils.hasAtlassianUrls(FILE_PATHS.CONTEXT_FILE);
    return !hasUrls;
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('universal_expecto_E3');

    return {
      message: response,
    };
  },
};

/**
 * E3b: GATHER_EDITING + Expecto -> Same state
 * From: Universal Expecto Transitions table
 * Reference: state-machine/state-machine.md:417
 * Purpose: Handles case when plan.md has no Atlassian URLs to process
 */
export const e3bTransition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  condition: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Check if plan.md exists
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_FILE))) {
      return false;
    }

    // Check if there are no Atlassian URLs in the file
    const hasUrls = await planUtils.hasAtlassianUrls(FILE_PATHS.PLAN_FILE);
    return !hasUrls;
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('universal_expecto_E3b');

    return {
      message: response,
    };
  },
};

/**
 * E4: GATHER_EDITING_CONTEXT + Expecto -> Same state
 * From: Universal Expecto Transitions table
 * Reference: state-machine/state-machine.md:418
 * Purpose: Handles case when context.md has Atlassian URLs but all are already processed
 */
export const e4Transition: Transition = {
  fromState: 'GATHER_EDITING_CONTEXT',
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  condition: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Check if context.md exists
    if (!(await fileSystem.exists(FILE_PATHS.CONTEXT_FILE))) {
      return false;
    }

    // Check if file has URLs but none are unprocessed
    const hasUrls = await planUtils.hasAtlassianUrls(FILE_PATHS.CONTEXT_FILE);
    if (!hasUrls) {
      return false;
    }

    const unprocessedUrls = await planUtils.getUnprocessedUrls(FILE_PATHS.CONTEXT_FILE);
    return unprocessedUrls.length === 0;
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('universal_expecto_E4');

    return {
      message: response,
    };
  },
};

/**
 * E4b: GATHER_EDITING + Expecto -> Same state
 * From: Universal Expecto Transitions table
 * Reference: state-machine/state-machine.md:419
 * Purpose: Handles case when plan.md has Atlassian URLs but all are already processed
 */
export const e4bTransition: Transition = {
  fromState: 'GATHER_EDITING',
  spell: 'Expecto',
  toState: TransitionUtils.STAY_IN_SAME_STATE,
  condition: async (context, fileSystem) => {
    const planUtils = new PlanUtils(fileSystem);

    // Check if plan.md exists
    if (!(await fileSystem.exists(FILE_PATHS.PLAN_FILE))) {
      return false;
    }

    // Check if file has URLs but none are unprocessed
    const hasUrls = await planUtils.hasAtlassianUrls(FILE_PATHS.PLAN_FILE);
    if (!hasUrls) {
      return false;
    }

    const unprocessedUrls = await planUtils.getUnprocessedUrls(FILE_PATHS.PLAN_FILE);
    return unprocessedUrls.length === 0;
  },
  execute: async (_context, _fileSystem) => {
    const response = ResponseUtils.formatResponse('universal_expecto_E4b');

    return {
      message: response,
    };
  },
};

/**
 * Universal Expecto Transitions
 * Maps to: "Universal Expecto Transitions" table in state-machine.md
 */
export const expectoTransitions: Transition[] = [
  e1bTransition,
  e2Transition,
  e3Transition,
  e3bTransition,
  e4Transition,
  e4bTransition,
];
