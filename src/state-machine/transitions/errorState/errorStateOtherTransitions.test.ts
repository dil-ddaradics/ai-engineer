import {
  er1Transition,
  er2Transition,
  er3aTransition,
  er3bTransition,
  er4Transition,
  er5Transition,
  er6Transition,
  er7aTransition,
  er7bTransition,
  er8Transition,
  er9Transition,
  er10Transition,
  er11Transition,
  er12Transition,
  errorStateOtherTransitions,
} from './errorStateOtherTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext } from '../../types';
import { ResponseUtils, TransitionUtils } from '../../utils';

describe('Error State Other Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'ERROR_PLAN_MISSING' };
  });

  describe('ER1 - ERROR_PLAN_MISSING + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er1Transition).toBeDefined();
      expect(er1Transition.fromState).toBe('ERROR_PLAN_MISSING');
      expect(er1Transition.spell).toBe('Finite');
      expect(er1Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er1Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er1Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER1'));
    });
  });

  describe('ER2 - ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er2Transition).toBeDefined();
      expect(er2Transition.fromState).toEqual([
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ]);
      expect(er2Transition.spell).toBe('Finite');
      expect(er2Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er2Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er2Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER2'));
    });
  });

  describe('ER3a - ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Reparo -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er3aTransition).toBeDefined();
      expect(er3aTransition.fromState).toEqual([
        'ERROR_PLAN_MISSING',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ]);
      expect(er3aTransition.spell).toBe('Reparo');
      expect(er3aTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er3aTransition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er3aTransition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER3a'));
    });
  });

  describe('ER3b - PR_APPLIED_PENDING_ARCHIVE_[G/A] + Reparo -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er3bTransition).toBeDefined();
      expect(er3bTransition.fromState).toEqual([
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
      ]);
      expect(er3bTransition.spell).toBe('Reparo');
      expect(er3bTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er3bTransition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er3bTransition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER3b'));
    });
  });

  describe('ER4 - Multiple error states + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er4Transition).toBeDefined();
      expect(er4Transition.fromState).toEqual([
        'ERROR_TASK_MISSING',
        'ERROR_TASK_RESULTS_MISSING',
        'ERROR_PLAN_MISSING',
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ]);
      expect(er4Transition.spell).toBe('Reverto');
      expect(er4Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er4Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er4Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER4'));
    });
  });

  describe('ER5 - ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er5Transition).toBeDefined();
      expect(er5Transition.fromState).toEqual(['ERROR_TASK_MISSING', 'ERROR_TASK_RESULTS_MISSING']);
      expect(er5Transition.spell).toBe('Finite');
      expect(er5Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er5Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er5Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER5'));
    });
  });

  describe('ER6 - Task and comments missing states + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er6Transition).toBeDefined();
      expect(er6Transition.fromState).toEqual([
        'ERROR_TASK_MISSING',
        'ERROR_TASK_RESULTS_MISSING',
        'ERROR_COMMENTS_MISSING_G',
        'ERROR_COMMENTS_MISSING_A',
      ]);
      expect(er6Transition.spell).toBe('Expecto');
      expect(er6Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er6Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er6Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER6'));
    });
  });

  describe('ER7a - ERROR_PLAN_MISSING + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er7aTransition).toBeDefined();
      expect(er7aTransition.fromState).toBe('ERROR_PLAN_MISSING');
      expect(er7aTransition.spell).toBe('Expecto');
      expect(er7aTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er7aTransition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er7aTransition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER7a'));
    });
  });

  describe('ER7b - PR_APPLIED_PENDING_ARCHIVE_[G/A] + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er7bTransition).toBeDefined();
      expect(er7bTransition.fromState).toEqual([
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
      ]);
      expect(er7bTransition.spell).toBe('Expecto');
      expect(er7bTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er7bTransition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er7bTransition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER7b'));
    });
  });

  describe('ER8 - Review task missing states + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er8Transition).toBeDefined();
      expect(er8Transition.fromState).toEqual([
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ]);
      expect(er8Transition.spell).toBe('Expecto');
      expect(er8Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er8Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er8Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER8'));
    });
  });

  describe('ER9 - ERROR_CONTEXT_MISSING + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er9Transition).toBeDefined();
      expect(er9Transition.fromState).toBe('ERROR_CONTEXT_MISSING');
      expect(er9Transition.spell).toBe('Finite');
      expect(er9Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er9Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er9Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER9'));
    });
  });

  describe('ER10 - ERROR_CONTEXT_MISSING + Reparo -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er10Transition).toBeDefined();
      expect(er10Transition.fromState).toBe('ERROR_CONTEXT_MISSING');
      expect(er10Transition.spell).toBe('Reparo');
      expect(er10Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er10Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er10Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER10'));
    });
  });

  describe('ER11 - ERROR_CONTEXT_MISSING + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er11Transition).toBeDefined();
      expect(er11Transition.fromState).toBe('ERROR_CONTEXT_MISSING');
      expect(er11Transition.spell).toBe('Reverto');
      expect(er11Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er11Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er11Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER11'));
    });
  });

  describe('ER12 - ERROR_CONTEXT_MISSING + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(er12Transition).toBeDefined();
      expect(er12Transition.fromState).toBe('ERROR_CONTEXT_MISSING');
      expect(er12Transition.spell).toBe('Expecto');
      expect(er12Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(er12Transition.condition).toBeUndefined();
    });

    it('should return blocked response', async () => {
      const result = await er12Transition.execute(mockContext, mockFileSystem);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_other_ER12'));
    });
  });

  describe('errorStateOtherTransitions array', () => {
    it('should have all 14 transitions defined', () => {
      expect(errorStateOtherTransitions).toBeDefined();
      expect(errorStateOtherTransitions.length).toBe(14);
      expect(errorStateOtherTransitions).toContain(er1Transition);
      expect(errorStateOtherTransitions).toContain(er2Transition);
      expect(errorStateOtherTransitions).toContain(er3aTransition);
      expect(errorStateOtherTransitions).toContain(er3bTransition);
      expect(errorStateOtherTransitions).toContain(er4Transition);
      expect(errorStateOtherTransitions).toContain(er5Transition);
      expect(errorStateOtherTransitions).toContain(er6Transition);
      expect(errorStateOtherTransitions).toContain(er7aTransition);
      expect(errorStateOtherTransitions).toContain(er7bTransition);
      expect(errorStateOtherTransitions).toContain(er8Transition);
      expect(errorStateOtherTransitions).toContain(er9Transition);
      expect(errorStateOtherTransitions).toContain(er10Transition);
      expect(errorStateOtherTransitions).toContain(er11Transition);
      expect(errorStateOtherTransitions).toContain(er12Transition);
    });

    it('should have transitions with unique combinations of fromState and spell', () => {
      const combinations = new Set();

      errorStateOtherTransitions.forEach(transition => {
        const fromStates = Array.isArray(transition.fromState)
          ? transition.fromState
          : [transition.fromState];

        fromStates.forEach(state => {
          const combo = `${state}-${transition.spell}`;
          expect(combinations.has(combo)).toBe(false);
          combinations.add(combo);
        });
      });
    });

    it('should all be blocked transitions (stay in same state)', () => {
      errorStateOtherTransitions.forEach(transition => {
        // For blocked transitions, the toState should indicate blocking behavior
        // Either same as fromState (for single states) or use [G/A] notation
        expect(transition.toState).toBeDefined();
        expect(typeof transition.toState).toBe('string');
      });
    });

    it('should all use ResponseUtils.formatResponse pattern', async () => {
      for (const transition of errorStateOtherTransitions) {
        const result = await transition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
        expect(typeof result.message).toBe('string');
      }
    });
  });
});
