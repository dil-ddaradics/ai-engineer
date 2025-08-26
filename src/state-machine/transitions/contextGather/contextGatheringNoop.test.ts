import {
  contextGatheringNoop,
  gcn1Transition,
  gcn2Transition,
  gcn3Transition,
  gcn3bTransition,
} from './contextGatheringNoop';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { MockFileSystem } from '../../testUtils';

describe('Context Gathering No-op Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
  });

  describe('GCN1 - GATHER_EDITING_CONTEXT + Finite -> Same state', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_EDITING_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcn1Transition).toBeDefined();
      expect(gcn1Transition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcn1Transition.spell).toBe('Finite');
      expect(gcn1Transition.toState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcn1Transition.execute).toBeDefined();
      expect(gcn1Transition.condition).toBeUndefined(); // No condition for GCN1
    });

    it('should return formatted no-op response', async () => {
      const result = await gcn1Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_noop_GCN1');
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

      await gcn1Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (no-op behavior)', () => {
      expect(gcn1Transition.fromState).toBe(gcn1Transition.toState);
    });
  });

  describe('GCN2 - GATHER_NEEDS_CONTEXT + Finite -> Same state', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_NEEDS_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcn2Transition).toBeDefined();
      expect(gcn2Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcn2Transition.spell).toBe('Finite');
      expect(gcn2Transition.toState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcn2Transition.execute).toBeDefined();
      expect(gcn2Transition.condition).toBeUndefined(); // No condition for GCN2
    });

    it('should return formatted no-op response', async () => {
      const result = await gcn2Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_noop_GCN2');
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

      await gcn2Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (no-op behavior)', () => {
      expect(gcn2Transition.fromState).toBe(gcn2Transition.toState);
    });
  });

  describe('GCN3 - GATHER_NEEDS_CONTEXT + Expecto -> Same state', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_NEEDS_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcn3Transition).toBeDefined();
      expect(gcn3Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcn3Transition.spell).toBe('Expecto');
      expect(gcn3Transition.toState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcn3Transition.execute).toBeDefined();
      expect(gcn3Transition.condition).toBeDefined(); // GCN3 has a condition
    });

    it('should return true condition when context.md exists with no Atlassian URLs', async () => {
      // Create context.md without Atlassian URLs
      const contextContent = `
# Project Context

This is a general project context without any Atlassian references.
We need to implement some features and fix bugs.
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gcn3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when context.md does not exist', async () => {
      // Ensure context.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(false);

      const result = await gcn3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
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

      const result = await gcn3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return formatted no-op response', async () => {
      const result = await gcn3Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_noop_GCN3');
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

      await gcn3Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (no-op behavior)', () => {
      expect(gcn3Transition.fromState).toBe(gcn3Transition.toState);
    });

    it('should handle condition check errors gracefully', async () => {
      // Create a mock file system that throws errors during exists check
      const errorFileSystem = new MockFileSystem();
      errorFileSystem.exists = () => Promise.reject(new Error('File check failed'));

      await expect(gcn3Transition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'File check failed'
      );
    });
  });

  describe('GCN3b - GATHER_EDITING_CONTEXT + Expecto -> Same state', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_EDITING_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcn3bTransition).toBeDefined();
      expect(gcn3bTransition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcn3bTransition.spell).toBe('Expecto');
      expect(gcn3bTransition.toState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcn3bTransition.execute).toBeDefined();
      expect(gcn3bTransition.condition).toBeDefined(); // GCN3b has a condition
    });

    it('should return true condition when context.md exists with no Atlassian URLs', async () => {
      // Create context.md without Atlassian URLs
      const contextContent = `
# Project Context

This is a general project context without any Atlassian references.
We need to implement some features and fix bugs.
      `;
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

      const result = await gcn3bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when context.md does not exist', async () => {
      // Ensure context.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.CONTEXT_FILE)).toBe(false);

      const result = await gcn3bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
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

      const result = await gcn3bTransition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return formatted no-op response', async () => {
      const result = await gcn3bTransition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Should use the same response as GCN3 since they're the same logical no-op
      const expectedResponse = ResponseUtils.formatResponse('gather_noop_GCN3');
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

      await gcn3bTransition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (no-op behavior)', () => {
      expect(gcn3bTransition.fromState).toBe(gcn3bTransition.toState);
    });

    it('should handle parsing errors gracefully', async () => {
      // Create context.md file
      await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, 'Some content');

      // Mock PlanUtils to throw an error
      const errorFileSystem = new MockFileSystem();
      await errorFileSystem.write(FILE_PATHS.CONTEXT_FILE, 'Some content');
      errorFileSystem.read = () => Promise.reject(new Error('Parse failed'));

      await expect(gcn3bTransition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'Parse failed'
      );
    });
  });

  describe('No-op Transitions Collection', () => {
    it('should have all transitions defined', () => {
      expect(contextGatheringNoop).toBeDefined();
      expect(contextGatheringNoop.length).toBe(4);
    });

    it('should contain all expected transitions', () => {
      expect(contextGatheringNoop).toContain(gcn1Transition);
      expect(contextGatheringNoop).toContain(gcn2Transition);
      expect(contextGatheringNoop).toContain(gcn3Transition);
      expect(contextGatheringNoop).toContain(gcn3bTransition);
    });

    it('should have all transitions stay in the same state', () => {
      contextGatheringNoop.forEach(transition => {
        expect(transition.fromState).toBe(transition.toState);
      });
    });

    it('should have GCN1 and GCN2 without conditions, GCN3 variants with conditions', () => {
      expect(gcn1Transition.condition).toBeUndefined();
      expect(gcn2Transition.condition).toBeUndefined();
      expect(gcn3Transition.condition).toBeDefined();
      expect(gcn3bTransition.condition).toBeDefined();
    });
  });
});
