import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { PlanUtils } from '../../utils/planUtils';

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
 * Universal Expecto Transitions
 * Maps to: "Universal Expecto Transitions" table in state-machine.md
 */
export const expectoTransitions: Transition[] = [e1bTransition];
