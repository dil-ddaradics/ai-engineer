import {
  contextGatheringTransitions,
  gc1Transition,
  gc2aTransition,
  gc2bTransition,
  gc2cTransition,
} from './contextGatheringTransitions';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { MockFileSystem } from '../../testUtils';

describe('Context Gathering Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = {
      currentState: 'GATHER_NEEDS_CONTEXT',
    };
  });

  describe('GC1 - GATHER_NEEDS_CONTEXT + Accio -> GATHER_EDITING_CONTEXT', () => {
    it('should be defined with correct properties', () => {
      expect(gc1Transition).toBeDefined();
      expect(gc1Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gc1Transition.spell).toBe('Accio');
      expect(gc1Transition.toState).toBe('GATHER_EDITING_CONTEXT');
      expect(gc1Transition.execute).toBeDefined();
      expect(gc1Transition.condition).toBeUndefined(); // No condition for GC1
    });

    it('should create context.md file when executed', async () => {
      await gc1Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(true);
    });

    it('should create plan-guide.md file if it does not exist', async () => {
      // Ensure plan-guide.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_GUIDE_FILE)).toBe(false);

      await gc1Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_GUIDE_FILE)).toBe(true);
    });

    it('should create task-guide.md file if it does not exist', async () => {
      // Ensure task-guide.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.TASK_GUIDE_FILE)).toBe(false);

      await gc1Transition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.TASK_GUIDE_FILE)).toBe(true);
    });

    it('should not overwrite existing guide files', async () => {
      // Pre-populate guide files with custom content
      const customPlanGuide = 'Custom plan guide content';
      const customTaskGuide = 'Custom task guide content';
      await mockFileSystem.write(FILE_PATHS.PLAN_GUIDE_FILE, customPlanGuide);
      await mockFileSystem.write(FILE_PATHS.TASK_GUIDE_FILE, customTaskGuide);

      await gc1Transition.execute(mockContext, mockFileSystem);

      // Verify files were not overwritten
      expect(await mockFileSystem.read(FILE_PATHS.PLAN_GUIDE_FILE)).toBe(customPlanGuide);
      expect(await mockFileSystem.read(FILE_PATHS.TASK_GUIDE_FILE)).toBe(customTaskGuide);
    });

    it('should return formatted response', async () => {
      const result = await gc1Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_GC1');
      expect(result.message).toBe(expectedResponse);
    });

    it('should handle file system errors gracefully', async () => {
      // Create a mock file system that throws errors
      const errorFileSystem = new MockFileSystem();
      errorFileSystem.write = () => Promise.reject(new Error('Write failed'));

      await expect(gc1Transition.execute(mockContext, errorFileSystem)).rejects.toThrow(
        'Write failed'
      );
    });
  });

  describe('GC2a - GATHER_EDITING_CONTEXT + Accio -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(gc2aTransition).toBeDefined();
      expect(gc2aTransition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gc2aTransition.spell).toBe('Accio');
      expect(gc2aTransition.toState).toBe('GATHER_EDITING');
      expect(gc2aTransition.execute).toBeDefined();
      expect(gc2aTransition.condition).toBeDefined();
    });

    it('should return true condition when context.md exists with Atlassian URLs', async () => {
      // Create context.md with Atlassian URLs
      const contextContent = `
# Project Context

We need to integrate with our Atlassian instance:
https://company.atlassian.net/wiki/spaces/DEV/pages/123456/Requirements

Also reference this Jira ticket:
https://company.atlassian.net/browse/PROJ-123
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gc2aTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when context.md exists without Atlassian URLs', async () => {
      // Create context.md without Atlassian URLs
      const contextContent = `
# Project Context

This is a general project context without any Atlassian references.
We need to implement some features and fix bugs.
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gc2aTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when context.md does not exist', async () => {
      // Ensure context.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(false);

      const result = await gc2aTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should create plan.md file when executed', async () => {
      // Create context.md with Atlassian URLs
      const contextContent = 'Check https://company.atlassian.net/wiki/page/123';
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      await gc2aTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(true);
    });

    it('should return response with Atlassian URLs placeholder replaced', async () => {
      // Create context.md with Atlassian URLs
      const contextContent = `
Check this page: https://company.atlassian.net/wiki/page/123
And this Jira: https://company.atlassian.net/browse/PROJ-456
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gc2aTransition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // The response should contain the URLs in list format
      expect(result.message).toContain('- https://company.atlassian.net/wiki/page/123');
      expect(result.message).toContain('- https://company.atlassian.net/browse/PROJ-456');
    });

    it('should handle file system errors gracefully', async () => {
      // Create a mock file system that throws errors during plan file creation
      const errorFileSystem = new MockFileSystem();
      await errorFileSystem.write(FILE_PATHS.CONTEXT_FILE, 'https://company.atlassian.net/page');

      // Make write fail for plan file specifically
      const originalWrite = errorFileSystem.write.bind(errorFileSystem);
      errorFileSystem.write = (path: string, content: string) => {
        if (path === FILE_PATHS.PLAN_FILE) {
          return Promise.reject(new Error('Plan write failed'));
        }
        return originalWrite(path, content);
      };

      await expect(gc2aTransition.execute(mockContext, errorFileSystem)).rejects.toThrow(
        'Plan write failed'
      );
    });
  });

  describe('GC2b - GATHER_EDITING_CONTEXT + Accio -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(gc2bTransition).toBeDefined();
      expect(gc2bTransition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gc2bTransition.spell).toBe('Accio');
      expect(gc2bTransition.toState).toBe('GATHER_EDITING');
      expect(gc2bTransition.execute).toBeDefined();
      expect(gc2bTransition.condition).toBeDefined();
    });

    it('should return true condition when context.md exists without Atlassian URLs', async () => {
      // Create context.md without Atlassian URLs
      const contextContent = `
# Project Context

This is a general project context without any Atlassian references.
We need to implement some features and fix bugs.
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gc2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when context.md exists with Atlassian URLs', async () => {
      // Create context.md with Atlassian URLs
      const contextContent = `
# Project Context

We need to integrate with our Atlassian instance:
https://company.atlassian.net/wiki/spaces/DEV/pages/123456/Requirements

Also reference this Jira ticket:
https://company.atlassian.net/browse/PROJ-123
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gc2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when context.md does not exist', async () => {
      // Ensure context.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(false);

      const result = await gc2bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should create plan.md file when executed', async () => {
      // Create context.md without Atlassian URLs
      const contextContent = 'This is a project context without Atlassian URLs';
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      await gc2bTransition.execute(mockContext, mockFileSystem);

      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(true);
    });

    it('should return formatted response', async () => {
      const result = await gc2bTransition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_GC2-no-urls');
      expect(result.message).toBe(expectedResponse);
    });

    it('should handle file system errors gracefully', async () => {
      // Create a mock file system that throws errors during plan file creation
      const errorFileSystem = new MockFileSystem();

      // Make write fail for plan file specifically
      const originalWrite = errorFileSystem.write.bind(errorFileSystem);
      errorFileSystem.write = (path: string, content: string) => {
        if (path === FILE_PATHS.PLAN_FILE) {
          return Promise.reject(new Error('Plan write failed'));
        }
        return originalWrite(path, content);
      };

      await expect(gc2bTransition.execute(mockContext, errorFileSystem)).rejects.toThrow(
        'Plan write failed'
      );
    });
  });

  describe('GC2c - GATHER_EDITING_CONTEXT + Accio -> ERROR_CONTEXT_MISSING', () => {
    it('should be defined with correct properties', () => {
      expect(gc2cTransition).toBeDefined();
      expect(gc2cTransition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gc2cTransition.spell).toBe('Accio');
      expect(gc2cTransition.toState).toBe('ERROR_CONTEXT_MISSING');
      expect(gc2cTransition.execute).toBeDefined();
      expect(gc2cTransition.condition).toBeDefined();
    });

    it('should return true condition when context.md does not exist', async () => {
      // Ensure context.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(false);

      const result = await gc2cTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when context.md exists', async () => {
      // Create context.md
      const contextContent = 'Some context content';
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gc2cTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return formatted error response', async () => {
      const result = await gc2cTransition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_transitions_GC2b');
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

      await gc2cTransition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should handle condition check errors gracefully', async () => {
      // Create a mock file system that throws errors during exists check
      const errorFileSystem = new MockFileSystem();
      errorFileSystem.exists = () => Promise.reject(new Error('File check failed'));

      await expect(gc2cTransition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'File check failed'
      );
    });
  });

  it('should have transitions defined', () => {
    expect(contextGatheringTransitions).toBeDefined();
    expect(contextGatheringTransitions.length).toBeGreaterThan(0);
  });
});
