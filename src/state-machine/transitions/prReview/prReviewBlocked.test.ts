import {
  pb1Transition,
  pb2Transition,
  pb2bTransition,
  pb2dTransition,
  pb3Transition,
  pb4Transition,
  pb5Transition,
  pb6Transition,
  prReviewBlocked,
} from './prReviewBlocked';
import { MockFileSystem } from '../../testUtils';
import { StateContext } from '../../types';
import { TransitionUtils } from '../../utils';

describe('PR Review Phase Blocked Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
  });

  describe('PB1 - PR_APPLIED_PENDING_ARCHIVE_[G/A] + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb1Transition).toBeDefined();
      expect(pb1Transition.fromState).toEqual([
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
      ]);
      expect(pb1Transition.spell).toBe('Reverto');
      expect(pb1Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb1Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_APPLIED_PENDING_ARCHIVE_G', async () => {
      mockContext = { currentState: 'PR_APPLIED_PENDING_ARCHIVE_G' };

      const result = await pb1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('properly archive your current review results first');
      expect(result.message).toContain('**Accio**');
    });

    it('should not perform any file operations', async () => {
      mockContext = { currentState: 'PR_APPLIED_PENDING_ARCHIVE_G' };

      const initialFiles = mockFileSystem.getFiles();
      const initialDirectories = mockFileSystem.getDirectories();

      await pb1Transition.execute(mockContext, mockFileSystem);

      expect(mockFileSystem.getFiles()).toEqual(initialFiles);
      expect(mockFileSystem.getDirectories()).toEqual(initialDirectories);
    });
  });

  describe('PB2 - PR_GATHERING_COMMENTS_[G/A] + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb2Transition).toBeDefined();
      expect(pb2Transition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
      ]);
      expect(pb2Transition.spell).toBe('Expecto');
      expect(pb2Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb2Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_GATHERING_COMMENTS_A', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };

      const result = await pb2Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('only available in GATHER states');
      expect(result.message).toContain('**Accio**');
    });
  });

  describe('PB2b - PR_REVIEW_TASK_DRAFT_[G/A] + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb2bTransition).toBeDefined();
      expect(pb2bTransition.fromState).toEqual([
        'PR_REVIEW_TASK_DRAFT_G',
        'PR_REVIEW_TASK_DRAFT_A',
      ]);
      expect(pb2bTransition.spell).toBe('Expecto');
      expect(pb2bTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb2bTransition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_REVIEW_TASK_DRAFT_G', async () => {
      mockContext = { currentState: 'PR_REVIEW_TASK_DRAFT_G' };

      const result = await pb2bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('only available in GATHER states');
      expect(result.message).toContain('**Accio**');
    });
  });

  describe('PB2d - PR_APPLIED_PENDING_ARCHIVE_[G/A] + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb2dTransition).toBeDefined();
      expect(pb2dTransition.fromState).toEqual([
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
      ]);
      expect(pb2dTransition.spell).toBe('Expecto');
      expect(pb2dTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb2dTransition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_APPLIED_PENDING_ARCHIVE_A', async () => {
      mockContext = { currentState: 'PR_APPLIED_PENDING_ARCHIVE_A' };

      const result = await pb2dTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('only available in GATHER states');
      expect(result.message).toContain('**Accio**');
    });
  });

  describe('PB3 - PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb3Transition).toBeDefined();
      expect(pb3Transition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_G',
        'PR_REVIEW_TASK_DRAFT_A',
      ]);
      expect(pb3Transition.spell).toBe('Finite');
      expect(pb3Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb3Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_GATHERING_COMMENTS_G', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_G' };

      const result = await pb3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('complete or exit the PR review flow');
      expect(result.message).toContain('**Accio**');
    });

    it('should return blocked response for PR_REVIEW_TASK_DRAFT_A', async () => {
      mockContext = { currentState: 'PR_REVIEW_TASK_DRAFT_A' };

      const result = await pb3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('complete or exit the PR review flow');
      expect(result.message).toContain('**Accio**');
    });
  });

  describe('PB4 - PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] + Reparo -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb4Transition).toBeDefined();
      expect(pb4Transition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_G',
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_G',
        'PR_REVIEW_TASK_DRAFT_A',
      ]);
      expect(pb4Transition.spell).toBe('Reparo');
      expect(pb4Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb4Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_GATHERING_COMMENTS_A', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };

      const result = await pb4Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('complete the current PR review process');
      expect(result.message).toContain('**Accio**');
    });
  });

  describe('PB5 - PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb5Transition).toBeDefined();
      expect(pb5Transition.fromState).toEqual([
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
      ]);
      expect(pb5Transition.spell).toBe('Finite');
      expect(pb5Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb5Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_CONFIRM_RESTART_COMMENTS_G', async () => {
      mockContext = { currentState: 'PR_CONFIRM_RESTART_COMMENTS_G' };

      const result = await pb5Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('address the confirmation prompt first');
      expect(result.message).toContain('**Reparo**');
    });
  });

  describe('PB6 - PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(pb6Transition).toBeDefined();
      expect(pb6Transition.fromState).toEqual([
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_COMMENTS_A',
        'PR_CONFIRM_RESTART_TASK_G',
        'PR_CONFIRM_RESTART_TASK_A',
      ]);
      expect(pb6Transition.spell).toBe('Expecto');
      expect(pb6Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(pb6Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_CONFIRM_RESTART_TASK_A', async () => {
      mockContext = { currentState: 'PR_CONFIRM_RESTART_TASK_A' };

      const result = await pb6Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('only available in GATHER states');
      expect(result.message).toContain('**Reparo**');
    });
  });

  it('should have all transitions defined', () => {
    expect(prReviewBlocked).toBeDefined();
    expect(prReviewBlocked.length).toBe(8);
    expect(prReviewBlocked).toContain(pb1Transition);
    expect(prReviewBlocked).toContain(pb2Transition);
    expect(prReviewBlocked).toContain(pb2bTransition);
    expect(prReviewBlocked).toContain(pb2dTransition);
    expect(prReviewBlocked).toContain(pb3Transition);
    expect(prReviewBlocked).toContain(pb4Transition);
    expect(prReviewBlocked).toContain(pb5Transition);
    expect(prReviewBlocked).toContain(pb6Transition);
  });
});
