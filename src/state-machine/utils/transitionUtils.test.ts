import { TransitionUtils } from './transitionUtils';
import { Transition, StateName } from '../types';

describe('TransitionUtils', () => {
  describe('matchesFromState', () => {
    it('should match single state transitions', () => {
      const transition: Transition = {
        fromState: 'GATHER_EDITING',
        spell: 'Accio',
        toState: 'ACHIEVE_TASK_DRAFTING',
        execute: async () => ({ message: 'test' }),
      };

      expect(TransitionUtils.matchesFromState(transition, 'GATHER_EDITING')).toBe(true);
      expect(TransitionUtils.matchesFromState(transition, 'ACHIEVE_TASK_DRAFTING')).toBe(false);
    });

    it('should match array state transitions', () => {
      const transition: Transition = {
        fromState: ['ACHIEVE_TASK_DRAFTING', 'ACHIEVE_TASK_EXECUTED', 'ACHIEVE_COMPLETE'],
        spell: 'Reverto',
        toState: TransitionUtils.STAY_IN_SAME_STATE,
        execute: async () => ({ message: 'blocked' }),
      };

      expect(TransitionUtils.matchesFromState(transition, 'ACHIEVE_TASK_DRAFTING')).toBe(true);
      expect(TransitionUtils.matchesFromState(transition, 'ACHIEVE_TASK_EXECUTED')).toBe(true);
      expect(TransitionUtils.matchesFromState(transition, 'ACHIEVE_COMPLETE')).toBe(true);
      expect(TransitionUtils.matchesFromState(transition, 'GATHER_EDITING')).toBe(false);
    });
  });

  describe('resolveToState', () => {
    it('should return same state for STAY_IN_SAME_STATE token', () => {
      expect(
        TransitionUtils.resolveToState('ACHIEVE_TASK_DRAFTING', TransitionUtils.STAY_IN_SAME_STATE)
      ).toBe('ACHIEVE_TASK_DRAFTING');
      expect(
        TransitionUtils.resolveToState(
          'PR_GATHERING_COMMENTS_G',
          TransitionUtils.STAY_IN_SAME_STATE
        )
      ).toBe('PR_GATHERING_COMMENTS_G');
    });

    it('should handle [G/A] placeholder replacement', () => {
      const result = TransitionUtils.resolveToState(
        'PR_GATHERING_COMMENTS_G',
        'PR_REVIEW_TASK_DRAFT_[G/A]' as StateName
      );
      expect(result).toBe('PR_REVIEW_TASK_DRAFT_G');

      const result2 = TransitionUtils.resolveToState(
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_[G/A]' as StateName
      );
      expect(result2).toBe('PR_REVIEW_TASK_DRAFT_A');
    });

    it('should return state as-is for regular transitions', () => {
      expect(TransitionUtils.resolveToState('GATHER_EDITING', 'ACHIEVE_TASK_DRAFTING')).toBe(
        'ACHIEVE_TASK_DRAFTING'
      );
      expect(TransitionUtils.resolveToState('ACHIEVE_TASK_EXECUTED', 'ACHIEVE_TASK_DRAFTING')).toBe(
        'ACHIEVE_TASK_DRAFTING'
      );
    });

    it('should not automatically add G/A suffixes for regular transitions', () => {
      // This test ensures we don't automatically add _G or _A suffixes
      expect(
        TransitionUtils.resolveToState('PR_GATHERING_COMMENTS_G', 'ACHIEVE_TASK_DRAFTING')
      ).toBe('ACHIEVE_TASK_DRAFTING');
      expect(
        TransitionUtils.resolveToState('PR_GATHERING_COMMENTS_A', 'ACHIEVE_TASK_DRAFTING')
      ).toBe('ACHIEVE_TASK_DRAFTING');
    });
  });

  describe('STAY_IN_SAME_STATE', () => {
    it('should be defined as a special token', () => {
      expect(TransitionUtils.STAY_IN_SAME_STATE).toBe('__STAY_IN_SAME_STATE__');
    });
  });
});
