import {
  gatherAcceptanceCriteriaTransitions,
  g2Transition,
} from './gatherAcceptanceCriteriaTransitions';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { MockFileSystem } from '../../testUtils';

describe('Gather Acceptance Criteria Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = {
      currentState: 'GATHER_EDITING',
    };
  });

  describe('G2 - GATHER_EDITING + Accio -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(g2Transition).toBeDefined();
      expect(g2Transition.fromState).toBe('GATHER_EDITING');
      expect(g2Transition.spell).toBe('Accio');
      expect(g2Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(g2Transition.execute).toBeDefined();
      expect(g2Transition.condition).toBeDefined();
    });

    it('should return true condition when plan.md exists with acceptance criteria and task.md does not exist', async () => {
      // Create plan.md with acceptance criteria
      const planContent = `
# Project Plan

## Acceptance Criteria

- [ ] Implement user authentication
- [ ] Add database integration
- [x] Set up project structure
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      // Ensure task.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(false);

      const result = await g2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when plan.md does not exist', async () => {
      // Ensure plan.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(false);

      const result = await g2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when task.md already exists', async () => {
      // Create plan.md with acceptance criteria
      const planContent = `
# Project Plan

## Acceptance Criteria

- [ ] Implement user authentication
- [ ] Add database integration
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      // Create task.md
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'Task content');

      const result = await g2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when plan.md has no pending acceptance criteria', async () => {
      // Create plan.md with only completed acceptance criteria
      const planContent = `
# Project Plan

## Acceptance Criteria

- [x] Set up project structure
- [x] Configure build system
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      // Ensure task.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(false);

      const result = await g2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when plan.md has no acceptance criteria at all', async () => {
      // Create plan.md without acceptance criteria
      const planContent = `
# Project Plan

This is a project plan without any acceptance criteria.
Just some general information about the project.
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      // Ensure task.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(false);

      const result = await g2Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should create task.md file when executed', async () => {
      // Ensure task.md doesn't exist initially
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(false);

      await g2Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(true);
    });

    it('should return formatted response', async () => {
      const result = await g2Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_G2');
      expect(result.message).toBe(expectedResponse);
    });

    it('should handle file system errors gracefully', async () => {
      // Create a mock file system that throws errors during task file creation
      const errorFileSystem = new MockFileSystem();

      // Make write fail for task file specifically
      const originalWrite = errorFileSystem.write.bind(errorFileSystem);
      errorFileSystem.write = (path: string, content: string) => {
        if (path === FILE_PATHS.TASK_FILE) {
          return Promise.reject(new Error('Task write failed'));
        }
        return originalWrite(path, content);
      };

      await expect(g2Transition.execute(mockContext, errorFileSystem)).rejects.toThrow(
        'Task write failed'
      );
    });

    it('should handle condition check errors gracefully', async () => {
      // Create a mock file system that throws errors during exists check
      const errorFileSystem = new MockFileSystem();
      errorFileSystem.exists = () => Promise.reject(new Error('File check failed'));

      await expect(g2Transition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'File check failed'
      );
    });

    it('should handle parsing errors gracefully', async () => {
      // Create plan.md with content that will cause parsing issues
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content');

      // Mock PlanUtils to throw an error
      const errorFileSystem = new MockFileSystem();
      await errorFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content');
      errorFileSystem.read = () => Promise.reject(new Error('Parse failed'));

      await expect(g2Transition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'Parse failed'
      );
    });
  });

  it('should have transitions defined', () => {
    expect(gatherAcceptanceCriteriaTransitions).toBeDefined();
    expect(gatherAcceptanceCriteriaTransitions.length).toBeGreaterThan(0);
  });
});
