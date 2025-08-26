import { StateName, STATE_NAMES } from '../types';

/**
 * Utility functions for handling state machine states and state collections
 */
export class StateUtils {
  /**
   * Returns all states except the specified excluded states.
   * Useful for creating "any state except" constructs in transitions.
   *
   * @param excludedStates - Array of state names to exclude
   * @returns Array of all states except the excluded ones
   * @throws Error if invalid state names are provided
   *
   * @example
   * ```typescript
   * // Get all states except the ones that block finite
   * const finiteAllowedStates = StateUtils.anyStateExcept([
   *   'ACHIEVE_TASK_EXECUTED',
   *   'PR_APPLIED_PENDING_ARCHIVE_G',
   *   'GATHER_NEEDS_CONTEXT'
   * ]);
   * ```
   */
  static anyStateExcept(excludedStates: StateName[]): StateName[] {
    // Validate input
    if (!Array.isArray(excludedStates)) {
      throw new Error('excludedStates must be an array');
    }

    // Check for invalid state names
    const invalidStates = excludedStates.filter(state => !STATE_NAMES.includes(state));
    if (invalidStates.length > 0) {
      throw new Error(
        `Invalid state names provided: ${invalidStates.join(', ')}. ` +
          `Valid states are: ${STATE_NAMES.join(', ')}`
      );
    }

    // Return all states except the excluded ones
    return STATE_NAMES.filter(state => !excludedStates.includes(state));
  }

  /**
   * Validates that all provided states are valid state names.
   *
   * @param states - Array of state names to validate
   * @returns true if all states are valid
   * @throws Error if any invalid state names are found
   */
  static validateStates(states: StateName[]): boolean {
    if (!Array.isArray(states)) {
      throw new Error('states must be an array');
    }

    const invalidStates = states.filter(state => !STATE_NAMES.includes(state));
    if (invalidStates.length > 0) {
      throw new Error(
        `Invalid state names: ${invalidStates.join(', ')}. ` +
          `Valid states are: ${STATE_NAMES.join(', ')}`
      );
    }

    return true;
  }

  /**
   * Returns the total number of states in the state machine.
   *
   * @returns The total count of states
   */
  static getTotalStateCount(): number {
    return STATE_NAMES.length;
  }

  /**
   * Returns all state names as a readonly array.
   *
   * @returns Array of all state names
   */
  static getAllStates(): readonly StateName[] {
    return STATE_NAMES;
  }
}
