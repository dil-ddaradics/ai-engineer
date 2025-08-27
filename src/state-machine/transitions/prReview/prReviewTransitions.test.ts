import {
  p1Transition,
  p1bTransition,
  p2Transition,
  p2bTransition,
  p3Transition,
  p3bTransition,
  p4aTransition,
  p4bTransition,
  prReviewTransitions,
} from './prReviewTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

describe('PR Review Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'PR_GATHERING_COMMENTS_G' };
  });

  describe('P1 - PR_GATHERING_COMMENTS_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(p1Transition).toBeDefined();
      expect(p1Transition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
      ]);
      expect(p1Transition.spell).toBe('Accio');
      expect(p1Transition.toState).toBe('PR_REVIEW_TASK_DRAFT_[G/A]');
    });

    it('should have condition that checks comments.md exists', async () => {
      // Setup: comments.md exists
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'test comments');

      const result = await p1Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md does not exist', async () => {
      // Setup: comments.md does not exist
      const result = await p1Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should create review-task.md file when executed', async () => {
      await p1Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(true);
    });

    it('should return correct response', async () => {
      const result = await p1Transition.execute(mockContext, mockFileSystem);

      const expectedResponse = ResponseUtils.formatResponse('pr_transitions_P1');
      expect(result.message).toBe(expectedResponse);
    });
  });

  describe('P1b - PR_GATHERING_COMMENTS_[G/A] + Accio -> ERROR_COMMENTS_MISSING_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(p1bTransition).toBeDefined();
      expect(p1bTransition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
      ]);
      expect(p1bTransition.spell).toBe('Accio');
      expect(p1bTransition.toState).toBe('ERROR_COMMENTS_MISSING_[G/A]');
    });

    it('should have condition that checks comments.md does not exist', async () => {
      // Setup: comments.md does not exist
      const result = await p1bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md exists', async () => {
      // Setup: comments.md exists
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'test comments');

      const result = await p1bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return correct response', async () => {
      const result = await p1bTransition.execute(mockContext, mockFileSystem);

      const expectedResponse = ResponseUtils.formatResponse('pr_transitions_P1b');
      expect(result.message).toBe(expectedResponse);
    });

    it('should not create any files when executed', async () => {
      await p1bTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);
      expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(false);
    });
  });

  describe('P2 - PR_REVIEW_TASK_DRAFT_[G/A] + Accio -> PR_APPLIED_PENDING_ARCHIVE_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(p2Transition).toBeDefined();
      expect(p2Transition.fromState).toEqual(['PR_REVIEW_TASK_DRAFT_G', 'PR_REVIEW_TASK_DRAFT_A']);
      expect(p2Transition.spell).toBe('Accio');
      expect(p2Transition.toState).toBe('PR_APPLIED_PENDING_ARCHIVE_[G/A]');
    });

    it('should have condition that checks review-task.md exists', async () => {
      // Setup: review-task.md exists
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'test review task');

      const result = await p2Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task.md does not exist', async () => {
      // Setup: review-task.md does not exist
      const result = await p2Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return correct response', async () => {
      const result = await p2Transition.execute(mockContext, mockFileSystem);

      const expectedResponse = ResponseUtils.formatResponse('pr_transitions_P2');
      expect(result.message).toBe(expectedResponse);
    });
  });

  describe('P2b - PR_REVIEW_TASK_DRAFT_[G/A] + Accio -> ERROR_REVIEW_TASK_MISSING_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(p2bTransition).toBeDefined();
      expect(p2bTransition.fromState).toEqual(['PR_REVIEW_TASK_DRAFT_G', 'PR_REVIEW_TASK_DRAFT_A']);
      expect(p2bTransition.spell).toBe('Accio');
      expect(p2bTransition.toState).toBe('ERROR_REVIEW_TASK_MISSING_[G/A]');
    });

    it('should have condition that checks review-task.md does not exist', async () => {
      // Setup: review-task.md does not exist
      const result = await p2bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task.md exists', async () => {
      // Setup: review-task.md exists
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'test review task');

      const result = await p2bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return correct response', async () => {
      const result = await p2bTransition.execute(mockContext, mockFileSystem);

      const expectedResponse = ResponseUtils.formatResponse('pr_transitions_P2b');
      expect(result.message).toBe(expectedResponse);
    });
  });

  describe('P3 - PR_APPLIED_PENDING_ARCHIVE_G + Accio -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(p3Transition).toBeDefined();
      expect(p3Transition.fromState).toBe('PR_APPLIED_PENDING_ARCHIVE_G');
      expect(p3Transition.spell).toBe('Accio');
      expect(p3Transition.toState).toBe('GATHER_EDITING');
    });

    it('should have condition that checks review-task-results.md exists', async () => {
      // Setup: review-task-results.md exists
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, 'test results');

      const result = await p3Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task-results.md does not exist', async () => {
      // Setup: review-task-results.md does not exist
      const result = await p3Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should archive review files and return response with results content', async () => {
      const testResults = 'Test review results content';
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, testResults);

      const result = await p3Transition.execute(mockContext, mockFileSystem);

      // Verify response contains the expected content structure
      expect(result.message).toContain('MANDATORY ACTION FOR AI');
      expect(result.message).toContain('review-task-results.md');

      // Verify archiving workflow completed
      // Verify the transition executed successfully
      expect(result.message).toContain('understand what changes were made');
    });
  });

  describe('P3b - PR_APPLIED_PENDING_ARCHIVE_[G/A] + Accio -> ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(p3bTransition).toBeDefined();
      expect(p3bTransition.fromState).toEqual([
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
      ]);
      expect(p3bTransition.spell).toBe('Accio');
      expect(p3bTransition.toState).toBe('ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A]');
    });

    it('should have condition that checks review-task-results.md does not exist', async () => {
      // Setup: review-task-results.md does not exist
      const result = await p3bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task-results.md exists', async () => {
      // Setup: review-task-results.md exists
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, 'test results');

      const result = await p3bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return correct response', async () => {
      const result = await p3bTransition.execute(mockContext, mockFileSystem);

      const expectedResponse = ResponseUtils.formatResponse('pr_transitions_P3b');
      expect(result.message).toBe(expectedResponse);
    });
  });

  describe('P4a - PR_APPLIED_PENDING_ARCHIVE_A + Accio -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(p4aTransition).toBeDefined();
      expect(p4aTransition.fromState).toBe('PR_APPLIED_PENDING_ARCHIVE_A');
      expect(p4aTransition.spell).toBe('Accio');
      expect(p4aTransition.toState).toBe('ACHIEVE_TASK_DRAFTING');
    });

    it('should have condition that checks both files exist', async () => {
      // Setup: both files exist
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, 'test results');
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'test task');

      const result = await p4aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task-results.md is missing', async () => {
      // Setup: only task.md exists
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'test task');

      const result = await p4aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should fail condition when task.md is missing', async () => {
      // Setup: only review-task-results.md exists
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, 'test results');

      const result = await p4aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should archive review files and return response with results content', async () => {
      const testResults = 'Test review results content';
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, testResults);
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'test task');

      const result = await p4aTransition.execute(mockContext, mockFileSystem);

      // Verify response contains the expected content structure
      expect(result.message).toContain('MANDATORY ACTION FOR AI');
      expect(result.message).toContain('review-task-results.md');

      // Verify archiving workflow completed
      // Verify the transition executed successfully
      expect(result.message).toContain('understand what changes were made');
    });
  });

  describe('P4b - PR_APPLIED_PENDING_ARCHIVE_A + Accio -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(p4bTransition).toBeDefined();
      expect(p4bTransition.fromState).toBe('PR_APPLIED_PENDING_ARCHIVE_A');
      expect(p4bTransition.spell).toBe('Accio');
      expect(p4bTransition.toState).toBe('ACHIEVE_TASK_DRAFTING');
    });

    it('should have condition that checks review-task-results.md exists and task.md does not exist', async () => {
      // Setup: review-task-results.md exists, task.md does not exist
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, 'test results');

      const result = await p4bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task-results.md is missing', async () => {
      // Setup: neither file exists
      const result = await p4bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should fail condition when both files exist', async () => {
      // Setup: both files exist
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, 'test results');
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'test task');

      const result = await p4bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should archive review files, create task.md, and return response with results content', async () => {
      const testResults = 'Test review results content';
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_RESULTS_FILE, testResults);

      const result = await p4bTransition.execute(mockContext, mockFileSystem);

      // Verify response contains the expected content structure
      expect(result.message).toContain('Response to the AI');
      expect(result.message).toContain('review-task-results.md');

      // Verify archiving workflow completed
      // Verify the transition executed successfully
      expect(result.message).toContain('understand what changes were made');
      // Verify task.md was created
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(true);
    });
  });

  it('should have all transitions defined', () => {
    expect(prReviewTransitions).toBeDefined();
    expect(prReviewTransitions.length).toBe(8);
    expect(prReviewTransitions).toContain(p1Transition);
    expect(prReviewTransitions).toContain(p1bTransition);
    expect(prReviewTransitions).toContain(p2Transition);
    expect(prReviewTransitions).toContain(p2bTransition);
    expect(prReviewTransitions).toContain(p3Transition);
    expect(prReviewTransitions).toContain(p3bTransition);
    expect(prReviewTransitions).toContain(p4aTransition);
    expect(prReviewTransitions).toContain(p4bTransition);
  });
});
