import {
  v1Transition,
  v2aTransition,
  v2bTransition,
  revertoTransitions,
} from './revertoTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';

describe('Reverto Transitions (Exit PR Review)', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
  });

  describe('V1 - PR_GATHERING_COMMENTS_G, PR_REVIEW_TASK_DRAFT_G, PR_CONFIRM_RESTART_COMMENTS_G, PR_CONFIRM_RESTART_TASK_G, ERROR_COMMENTS_MISSING_G + Reverto -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(v1Transition).toBeDefined();
      expect(v1Transition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_G',
        'PR_REVIEW_TASK_DRAFT_G',
        'PR_CONFIRM_RESTART_COMMENTS_G',
        'PR_CONFIRM_RESTART_TASK_G',
        'ERROR_COMMENTS_MISSING_G',
      ]);
      expect(v1Transition.spell).toBe('Reverto');
      expect(v1Transition.toState).toBe('GATHER_EDITING');
      expect(v1Transition.condition).toBeUndefined();
    });

    it('should return response for PR_GATHERING_COMMENTS_G', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_G' };

      const result = await v1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('exited the PR review process');
      expect(result.message).toContain('plan editing');
      expect(result.message).toContain('**Accio**');
    });

    it('should return response for ERROR_COMMENTS_MISSING_G', async () => {
      mockContext = { currentState: 'ERROR_COMMENTS_MISSING_G' };

      const result = await v1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('exited the PR review process');
      expect(result.message).toContain('plan editing');
      expect(result.message).toContain('**Accio**');
    });

    it('should not perform any file operations', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_G' };

      const initialFiles = mockFileSystem.getFiles();
      const initialDirectories = mockFileSystem.getDirectories();

      await v1Transition.execute(mockContext, mockFileSystem);

      expect(mockFileSystem.getFiles()).toEqual(initialFiles);
      expect(mockFileSystem.getDirectories()).toEqual(initialDirectories);
    });
  });

  describe('V2a - PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A + Reverto -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(v2aTransition).toBeDefined();
      expect(v2aTransition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_A',
        'PR_CONFIRM_RESTART_COMMENTS_A',
        'PR_CONFIRM_RESTART_TASK_A',
        'ERROR_COMMENTS_MISSING_A',
      ]);
      expect(v2aTransition.spell).toBe('Reverto');
      expect(v2aTransition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(v2aTransition.condition).toBeDefined();
    });

    it('should return true when task.md exists and task-results.md does not exist', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      // task-results.md does not exist

      const conditionResult = await v2aTransition.condition!(mockContext, mockFileSystem);

      expect(conditionResult).toBe(true);
    });

    it('should return false when task.md does not exist', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      // Neither file exists

      const conditionResult = await v2aTransition.condition!(mockContext, mockFileSystem);

      expect(conditionResult).toBe(false);
    });

    it('should return false when both task.md and task-results.md exist', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');

      const conditionResult = await v2aTransition.condition!(mockContext, mockFileSystem);

      expect(conditionResult).toBe(false);
    });

    it('should return response when condition is met', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');

      const result = await v2aTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('exited the PR review process');
      expect(result.message).toContain('task drafting phase');
      expect(result.message).toContain('**Accio**');
    });
  });

  describe('V2b - PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A + Reverto -> ACHIEVE_TASK_EXECUTED', () => {
    it('should be defined with correct properties', () => {
      expect(v2bTransition).toBeDefined();
      expect(v2bTransition.fromState).toEqual([
        'PR_GATHERING_COMMENTS_A',
        'PR_REVIEW_TASK_DRAFT_A',
        'PR_CONFIRM_RESTART_COMMENTS_A',
        'PR_CONFIRM_RESTART_TASK_A',
        'ERROR_COMMENTS_MISSING_A',
      ]);
      expect(v2bTransition.spell).toBe('Reverto');
      expect(v2bTransition.toState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(v2bTransition.condition).toBeDefined();
    });

    it('should return true when both task.md and task-results.md exist', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');

      const conditionResult = await v2bTransition.condition!(mockContext, mockFileSystem);

      expect(conditionResult).toBe(true);
    });

    it('should return false when task.md does not exist', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');

      const conditionResult = await v2bTransition.condition!(mockContext, mockFileSystem);

      expect(conditionResult).toBe(false);
    });

    it('should return false when task-results.md does not exist', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');

      const conditionResult = await v2bTransition.condition!(mockContext, mockFileSystem);

      expect(conditionResult).toBe(false);
    });

    it('should return response when condition is met', async () => {
      mockContext = { currentState: 'PR_GATHERING_COMMENTS_A' };
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');

      const result = await v2bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('exited the PR review process');
      expect(result.message).toContain('task executed phase');
      expect(result.message).toContain('**Accio**');
    });
  });

  it('should have all transitions defined', () => {
    expect(revertoTransitions).toBeDefined();
    expect(revertoTransitions.length).toBe(3);
    expect(revertoTransitions).toContain(v1Transition);
    expect(revertoTransitions).toContain(v2aTransition);
    expect(revertoTransitions).toContain(v2bTransition);
  });
});
