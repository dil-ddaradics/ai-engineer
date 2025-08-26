import {
  a1Transition,
  a1bTransition,
  a2Transition,
  a2bTransition,
  a3Transition,
  a4Transition,
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

  describe('A2 - ACHIEVE_TASK_EXECUTED + Accio -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(a2Transition).toBeDefined();
      expect(a2Transition.fromState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(a2Transition.spell).toBe('Accio');
      expect(a2Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(a2Transition.condition).toBeDefined();
      expect(a2Transition.execute).toBeDefined();
    });

    it('should have condition that returns true when all required files exist', async () => {
      // Setup: Create all required files
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should have condition that returns false when task.md is missing', async () => {
      // Setup: Only create task-results.md and plan.md
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should have condition that returns false when task-results.md is missing', async () => {
      // Setup: Only create task.md and plan.md
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should have condition that returns false when plan.md is missing', async () => {
      // Setup: Only create task.md and task-results.md
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'task content');
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');

      const result = await a2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should execute archiving workflow and create new task', async () => {
      // Setup: Create required files with frontmatter for task archiving
      const taskContent = `---
task_name: 'test-task'
---
# Test Task`;
      const resultsContent = 'Task completed successfully';

      await mockFileSystem.write(FILE_PATHS.TASK_FILE, taskContent);
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, resultsContent);
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a2Transition.execute(mockContext, mockFileSystem);

      // Verify files were archived (original files deleted)
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(true); // New template created
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_RESULTS_FILE)).toBe(false); // Original deleted

      // Verify response contains results content
      expect(result.message).toContain(resultsContent);
    });

    it('should return response with TASK_RESULTS_PLACEHOLDER replaced', async () => {
      // Setup files
      const taskContent = `---
task_name: 'test-task'
---
# Test Task`;
      const resultsContent = 'Custom results content';

      await mockFileSystem.write(FILE_PATHS.TASK_FILE, taskContent);
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, resultsContent);
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'plan content');

      const result = await a2Transition.execute(mockContext, mockFileSystem);

      // Check that the placeholder was replaced with the actual results content
      expect(result.message).toContain(resultsContent);
      expect(result.message).not.toContain('[TASK_RESULTS_PLACEHOLDER]');
    });
  });

  describe('A2b - ACHIEVE_TASK_EXECUTED + Accio -> ERROR_TASK_RESULTS_MISSING', () => {
    it('should be defined with correct properties', () => {
      expect(a2bTransition).toBeDefined();
      expect(a2bTransition.fromState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(a2bTransition.spell).toBe('Accio');
      expect(a2bTransition.toState).toBe('ERROR_TASK_RESULTS_MISSING');
      expect(a2bTransition.condition).toBeDefined();
      expect(a2bTransition.execute).toBeDefined();
    });

    it('should have condition that returns true when task-results.md is missing', async () => {
      // Setup: Don't create task-results.md
      const result = await a2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should have condition that returns false when task-results.md exists', async () => {
      // Setup: Create task-results.md
      await mockFileSystem.write(FILE_PATHS.TASK_RESULTS_FILE, 'results content');

      const result = await a2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should execute and return correct response', async () => {
      const result = await a2bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_transitions_A2b'));
    });

    it('should not perform any file operations during execution', async () => {
      const initialFileCount = (await mockFileSystem.listFiles('')).length;

      await a2bTransition.execute(mockContext, mockFileSystem);

      const finalFileCount = (await mockFileSystem.listFiles('')).length;
      expect(finalFileCount).toBe(initialFileCount);
    });
  });

  describe('A3 - ACHIEVE_TASK_DRAFTING + Accio -> ACHIEVE_COMPLETE', () => {
    it('should be defined with correct properties', () => {
      expect(a3Transition).toBeDefined();
      expect(a3Transition.fromState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(a3Transition.spell).toBe('Accio');
      expect(a3Transition.toState).toBe('ACHIEVE_COMPLETE');
      expect(a3Transition.condition).toBeDefined();
      expect(a3Transition.execute).toBeDefined();
    });

    it('should have condition that returns false when plan.md is missing', async () => {
      // Setup: Don't create plan.md
      const result = await a3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should have condition that returns true when all acceptance criteria are completed', async () => {
      // Setup: Create plan.md with all completed acceptance criteria
      const planContent = `# Plan

## Acceptance Criteria
- [x] Completed task 1
- [x] Completed task 2
- [x] Completed task 3
`;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await a3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should have condition that returns false when there are pending acceptance criteria', async () => {
      // Setup: Create plan.md with pending acceptance criteria
      const planContent = `# Plan

## Acceptance Criteria
- [x] Completed task 1
- [ ] Pending task 2
- [x] Completed task 3
`;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await a3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should have condition that returns false when there are no acceptance criteria', async () => {
      // Setup: Create plan.md with no acceptance criteria
      const planContent = `# Plan

## Description
This is a plan without acceptance criteria.
`;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await a3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should execute and return correct response', async () => {
      const result = await a3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_transitions_A3'));
    });

    it('should not perform any file operations during execution', async () => {
      const initialFileCount = (await mockFileSystem.listFiles('')).length;

      await a3Transition.execute(mockContext, mockFileSystem);

      const finalFileCount = (await mockFileSystem.listFiles('')).length;
      expect(finalFileCount).toBe(initialFileCount);
    });
  });

  describe('A4 - ACHIEVE_COMPLETE + Accio -> ACHIEVE_COMPLETE', () => {
    const mockCompleteContext: StateContext = { currentState: 'ACHIEVE_COMPLETE' };

    it('should be defined with correct properties', () => {
      expect(a4Transition).toBeDefined();
      expect(a4Transition.fromState).toBe('ACHIEVE_COMPLETE');
      expect(a4Transition.spell).toBe('Accio');
      expect(a4Transition.toState).toBe('ACHIEVE_COMPLETE');
      expect(a4Transition.condition).toBeDefined();
      expect(a4Transition.execute).toBeDefined();
    });

    it('should have condition that always returns true (no-op transition)', async () => {
      // This is a no-op transition that always applies
      const result = await a4Transition.condition!(mockCompleteContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should execute and return correct response', async () => {
      const result = await a4Transition.execute(mockCompleteContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_transitions_A4'));
    });

    it('should not perform any file operations during execution', async () => {
      const initialFileCount = (await mockFileSystem.listFiles('')).length;

      await a4Transition.execute(mockCompleteContext, mockFileSystem);

      const finalFileCount = (await mockFileSystem.listFiles('')).length;
      expect(finalFileCount).toBe(initialFileCount);
    });
  });

  it('should have transitions defined', () => {
    expect(achieveAcceptanceCriteriaTransitions).toBeDefined();
    expect(achieveAcceptanceCriteriaTransitions.length).toBeGreaterThan(0);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a1Transition);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a1bTransition);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a2Transition);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a2bTransition);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a3Transition);
    expect(achieveAcceptanceCriteriaTransitions).toContain(a4Transition);
  });
});
