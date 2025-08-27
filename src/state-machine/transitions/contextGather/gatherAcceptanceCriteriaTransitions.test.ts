import {
  gatherAcceptanceCriteriaTransitions,
  g2Transition,
  g2bTransition,
  g3Transition,
  g4Transition,
  g5Transition,
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

  describe('G2b - GATHER_EDITING + Accio -> ERROR_PLAN_MISSING', () => {
    it('should be defined with correct properties', () => {
      expect(g2bTransition).toBeDefined();
      expect(g2bTransition.fromState).toBe('GATHER_EDITING');
      expect(g2bTransition.spell).toBe('Accio');
      expect(g2bTransition.toState).toBe('ERROR_PLAN_MISSING');
      expect(g2bTransition.execute).toBeDefined();
      expect(g2bTransition.condition).toBeDefined();
    });

    it('should return true condition when plan.md does not exist', async () => {
      // Ensure plan.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(false);

      const result = await g2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when plan.md exists', async () => {
      // Create plan.md
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Plan content');

      const result = await g2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return formatted error response', async () => {
      const result = await g2bTransition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_G2b');
      expect(result.message).toBe(expectedResponse);
    });

    it('should not perform any file operations', async () => {
      // Track file system operations
      const writeOperations: string[] = [];
      const originalWrite = mockFileSystem.write.bind(mockFileSystem);
      mockFileSystem.write = (path: string, content: string) => {
        writeOperations.push(path);
        return originalWrite(path, content);
      };

      await g2bTransition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });
  });

  describe('G3 - GATHER_EDITING + Accio -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(g3Transition).toBeDefined();
      expect(g3Transition.fromState).toBe('GATHER_EDITING');
      expect(g3Transition.spell).toBe('Accio');
      expect(g3Transition.toState).toBe('GATHER_EDITING');
      expect(g3Transition.execute).toBeDefined();
      expect(g3Transition.condition).toBeDefined();
    });

    it('should return true condition when plan.md exists but has no pending acceptance criteria', async () => {
      // Create plan.md with only completed acceptance criteria
      const planContent = `
# Project Plan

## Acceptance Criteria

- [x] Set up project structure
- [x] Configure build system
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await g3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return true condition when plan.md exists but has no acceptance criteria at all', async () => {
      // Create plan.md without acceptance criteria
      const planContent = `
# Project Plan

This is a project plan without any acceptance criteria.
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await g3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when plan.md does not exist', async () => {
      // Ensure plan.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(false);

      const result = await g3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when plan.md has pending acceptance criteria', async () => {
      // Create plan.md with pending acceptance criteria
      const planContent = `
# Project Plan

## Acceptance Criteria

- [ ] Implement user authentication
- [x] Set up project structure
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await g3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return formatted response', async () => {
      const result = await g3Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_G3');
      expect(result.message).toBe(expectedResponse);
    });

    it('should not perform any file operations', async () => {
      // Track file system operations
      const writeOperations: string[] = [];
      const originalWrite = mockFileSystem.write.bind(mockFileSystem);
      mockFileSystem.write = (path: string, content: string) => {
        writeOperations.push(path);
        return originalWrite(path, content);
      };

      await g3Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });
  });

  describe('G4 - GATHER_EDITING + Accio -> ACHIEVE_TASK_DRAFTING', () => {
    it('should be defined with correct properties', () => {
      expect(g4Transition).toBeDefined();
      expect(g4Transition.fromState).toBe('GATHER_EDITING');
      expect(g4Transition.spell).toBe('Accio');
      expect(g4Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(g4Transition.execute).toBeDefined();
      expect(g4Transition.condition).toBeDefined();
    });

    it('should return true condition when both task.md and plan.md exist', async () => {
      // Create both plan.md and task.md
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Plan content');
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'Task content');

      const result = await g4Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when task.md does not exist', async () => {
      // Create only plan.md
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Plan content');
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(false);

      const result = await g4Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when plan.md does not exist', async () => {
      // Create only task.md
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, 'Task content');
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(false);

      const result = await g4Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when neither file exists', async () => {
      // Ensure neither file exists
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(false);
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_FILE)).toBe(false);

      const result = await g4Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should read task content and include it in response', async () => {
      const taskContent = `---
task_name: 'implement-auth'
---

# Task: Implement Authentication

## Objective
Set up user authentication system

## Steps
1. Install authentication library
2. Configure routes
3. Add login/logout functionality`;

      await mockFileSystem.write(FILE_PATHS.TASK_FILE, taskContent);

      const result = await g4Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(result.message).toContain('existing task document');
    });

    it('should return formatted response with task content placeholder replaced', async () => {
      const taskContent = 'Sample task content';
      await mockFileSystem.write(FILE_PATHS.TASK_FILE, taskContent);

      const result = await g4Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response indicates task document was found
      expect(result.message).toContain('existing task document');
    });

    it('should handle missing task file gracefully by using empty content', async () => {
      // Don't create task file, but execute should handle this gracefully
      const result = await g4Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      // Should not fail, but should handle empty content
    });
  });

  describe('G5 - GATHER_EDITING + Reparo -> PR_GATHERING_COMMENTS_G', () => {
    it('should be defined with correct properties', () => {
      expect(g5Transition).toBeDefined();
      expect(g5Transition.fromState).toBe('GATHER_EDITING');
      expect(g5Transition.spell).toBe('Reparo');
      expect(g5Transition.toState).toBe('PR_GATHERING_COMMENTS_G');
      expect(g5Transition.execute).toBeDefined();
      expect(g5Transition.condition).toBeDefined();
    });

    it('should return true condition when neither comments.md nor review-task.md exist', async () => {
      // Ensure neither file exists
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);
      expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(false);

      const result = await g5Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when comments.md exists', async () => {
      // Create comments.md
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'Comments content');
      expect(await mockFileSystem.exists(FILE_PATHS.REVIEW_TASK_FILE)).toBe(false);

      const result = await g5Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when review-task.md exists', async () => {
      // Create review-task.md
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'Review task content');
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);

      const result = await g5Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when both files exist', async () => {
      // Create both files
      await mockFileSystem.write(FILE_PATHS.COMMENTS_FILE, 'Comments content');
      await mockFileSystem.write(FILE_PATHS.REVIEW_TASK_FILE, 'Review task content');

      const result = await g5Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should create comments.md file when executed', async () => {
      // Ensure comments.md doesn't exist initially
      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(false);

      await g5Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.COMMENTS_FILE)).toBe(true);
    });

    it('should return formatted response', async () => {
      const result = await g5Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_G5');
      expect(result.message).toBe(expectedResponse);
    });

    it('should handle file system errors gracefully', async () => {
      // Create a mock file system that throws errors during comments file creation
      const errorFileSystem = new MockFileSystem();

      // Make write fail for comments file specifically
      const originalWrite = errorFileSystem.write.bind(errorFileSystem);
      errorFileSystem.write = (path: string, content: string) => {
        if (path === FILE_PATHS.COMMENTS_FILE) {
          return Promise.reject(new Error('Comments write failed'));
        }
        return originalWrite(path, content);
      };

      await expect(g5Transition.execute(mockContext, errorFileSystem)).rejects.toThrow(
        'Comments write failed'
      );
    });
  });

  it('should have transitions defined', () => {
    expect(gatherAcceptanceCriteriaTransitions).toBeDefined();
    expect(gatherAcceptanceCriteriaTransitions.length).toBe(5);
  });
});
