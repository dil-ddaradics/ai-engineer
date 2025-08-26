import { p1Transition, prReviewTransitions } from './prReviewTransitions';
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

  it('should have transitions defined', () => {
    expect(prReviewTransitions).toBeDefined();
    expect(prReviewTransitions.length).toBeGreaterThan(0);
    expect(prReviewTransitions).toContain(p1Transition);
  });
});
