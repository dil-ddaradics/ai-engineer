import {
  a5aTransition,
  a5bTransition,
  pr1Transition,
  pr2Transition,
  pr3Transition,
  pr4Transition,
  startingPrReviewTransitions,
} from './startingPrReviewTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

describe('Starting PR Review Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'ACHIEVE_TASK_DRAFTING' };
  });

  describe('A5a - ACHIEVE states + Reparo -> PR_GATHERING_COMMENTS_A', () => {
    it('should be defined with correct properties', () => {
      expect(a5aTransition).toBeDefined();
      expect(a5aTransition.fromState).toEqual([
        'ACHIEVE_TASK_DRAFTING',
        'ACHIEVE_TASK_EXECUTED',
        'ACHIEVE_COMPLETE',
        'ERROR_TASK_MISSING',
        'ERROR_TASK_RESULTS_MISSING',
      ]);
      expect(a5aTransition.spell).toBe('Reparo');
      expect(a5aTransition.toState).toBe('PR_GATHERING_COMMENTS_A');
      expect(a5aTransition.condition).toBeDefined();
    });

    it('should pass condition when neither comments.md nor review-task.md exist', async () => {
      // Ensure files don't exist
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);
      expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(false);

      const result = await a5aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md exists', async () => {
      // Create comments file
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await a5aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should fail condition when review-task.md exists', async () => {
      // Create review-task file
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await a5aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should fail condition when both files exist', async () => {
      // Create both files
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await a5aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should create comments.md file and return formatted response', async () => {
      const result = await a5aTransition.execute(mockContext, mockFileSystem);

      // Verify file was created
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);

      // Verify response
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');

      // Verify the response uses the correct template
      const expectedResponse = ResponseUtils.formatResponse('reparo_transitions_A5a');
      expect(result.message).toBe(expectedResponse);
    });

    it('should work from all supported ACHIEVE states', async () => {
      const supportedStates = [
        'ACHIEVE_TASK_DRAFTING',
        'ACHIEVE_TASK_EXECUTED',
        'ACHIEVE_COMPLETE',
        'ERROR_TASK_MISSING',
        'ERROR_TASK_RESULTS_MISSING',
      ];

      for (const state of supportedStates) {
        mockFileSystem = new MockFileSystem(); // Reset file system
        mockContext = { currentState: state as any };

        const result = await a5aTransition.execute(mockContext, mockFileSystem);

        expect(result.message).toBeDefined();
        expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      }
    });
  });

  describe('A5b - ERROR states with [G/A] + Reparo -> PR_GATHERING_COMMENTS_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(a5bTransition).toBeDefined();
      expect(a5bTransition.fromState).toEqual([
        'ERROR_COMMENTS_MISSING_G',
        'ERROR_COMMENTS_MISSING_A',
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
      ]);
      expect(a5bTransition.spell).toBe('Reparo');
      expect(a5bTransition.toState).toBe('PR_GATHERING_COMMENTS_[G/A]');
      expect(a5bTransition.condition).toBeDefined();
    });

    it('should pass condition when neither comments.md nor review-task.md exist', async () => {
      const result = await a5bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await a5bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should create comments.md file and return formatted response', async () => {
      const result = await a5bTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('reparo_transitions_A5b'));
    });
  });

  describe('PR1 - GATHER_EDITING + Reparo -> PR_CONFIRM_RESTART_COMMENTS_G', () => {
    it('should be defined with correct properties', () => {
      expect(pr1Transition).toBeDefined();
      expect(pr1Transition.fromState).toBe('GATHER_EDITING');
      expect(pr1Transition.spell).toBe('Reparo');
      expect(pr1Transition.toState).toBe('PR_CONFIRM_RESTART_COMMENTS_G');
      expect(pr1Transition.condition).toBeDefined();
    });

    it('should pass condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await pr1Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md does not exist', async () => {
      const result = await pr1Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response without creating files', async () => {
      const result = await pr1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('reparo_transitions_PR1'));
      // Should not create any new files
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);
    });
  });

  describe('PR2 - ACHIEVE states + Reparo -> PR_CONFIRM_RESTART_COMMENTS_A', () => {
    it('should be defined with correct properties', () => {
      expect(pr2Transition).toBeDefined();
      expect(pr2Transition.fromState).toEqual([
        'ACHIEVE_TASK_DRAFTING',
        'ACHIEVE_TASK_EXECUTED',
        'ACHIEVE_COMPLETE',
      ]);
      expect(pr2Transition.spell).toBe('Reparo');
      expect(pr2Transition.toState).toBe('PR_CONFIRM_RESTART_COMMENTS_A');
      expect(pr2Transition.condition).toBeDefined();
    });

    it('should pass condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await pr2Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should return formatted response', async () => {
      const result = await pr2Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('reparo_transitions_PR2'));
    });
  });

  describe('PR3 - GATHER_EDITING + Reparo -> PR_CONFIRM_RESTART_TASK_G', () => {
    it('should be defined with correct properties', () => {
      expect(pr3Transition).toBeDefined();
      expect(pr3Transition.fromState).toBe('GATHER_EDITING');
      expect(pr3Transition.spell).toBe('Reparo');
      expect(pr3Transition.toState).toBe('PR_CONFIRM_RESTART_TASK_G');
      expect(pr3Transition.condition).toBeDefined();
    });

    it('should pass condition when review-task.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await pr3Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task.md does not exist', async () => {
      const result = await pr3Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response', async () => {
      const result = await pr3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('reparo_transitions_PR3'));
    });
  });

  describe('PR4 - ACHIEVE states + Reparo -> PR_CONFIRM_RESTART_TASK_A', () => {
    it('should be defined with correct properties', () => {
      expect(pr4Transition).toBeDefined();
      expect(pr4Transition.fromState).toEqual([
        'ACHIEVE_TASK_DRAFTING',
        'ACHIEVE_TASK_EXECUTED',
        'ACHIEVE_COMPLETE',
      ]);
      expect(pr4Transition.spell).toBe('Reparo');
      expect(pr4Transition.toState).toBe('PR_CONFIRM_RESTART_TASK_A');
      expect(pr4Transition.condition).toBeDefined();
    });

    it('should pass condition when review-task.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await pr4Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should return formatted response', async () => {
      const result = await pr4Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('reparo_transitions_PR4'));
    });

    it('should work from all supported ACHIEVE states', async () => {
      const supportedStates = [
        'ACHIEVE_TASK_DRAFTING',
        'ACHIEVE_TASK_EXECUTED',
        'ACHIEVE_COMPLETE',
      ];

      for (const state of supportedStates) {
        mockContext = { currentState: state as any };

        const result = await pr4Transition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
      }
    });
  });

  it('should have all transitions defined', () => {
    expect(startingPrReviewTransitions).toBeDefined();
    expect(startingPrReviewTransitions.length).toBe(6);
    expect(startingPrReviewTransitions).toContain(a5aTransition);
    expect(startingPrReviewTransitions).toContain(a5bTransition);
    expect(startingPrReviewTransitions).toContain(pr1Transition);
    expect(startingPrReviewTransitions).toContain(pr2Transition);
    expect(startingPrReviewTransitions).toContain(pr3Transition);
    expect(startingPrReviewTransitions).toContain(pr4Transition);
  });
});
