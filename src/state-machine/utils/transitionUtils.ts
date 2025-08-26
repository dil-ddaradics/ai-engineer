import { StateName, Transition, ToStateValue } from '../types';

/**
 * Utility functions for handling state machine transitions
 */
export class TransitionUtils {
  /**
   * Checks if a current state matches the fromState criteria of a transition.
   * Handles both single state and array of states.
   *
   * @param transition - The transition to check
   * @param currentState - The current state to match against
   * @returns true if the current state matches the transition's fromState criteria
   */
  static matchesFromState(transition: Transition, currentState: StateName): boolean {
    if (Array.isArray(transition.fromState)) {
      return transition.fromState.includes(currentState);
    }
    return transition.fromState === currentState;
  }

  /**
   * Special token to indicate the transition should stay in the same state as the source.
   */
  static readonly STAY_IN_SAME_STATE = '__STAY_IN_SAME_STATE__';

  /**
   * Handles [G/A] placeholder replacement and STAY_IN_SAME_STATE resolution.
   *
   * @param fromState - The source state
   * @param toStateTemplate - The destination state template (may contain placeholders)
   * @returns The actual destination state
   */
  static resolveToState(fromState: StateName, toStateTemplate: ToStateValue): StateName {
    // Handle special case for staying in same state
    if (toStateTemplate === TransitionUtils.STAY_IN_SAME_STATE) {
      return fromState;
    }

    // Handle [G/A] placeholder replacement
    if (toStateTemplate.includes('[G/A]')) {
      // Extract suffix from source state
      const gSuffix = fromState.endsWith('_G');
      const aSuffix = fromState.endsWith('_A');

      if (gSuffix || aSuffix) {
        // Replace [G/A] notation with appropriate suffix
        const suffix = gSuffix ? 'G' : 'A';
        return toStateTemplate.replace(/\[G\/A\]/, suffix) as StateName;
      }
    }

    return toStateTemplate as StateName;
  }
}
