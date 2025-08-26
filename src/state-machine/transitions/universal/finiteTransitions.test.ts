import { f1Transition, f2Transition, finiteTransitions } from './finiteTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext } from '../../types';
import { ResponseUtils, StateUtils } from '../../utils';

describe('Finite Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'GATHER_EDITING' };
  });

  describe('F1 - Any state except excluded states + Finite -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(f1Transition).toBeDefined();
      
      // F1 should use StateUtils.anyStateExcept to generate fromState
      const expectedFromStates = StateUtils.anyStateExcept([
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
      ]);
      
      expect(f1Transition.fromState).toEqual(expectedFromStates);
      expect(f1Transition.spell).toBe('Finite');
      expect(f1Transition.toState).toBe('GATHER_EDITING');
      expect(f1Transition.condition).toBeUndefined();
      
      // Should have 5 allowed states (26 total - 21 blocked)
      expect(expectedFromStates).toHaveLength(5);
      expect(expectedFromStates).toContain('GATHER_EDITING');
      expect(expectedFromStates).toContain('ACHIEVE_TASK_DRAFTING');
      expect(expectedFromStates).toContain('ACHIEVE_COMPLETE');
      expect(expectedFromStates).toContain('ERROR_COMMENTS_MISSING_G');
      expect(expectedFromStates).toContain('ERROR_COMMENTS_MISSING_A');
    });

    it('should return formatted response from finite_transitions_F1', async () => {
      const result = await f1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');

      // Verify the response uses the correct template
      const expectedResponse = ResponseUtils.formatResponse('finite_transitions_F1');
      expect(result.message).toBe(expectedResponse);
    });

    it('should work from ACHIEVE_TASK_DRAFTING state', async () => {
      mockContext = { currentState: 'ACHIEVE_TASK_DRAFTING' };

      const result = await f1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
    });

    it('should work from allowed error states', async () => {
      // Test with ERROR_COMMENTS_MISSING_G which should be allowed
      mockContext = { currentState: 'ERROR_COMMENTS_MISSING_G' };

      const result = await f1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
    });
  });

  describe('F2 - ACHIEVE_COMPLETE + Finite -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(f2Transition).toBeDefined();
      expect(f2Transition.fromState).toBe('ACHIEVE_COMPLETE');
      expect(f2Transition.spell).toBe('Finite');
      expect(f2Transition.toState).toBe('GATHER_EDITING');
      expect(f2Transition.condition).toBeUndefined();
    });

    it('should return formatted response from finite_transitions_F2', async () => {
      mockContext = { currentState: 'ACHIEVE_COMPLETE' };

      const result = await f2Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');

      // Verify the response uses the correct template
      const expectedResponse = ResponseUtils.formatResponse('finite_transitions_F2');
      expect(result.message).toBe(expectedResponse);
    });
  });

  it('should have transitions defined', () => {
    expect(finiteTransitions).toBeDefined();
    expect(finiteTransitions.length).toBe(2);
    expect(finiteTransitions).toContain(f1Transition);
    expect(finiteTransitions).toContain(f2Transition);
  });
});
