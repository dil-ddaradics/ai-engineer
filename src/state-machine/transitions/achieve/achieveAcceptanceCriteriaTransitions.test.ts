import {
  a1Transition,
  a1bTransition,
  achieveAcceptanceCriteriaTransitions,
} from './achieveAcceptanceCriteriaTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

describe('Achieve Acceptance Criteria Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'ACHIEVE_TASK_DRAFTING' };
  });

  describe('A1 - ACHIEVE_TASK_DRAFTING + Accio -> ACHIEVE_TASK_EXECUTED', () => {
    it('should be defined with correct properties', () => {
      expect(a1Transition).toBeDefined();
      expect(a1Transition.fromState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(a1Transition.spell).toBe('Accio');
      expect(a1Transition.toState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(a1Transition.condition).toBeDefined();
      expect(a1Transition.execute).toBeDefined();
    });

    it('should have condition that returns true when both task.md and plan.md exist', async () => {
      // Setup: Create both required files
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a1Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should have condition that returns false when task.md is missing', async () => {
      // Setup: Only create plan.md
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a1Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should have condition that returns false when plan.md is missing', async () => {
      // Setup: Only create task.md
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');

      const result = await a1Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should have condition that returns false when both files are missing', async () => {
      // Setup: No files created

      const result = await a1Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should execute and return correct response', async () => {
      const result = await a1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_transitions_A1'));
    });

    it('should not perform any file operations during execution', async () => {
      const initialFileCount = (await mockFileSystem.listFiles('')).length;

      await a1Transition.execute(mockContext, mockFileSystem);

      const finalFileCount = (await mockFileSystem.listFiles('')).length;
      expect(finalFileCount).toBe(initialFileCount);
    });
  });

  describe('A1b - ACHIEVE_TASK_DRAFTING + Accio -> ERROR_TASK_MISSING', () => {
    it('should be defined with correct properties', () => {
      expect(a1bTransition).toBeDefined();
      expect(a1bTransition.fromState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(a1bTransition.spell).toBe('Accio');
      expect(a1bTransition.toState).toBe('ERROR_TASK_MISSING');
      expect(a1bTransition.condition).toBeDefined();
      expect(a1bTransition.execute).toBeDefined();
    });

    it('should have condition that returns true when task.md is missing', async () => {
      // Setup: Don't create task.md
      const result = await a1bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should have condition that returns false when task.md exists', async () => {
      // Setup: Create task.md
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');

      const result = await a1bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should execute and return correct response', async () => {
      const result = await a1bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_transitions_A1b'));
    });

    it('should not perform any file operations during execution', async () => {
      const initialFileCount = (await mockFileSystem.listFiles('')).length;

      await a1bTransition.execute(mockContext, mockFileSystem);

      const finalFileCount = (await mockFileSystem.listFiles('')).length;
      expect(finalFileCount).toBe(initialFileCount);
    });
  });

  it('should have transitions defined', () => {
    expect(achieveAcceptanceCriteriaTransitions).toBeDefined();
    expect(achieveAcceptanceCriteriaTransitions.length).toBeGreaterThan(0);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a1Transition);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a1bTransition);
  });
});
