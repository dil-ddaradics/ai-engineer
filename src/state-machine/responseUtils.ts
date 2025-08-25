import { StateName } from './types.js';
import { RESPONSES } from './responses.js';

/**
 * Utility functions for handling state machine responses
 */
export class ResponseUtils {
  /**
   * Format a response with dynamic content replacement
   */
  static formatResponse(responseKey: string, replacements: Record<string, string> = {}): string {
    let response = RESPONSES[responseKey] || '';

    // Replace placeholders with actual content
    Object.entries(replacements).forEach(([placeholder, value]) => {
      const placeholderPattern = new RegExp(`\\[${placeholder}\\]`, 'g');
      response = response.replace(placeholderPattern, value);
    });

    return response;
  }

  /**
   * Extract the developer response portion from a full response
   */
  static extractDeveloperResponse(fullResponse: string): string {
    const developerSection = fullResponse.split('## Response to the Developer')[1];
    return developerSection ? developerSection.trim() : fullResponse;
  }

  /**
   * Extract the AI instructions portion from a full response
   */
  static extractAiInstructions(fullResponse: string): string {
    const aiSection = fullResponse
      .split('## Response to the AI')[1]
      ?.split('## Response to the Developer')[0];
    return aiSection ? aiSection.trim() : '';
  }

  /**
   * Check if a response contains placeholders that need replacement
   */
  static hasPlaceholders(response: string): boolean {
    return /\[.*?_PLACEHOLDER\]/.test(response);
  }

  /**
   * Get all placeholder names from a response
   */
  static getPlaceholders(response: string): string[] {
    const matches = response.match(/\[(.*?_PLACEHOLDER)\]/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * Validate that all required placeholders have been replaced
   */
  static validateReplacements(response: string, replacements: Record<string, string>): boolean {
    const placeholders = this.getPlaceholders(response);
    return placeholders.every(placeholder => placeholder in replacements);
  }

  /**
   * Get response type based on the response key
   */
  static getResponseType(
    responseKey: string
  ): 'transition' | 'blocked' | 'noop' | 'error' | 'confirmation' {
    if (responseKey.includes('_blocked_')) return 'blocked';
    if (responseKey.includes('_noop_')) return 'noop';
    if (responseKey.includes('_confirm_')) return 'confirmation';
    if (responseKey.includes('_transitions_') || responseKey.includes('_recovery_'))
      return 'transition';
    return 'error';
  }

  /**
   * Check if a response requires file operations
   */
  static requiresFileOperations(responseKey: string): boolean {
    const fileOperationKeys = [
      'achieve_transitions_A1',
      'achieve_transitions_A2',
      'pr_transitions_P1',
      'pr_transitions_P2',
      'gather_transitions_G1',
      'gather_transitions_G2',
      'error_recovery_R1',
      'error_recovery_R2',
      'error_recovery_R4',
    ];
    return fileOperationKeys.includes(responseKey);
  }

  /**
   * Get the expected next state for a response
   */
  static getExpectedNextState(responseKey: string, currentState: StateName): StateName {
    // Map of response keys to their expected next states
    const stateTransitions: Record<string, StateName> = {
      gather_transitions_G1: 'GATHER_PLAN_DRAFT',
      gather_transitions_G2: 'ACHIEVE_TASK_DRAFT',
      achieve_transitions_A1: 'ACHIEVE_TASK_EXECUTED',
      achieve_transitions_A2: 'ACHIEVE_TASK_DRAFT',
      pr_transitions_P1: 'PR_TASK_PLAN',
      pr_transitions_P2: 'PR_TASK_EXECUTED_PLAN',
      finite_transitions_F1: 'GATHER_PLAN_DRAFT',
      reverto_transitions_V1: 'GATHER_PLAN_DRAFT',
    };

    return stateTransitions[responseKey] || currentState;
  }

  /**
   * Check if a spell is available in the current state
   */
  static isSpellAvailable(state: StateName, spell: string): boolean {
    // Define spell availability by state
    const spellAvailability: Record<StateName, string[]> = {
      GATHER_NO_PLAN: ['Accio', 'Lumos'],
      GATHER_PLAN_DRAFT: ['Accio', 'Expecto', 'Reparo', 'Finite', 'Lumos'],
      ACHIEVE_TASK_DRAFT: ['Accio', 'Finite', 'Reparo', 'Lumos'],
      ACHIEVE_TASK_EXECUTED: ['Accio', 'Finite', 'Reparo', 'Lumos'],
      ACHIEVE_COMPLETE: ['Finite', 'Reparo', 'Lumos'],
      PR_COMMENTS_PLAN: ['Accio', 'Finite', 'Reverto', 'Lumos'],
      PR_COMMENTS_TASK: ['Accio', 'Finite', 'Reverto', 'Lumos'],
      PR_TASK_PLAN: ['Accio', 'Finite', 'Reverto', 'Lumos'],
      PR_TASK_TASK: ['Accio', 'Finite', 'Reverto', 'Lumos'],
      PR_TASK_EXECUTED_PLAN: ['Accio', 'Lumos'],
      PR_TASK_EXECUTED_TASK: ['Accio', 'Lumos'],
      GATHER_CONTEXT_NONE: ['Accio', 'Lumos'],
      GATHER_CONTEXT_DRAFT: ['Accio', 'Expecto', 'Finite', 'Lumos'],
      ERROR_NO_PLAN: ['Accio', 'Lumos'],
      ERROR_NO_TASK: ['Accio', 'Finite', 'Lumos'],
      ERROR_NO_TASK_RESULTS: ['Accio', 'Finite', 'Lumos'],
      ERROR_NO_CONTEXT: ['Accio', 'Lumos'],
      ERROR_NO_COMMENTS: ['Accio', 'Lumos'],
      ERROR_NO_REVIEW_TASK: ['Accio', 'Lumos'],
      ERROR_NO_REVIEW_TASK_RESULTS: ['Accio', 'Lumos'],
      ERROR_REVIEW_TASK_MISSING: ['Accio', 'Lumos'],
      ERROR_REVIEW_TASK_RESULTS_MISSING: ['Accio', 'Lumos'],
      ERROR_PLAN_MISSING: ['Accio', 'Lumos'],
      ERROR_TASK_MISSING: ['Accio', 'Lumos'],
      ERROR_TASK_RESULTS_MISSING: ['Accio', 'Lumos'],
      ERROR_COMMENTS_MISSING: ['Accio', 'Lumos'],
      ERROR_CONTEXT_MISSING: ['Accio', 'Lumos'],
      PR_CONFIRM_COMMENTS_PLAN: ['Reparo', 'Reverto', 'Accio', 'Lumos'],
      PR_CONFIRM_COMMENTS_TASK: ['Reparo', 'Reverto', 'Accio', 'Lumos'],
      PR_CONFIRM_TASK_PLAN: ['Reparo', 'Reverto', 'Accio', 'Lumos'],
      PR_CONFIRM_TASK_TASK: ['Reparo', 'Reverto', 'Accio', 'Lumos'],
    };

    const availableSpells = spellAvailability[state] || [];
    return availableSpells.includes(spell);
  }

  /**
   * Get human-readable description of a state
   */
  static getStateDescription(state: StateName): string {
    const descriptions: Record<StateName, string> = {
      GATHER_NO_PLAN: 'Initial state - no plan created yet',
      GATHER_PLAN_DRAFT: 'Planning phase - editing acceptance criteria',
      GATHER_CONTEXT_NONE: 'Context gathering - no context created yet',
      GATHER_CONTEXT_DRAFT: 'Context gathering - editing project context',
      ACHIEVE_TASK_DRAFT: 'Task execution - defining specific work',
      ACHIEVE_TASK_EXECUTED: 'Task execution - work completed, results ready',
      ACHIEVE_COMPLETE: 'All acceptance criteria completed',
      PR_COMMENTS_PLAN: 'PR review - gathering comments (from plan editing)',
      PR_COMMENTS_TASK: 'PR review - gathering comments (from task execution)',
      PR_TASK_PLAN: 'PR review - defining review tasks (from plan editing)',
      PR_TASK_TASK: 'PR review - defining review tasks (from task execution)',
      PR_TASK_EXECUTED_PLAN: 'PR review - tasks completed (returning to plan)',
      PR_TASK_EXECUTED_TASK: 'PR review - tasks completed (returning to tasks)',
      PR_CONFIRM_COMMENTS_PLAN: 'Confirming PR comments restart (from plan)',
      PR_CONFIRM_COMMENTS_TASK: 'Confirming PR comments restart (from task)',
      PR_CONFIRM_TASK_PLAN: 'Confirming PR review restart (from plan)',
      PR_CONFIRM_TASK_TASK: 'Confirming PR review restart (from task)',
      ERROR_NO_PLAN: 'Error - missing plan file',
      ERROR_NO_TASK: 'Error - missing task file',
      ERROR_NO_TASK_RESULTS: 'Error - missing task results file',
      ERROR_NO_CONTEXT: 'Error - missing context file',
      ERROR_NO_COMMENTS: 'Error - missing PR comments file',
      ERROR_NO_REVIEW_TASK: 'Error - missing review task file',
      ERROR_NO_REVIEW_TASK_RESULTS: 'Error - missing review task results file',
      ERROR_REVIEW_TASK_MISSING: 'Error - review task file missing',
      ERROR_REVIEW_TASK_RESULTS_MISSING: 'Error - review task results file missing',
      ERROR_PLAN_MISSING: 'Error - plan file missing',
      ERROR_TASK_MISSING: 'Error - task file missing',
      ERROR_TASK_RESULTS_MISSING: 'Error - task results file missing',
      ERROR_COMMENTS_MISSING: 'Error - comments file missing',
      ERROR_CONTEXT_MISSING: 'Error - context file missing',
    };

    return descriptions[state] || `Unknown state: ${state}`;
  }
}
