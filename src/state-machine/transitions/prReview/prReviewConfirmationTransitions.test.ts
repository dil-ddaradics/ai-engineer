import {
  c1Transition,
  c2Transition,
  c3aTransition,
  c3bTransition,
  c3cTransition,
  c3dTransition,
  prReviewConfirmationTransitions,
} from './prReviewConfirmationTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

describe('PR Review Confirmation Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'PR_CONFIRM_RESTART_COMMENTS_G' };
  });

  describe('C1 - PR_CONFIRM_RESTART_COMMENTS_[G/A] + Reparo -> PR_GATHERING_COMMENTS_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(c1Transition).toBeDefined();
      expect(c1Transition.fromState).toEqual([
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
      ]);
      expect(c1Transition.spell).toBe('Reparo');
      expect(c1Transition.toState).toBe('PR_GATHERING_COMMENTS_[G/A]');
      expect(c1Transition.condition).toBeUndefined();
    });

    it('should create comments.md file and return formatted response', async () => {
      const result = await c1Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('pr_confirm_C1'));
    });

    it('should work from both G and A states', async () => {
      const states = ['PR_CONFIRM_RESTART_COMMENTS_G', 'PR_CONFIRM_RESTART_COMMENTS_A'];

      for (const state of states) {
        mockFileSystem = new MockFileSystem(); // Reset file system
        mockContext = { currentState: state as any };

        const result = await c1Transition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
        expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      }
    });
  });

  describe('C2 - PR_CONFIRM_RESTART_TASK_[G/A] + Reparo -> PR_GATHERING_COMMENTS_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(c2Transition).toBeDefined();
      expect(c2Transition.fromState).toEqual([
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
      ]);
      expect(c2Transition.spell).toBe('Reparo');
      expect(c2Transition.toState).toBe('PR_GATHERING_COMMENTS_[G/A]');
      expect(c2Transition.condition).toBeUndefined();
    });

    it('should create comments.md file and return formatted response', async () => {
      const result = await c2Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('pr_confirm_C2'));
    });
  });

  describe('C3a - PR_CONFIRM_RESTART_COMMENTS_[G/A] + Accio -> PR_GATHERING_COMMENTS_[G/A] (exists)', () => {
    it('should be defined with correct properties', () => {
      expect(c3aTransition).toBeDefined();
      expect(c3aTransition.fromState).toEqual([
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
      ]);
      expect(c3aTransition.spell).toBe('Accio');
      expect(c3aTransition.toState).toBe('PR_GATHERING_COMMENTS_[G/A]');
      expect(c3aTransition.condition).toBeDefined();
    });

    it('should pass condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await c3aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md does not exist', async () => {
      const result = await c3aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response without creating files', async () => {
      const result = await c3aTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('pr_confirm_C3a'));
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);
    });
  });

  describe('C3b - PR_CONFIRM_RESTART_COMMENTS_[G/A] + Accio -> ERROR_COMMENTS_MISSING_[G/A] (missing)', () => {
    it('should be defined with correct properties', () => {
      expect(c3bTransition).toBeDefined();
      expect(c3bTransition.fromState).toEqual([
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
      ]);
      expect(c3bTransition.spell).toBe('Accio');
      expect(c3bTransition.toState).toBe('ERROR_COMMENTS_MISSING_[G/A]');
      expect(c3bTransition.condition).toBeDefined();
    });

    it('should pass condition when comments.md does not exist', async () => {
      const result = await c3bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await c3bTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response', async () => {
      const result = await c3bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('pr_confirm_C3b'));
    });
  });

  describe('C3c - PR_CONFIRM_RESTART_TASK_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A] (exists)', () => {
    it('should be defined with correct properties', () => {
      expect(c3cTransition).toBeDefined();
      expect(c3cTransition.fromState).toEqual([
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
      ]);
      expect(c3cTransition.spell).toBe('Accio');
      expect(c3cTransition.toState).toBe('PR_REVIEW_TASK_DRAFT_[G/A]');
      expect(c3cTransition.condition).toBeDefined();
    });

    it('should pass condition when review-task.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await c3cTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task.md does not exist', async () => {
      const result = await c3cTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response', async () => {
      const result = await c3cTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('pr_confirm_C3c'));
    });
  });

  describe('C3d - PR_CONFIRM_RESTART_TASK_[G/A] + Accio -> ERROR_REVIEW_TASK_MISSING_[G/A] (missing)', () => {
    it('should be defined with correct properties', () => {
      expect(c3dTransition).toBeDefined();
      expect(c3dTransition.fromState).toEqual([
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
      ]);
      expect(c3dTransition.spell).toBe('Accio');
      expect(c3dTransition.toState).toBe('ERROR_REVIEW_TASK_MISSING_[G/A]');
      expect(c3dTransition.condition).toBeDefined();
    });

    it('should pass condition when review-task.md does not exist', async () => {
      const result = await c3dTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await c3dTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response', async () => {
      const result = await c3dTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('pr_confirm_C3d'));
    });

    it('should work from both G and A task states', async () => {
      const states = ['PR_CONFIRM_RESTART_TASK_G', 'PR_CONFIRM_RESTART_TASK_A'];

      for (const state of states) {
        mockContext = { currentState: state as any };

        const result = await c3dTransition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
      }
    });
  });

  it('should have all transitions defined', () => {
    expect(prReviewConfirmationTransitions).toBeDefined();
    expect(prReviewConfirmationTransitions.length).toBe(6);
    expect(prReviewConfirmationTransitions).toContain(c1Transition);
    expect(prReviewConfirmationTransitions).toContain(c2Transition);
    expect(prReviewConfirmationTransitions).toContain(c3aTransition);
    expect(prReviewConfirmationTransitions).toContain(c3bTransition);
    expect(prReviewConfirmationTransitions).toContain(c3cTransition);
    expect(prReviewConfirmationTransitions).toContain(c3dTransition);
  });
});
