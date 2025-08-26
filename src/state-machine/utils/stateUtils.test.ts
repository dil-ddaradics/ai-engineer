import { StateUtils } from './stateUtils';
import { StateName, STATE_NAMES } from '../types';

describe('StateUtils', () => {
  describe('anyStateExcept', () => {
    it('should return all states when no exclusions provided', () => {
      const result = StateUtils.anyStateExcept([]);
      expect(result).toHaveLength(STATE_NAMES.length);
      expect(result).toEqual(expect.arrayContaining(STATE_NAMES));
    });

    it('should exclude single state correctly', () => {
      const excluded: StateName[] = ['GATHER_EDITING'];
      const result = StateUtils.anyStateExcept(excluded);

      expect(result).toHaveLength(STATE_NAMES.length - 1);
      expect(result).not.toContain('GATHER_EDITING');
      expect(result).toContain('ACHIEVE_TASK_DRAFTING');
      expect(result).toContain('PR_GATHERING_COMMENTS_G');
    });

    it('should exclude multiple states correctly', () => {
      const excluded: StateName[] = [
        'GATHER_EDITING',
        'ACHIEVE_TASK_EXECUTED',
        'PR_APPLIED_PENDING_ARCHIVE_G',
      ];
      const result = StateUtils.anyStateExcept(excluded);

      expect(result).toHaveLength(STATE_NAMES.length - 3);
      expect(result).not.toContain('GATHER_EDITING');
      expect(result).not.toContain('ACHIEVE_TASK_EXECUTED');
      expect(result).not.toContain('PR_APPLIED_PENDING_ARCHIVE_G');
      expect(result).toContain('ACHIEVE_TASK_DRAFTING');
    });

    it('should handle F1 finite transition blocked states correctly', () => {
      const finiteBlockedStates: StateName[] = [
        'ACHIEVE_TASK_EXECUTED',
        'GATHER_NEEDS_CONTEXT',
        'GATHER_EDITING_CONTEXT',
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_G',
        'PR_REVIEW_TASK_DRAFT_A',
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
        'ERROR_PLAN_MISSING',
        'ERROR_CONTEXT_MISSING',
        'ERROR_TASK_MISSING',
        'ERROR_TASK_RESULTS_MISSING',
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ];

      const result = StateUtils.anyStateExcept(finiteBlockedStates);

      // Should have 26 total states - 21 blocked states = 5 allowed states
      expect(result).toHaveLength(26 - 21);

      // Verify none of the blocked states are included
      finiteBlockedStates.forEach(blockedState => {
        expect(result).not.toContain(blockedState);
      });

      // Verify some expected allowed states are included
      expect(result).toContain('GATHER_EDITING');
      expect(result).toContain('ACHIEVE_TASK_DRAFTING');
      expect(result).toContain('ACHIEVE_COMPLETE');
      expect(result).toContain('ERROR_COMMENTS_MISSING_G');
      expect(result).toContain('ERROR_COMMENTS_MISSING_A');
    });

    it('should return empty array when all states are excluded', () => {
      const result = StateUtils.anyStateExcept([...STATE_NAMES]);
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should throw error for invalid state names', () => {
      const invalidStates = ['INVALID_STATE', 'ANOTHER_INVALID'] as unknown as StateName[];

      expect(() => StateUtils.anyStateExcept(invalidStates)).toThrow(
        'Invalid state names provided: INVALID_STATE, ANOTHER_INVALID'
      );
    });

    it('should throw error for non-array input', () => {
      expect(() => StateUtils.anyStateExcept('not-an-array' as any)).toThrow(
        'excludedStates must be an array'
      );
    });

    it('should handle mixed valid and invalid states', () => {
      const mixedStates = ['GATHER_EDITING', 'INVALID_STATE'] as unknown as StateName[];

      expect(() => StateUtils.anyStateExcept(mixedStates)).toThrow(
        'Invalid state names provided: INVALID_STATE'
      );
    });

    it('should handle duplicate excluded states', () => {
      const duplicateStates: StateName[] = [
        'GATHER_EDITING',
        'ACHIEVE_TASK_EXECUTED',
        'GATHER_EDITING', // duplicate
      ];

      const result = StateUtils.anyStateExcept(duplicateStates);

      // Should exclude the state only once
      expect(result).toHaveLength(STATE_NAMES.length - 2);
      expect(result).not.toContain('GATHER_EDITING');
      expect(result).not.toContain('ACHIEVE_TASK_EXECUTED');
    });
  });

  describe('validateStates', () => {
    it('should return true for valid states', () => {
      const validStates: StateName[] = [
        'GATHER_EDITING',
        'ACHIEVE_TASK_DRAFTING',
        'PR_GATHERING_COMMENTS_G',
      ];

      expect(StateUtils.validateStates(validStates)).toBe(true);
    });

    it('should return true for empty array', () => {
      expect(StateUtils.validateStates([])).toBe(true);
    });

    it('should throw error for invalid states', () => {
      const invalidStates = ['INVALID_STATE'] as unknown as StateName[];

      expect(() => StateUtils.validateStates(invalidStates)).toThrow(
        'Invalid state names: INVALID_STATE'
      );
    });

    it('should throw error for non-array input', () => {
      expect(() => StateUtils.validateStates('not-an-array' as any)).toThrow(
        'states must be an array'
      );
    });
  });

  describe('getTotalStateCount', () => {
    it('should return correct total state count', () => {
      expect(StateUtils.getTotalStateCount()).toBe(26);
      expect(StateUtils.getTotalStateCount()).toBe(STATE_NAMES.length);
    });
  });

  describe('getAllStates', () => {
    it('should return all state names', () => {
      const result = StateUtils.getAllStates();
      expect(result).toEqual(STATE_NAMES);
      expect(result).toHaveLength(26);
    });

    it('should return readonly array', () => {
      const result = StateUtils.getAllStates();
      // Verify it's the same reference (readonly)
      expect(result).toBe(STATE_NAMES);
    });
  });

  describe('integration with real state machine', () => {
    it('should contain all expected state categories', () => {
      const allStates = StateUtils.getAllStates();

      // GATHER states
      expect(allStates).toContain('GATHER_NEEDS_CONTEXT');
      expect(allStates).toContain('GATHER_EDITING_CONTEXT');
      expect(allStates).toContain('GATHER_EDITING');

      // ACHIEVE states
      expect(allStates).toContain('ACHIEVE_TASK_DRAFTING');
      expect(allStates).toContain('ACHIEVE_TASK_EXECUTED');
      expect(allStates).toContain('ACHIEVE_COMPLETE');

      // PR states (both G and A variants)
      expect(allStates).toContain('PR_GATHERING_COMMENTS_G');
      expect(allStates).toContain('PR_GATHERING_COMMENTS_A');
      expect(allStates).toContain('PR_APPLIED_PENDING_ARCHIVE_G');
      expect(allStates).toContain('PR_APPLIED_PENDING_ARCHIVE_A');

      // ERROR states
      expect(allStates).toContain('ERROR_TASK_MISSING');
      expect(allStates).toContain('ERROR_PLAN_MISSING');
      expect(allStates).toContain('ERROR_CONTEXT_MISSING');
    });

    it('should work correctly for real F1 transition scenario', () => {
      // These are the actual states that should block finite based on state-machine.md
      const actualFiniteBlockedStates: StateName[] = [
        'ACHIEVE_TASK_EXECUTED',
        'GATHER_NEEDS_CONTEXT',
        'GATHER_EDITING_CONTEXT',
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_G',
        'PR_REVIEW_TASK_DRAFT_A',
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
        'ERROR_PLAN_MISSING',
        'ERROR_CONTEXT_MISSING',
        'ERROR_TASK_MISSING',
        'ERROR_TASK_RESULTS_MISSING',
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ];

      const f1AllowedStates = StateUtils.anyStateExcept(actualFiniteBlockedStates);

      // Verify the expected allowed states for F1
      expect(f1AllowedStates).toContain('GATHER_EDITING');
      expect(f1AllowedStates).toContain('ACHIEVE_TASK_DRAFTING');
      expect(f1AllowedStates).toContain('ACHIEVE_COMPLETE');
      expect(f1AllowedStates).toContain('ERROR_COMMENTS_MISSING_G');
      expect(f1AllowedStates).toContain('ERROR_COMMENTS_MISSING_A');

      // Verify none of the blocked states are included
      actualFiniteBlockedStates.forEach(blockedState => {
        expect(f1AllowedStates).not.toContain(blockedState);
      });

      // Should have 5 allowed states (26 total - 21 blocked)
      expect(f1AllowedStates).toHaveLength(5);
    });
  });
});
