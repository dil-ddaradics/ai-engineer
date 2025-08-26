import {
  r1Transition,
  r2Transition,
  r3Transition,
  r4Transition,
  r5aTransition,
  r5bTransition,
  r6aTransition,
  r7aTransition,
  r8aTransition,
  r9Transition,
  errorStateRecoveryTransitions,
} from './errorStateRecoveryTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

describe('Error State Recovery Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'ERROR_TASK_MISSING' };
  });

  describe('R1 - ERROR_TASK_MISSING + Accio -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(r1Transition).toBeDefined();
      expect(r1Transition.fromState).toBe('ERROR_TASK_MISSING');
      expect(r1Transition.spell).toBe('Accio');
      expect(r1Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(r1Transition.condition).toBeUndefined();
    });

    it('should create task.md file and return formatted response', async () => {
      const result = await r1Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R1'));
    });
  });

  describe('R2 - ERROR_TASK_RESULTS_MISSING + Accio -> ACHIEVE_TASK_DRAFTING (exists)', () => {
    it('should be defined with correct properties', () => {
      expect(r2Transition).toBeDefined();
      expect(r2Transition.fromState).toBe('ERROR_TASK_RESULTS_MISSING');
      expect(r2Transition.spell).toBe('Accio');
      expect(r2Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(r2Transition.condition).toBeDefined();
    });

    it('should pass condition when task-results.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'existing results');

      const result = await r2Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when task-results.md does not exist', async () => {
      const result = await r2Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should archive files, create task.md, and return formatted response with placeholders', async () => {
      const taskResultsContent = 'existing results content';
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, taskResultsContent);
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'name: test-task\ndescription: test');

      const result = await r2Transition.execute(mockContext, mockFileSystem);

      // Verify task.md is created
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(true);

      // Verify response contains placeholder replacements
      expect(result.message).toBeDefined();
      expect(typeof result.message).toBe('string');
      // The response should have placeholders replaced, but we can't predict the exact archive path
    });
  });

  describe('R3 - ERROR_TASK_RESULTS_MISSING + Accio -> ACHIEVE_TASK_DRAFTING (missing)', () => {
    it('should be defined with correct properties', () => {
      expect(r3Transition).toBeDefined();
      expect(r3Transition.fromState).toBe('ERROR_TASK_RESULTS_MISSING');
      expect(r3Transition.spell).toBe('Accio');
      expect(r3Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(r3Transition.condition).toBeDefined();
    });

    it('should pass condition when task-results.md does not exist', async () => {
      const result = await r3Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when task-results.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'existing results');

      const result = await r3Transition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should archive incomplete task, create task.md, and return formatted response', async () => {
      // Create an incomplete task (task.md exists but task-results.md doesn't)
      await mockFileSystem.write(
        FILE_PATHS.TASK_FILE,
        'name: incomplete-task\ndescription: incomplete'
      );

      const result = await r3Transition.execute(mockContext, mockFileSystem);

      // Verify new task.md is created
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(true);

      // Verify response
      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R3'));
    });
  });

  describe('R4 - ERROR_PLAN_MISSING + Accio -> GATHER_NEEDS_CONTEXT', () => {
    it('should be defined with correct properties', () => {
      expect(r4Transition).toBeDefined();
      expect(r4Transition.fromState).toBe('ERROR_PLAN_MISSING');
      expect(r4Transition.spell).toBe('Accio');
      expect(r4Transition.toState).toBe('GATHER_NEEDS_CONTEXT');
      expect(r4Transition.condition).toBeUndefined();
    });

    it('should return formatted response without creating files', async () => {
      const result = await r4Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R4'));
    });
  });

  describe('R5a - ERROR_COMMENTS_MISSING_G + Accio -> PR_GATHERING_COMMENTS_G', () => {
    it('should be defined with correct properties', () => {
      expect(r5aTransition).toBeDefined();
      expect(r5aTransition.fromState).toBe('ERROR_COMMENTS_MISSING_G');
      expect(r5aTransition.spell).toBe('Accio');
      expect(r5aTransition.toState).toBe('PR_GATHERING_COMMENTS_G');
      expect(r5aTransition.condition).toBeUndefined();
    });

    it('should create comments.md file and return formatted response', async () => {
      const result = await r5aTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R5a'));
    });
  });

  describe('R5b - ERROR_COMMENTS_MISSING_A + Accio -> PR_GATHERING_COMMENTS_A', () => {
    it('should be defined with correct properties', () => {
      expect(r5bTransition).toBeDefined();
      expect(r5bTransition.fromState).toBe('ERROR_COMMENTS_MISSING_A');
      expect(r5bTransition.spell).toBe('Accio');
      expect(r5bTransition.toState).toBe('PR_GATHERING_COMMENTS_A');
      expect(r5bTransition.condition).toBeUndefined();
    });

    it('should create comments.md file and return formatted response', async () => {
      const result = await r5bTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R5b'));
    });
  });

  describe('R6a - ERROR_REVIEW_TASK_MISSING_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A] (exists)', () => {
    it('should be defined with correct properties', () => {
      expect(r6aTransition).toBeDefined();
      expect(r6aTransition.fromState).toEqual([
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
      ]);
      expect(r6aTransition.spell).toBe('Accio');
      expect(r6aTransition.toState).toBe('PR_REVIEW_TASK_DRAFT_[G/A]');
      expect(r6aTransition.condition).toBeDefined();
    });

    it('should pass condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await r6aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md does not exist', async () => {
      const result = await r6aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should create review-task.md file and return formatted response', async () => {
      const result = await r6aTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R6a'));
    });

    it('should work from both G and A states', async () => {
      const states = ['ERROR_REVIEW_TASK_MISSING_G', 'ERROR_REVIEW_TASK_MISSING_A'];

      for (const state of states) {
        mockFileSystem = new MockFileSystem(); // Reset file system
        mockContext = { currentState: state as any };

        const result = await r6aTransition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
        expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(true);
      }
    });
  });

  describe('R7a - ERROR_REVIEW_TASK_MISSING_[G/A] + Accio -> ERROR_COMMENTS_MISSING_[G/A] (missing)', () => {
    it('should be defined with correct properties', () => {
      expect(r7aTransition).toBeDefined();
      expect(r7aTransition.fromState).toEqual([
        'ERROR_REVIEW_TASK_MISSING_G',
        'ERROR_REVIEW_TASK_MISSING_A',
      ]);
      expect(r7aTransition.spell).toBe('Accio');
      expect(r7aTransition.toState).toBe('ERROR_COMMENTS_MISSING_[G/A]');
      expect(r7aTransition.condition).toBeDefined();
    });

    it('should pass condition when comments.md does not exist', async () => {
      const result = await r7aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when comments.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'existing comments');

      const result = await r7aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response without creating files', async () => {
      const result = await r7aTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R7a'));
    });
  });

  describe('R8a - ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] + Accio -> PR_REVIEW_TASK_DRAFT_[G/A]', () => {
    it('should be defined with correct properties', () => {
      expect(r8aTransition).toBeDefined();
      expect(r8aTransition.fromState).toEqual([
        'ERROR_REVIEW_TASK_RESULTS_MISSING_G',
        'ERROR_REVIEW_TASK_RESULTS_MISSING_A',
      ]);
      expect(r8aTransition.spell).toBe('Accio');
      expect(r8aTransition.toState).toBe('PR_REVIEW_TASK_DRAFT_[G/A]');
      expect(r8aTransition.condition).toBeDefined();
    });

    it('should pass condition when review-task.md exists', async () => {
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'existing review task');

      const result = await r8aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(true);
    });

    it('should fail condition when review-task.md does not exist', async () => {
      const result = await r8aTransition.condition!(mockContext, mockFileSystem);
      expect(result).toBe(false);
    });

    it('should return formatted response without creating files', async () => {
      const result = await r8aTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R8a'));
    });
  });

  describe('R9 - ERROR_CONTEXT_MISSING + Accio -> GATHER_EDITING_CONTEXT', () => {
    it('should be defined with correct properties', () => {
      expect(r9Transition).toBeDefined();
      expect(r9Transition.fromState).toBe('ERROR_CONTEXT_MISSING');
      expect(r9Transition.spell).toBe('Accio');
      expect(r9Transition.toState).toBe('GATHER_EDITING_CONTEXT');
      expect(r9Transition.condition).toBeUndefined();
    });

    it('should create context.md file and return formatted response', async () => {
      const result = await r9Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(true);
      expect(result.message).toBe(ResponseUtils.formatResponse('error_recovery_R9'));
    });
  });

  it('should have all transitions defined', () => {
    expect(errorStateRecoveryTransitions).toBeDefined();
    expect(errorStateRecoveryTransitions.length).toBe(10);
    expect(errorStateRecoveryTransitions).toContain(r1Transition);
    expect(errorStateRecoveryTransitions).toContain(r2Transition);
    expect(errorStateRecoveryTransitions).toContain(r3Transition);
    expect(errorStateRecoveryTransitions).toContain(r4Transition);
    expect(errorStateRecoveryTransitions).toContain(r5aTransition);
    expect(errorStateRecoveryTransitions).toContain(r5bTransition);
    expect(errorStateRecoveryTransitions).toContain(r6aTransition);
    expect(errorStateRecoveryTransitions).toContain(r7aTransition);
    expect(errorStateRecoveryTransitions).toContain(r8aTransition);
    expect(errorStateRecoveryTransitions).toContain(r9Transition);
  });
});
