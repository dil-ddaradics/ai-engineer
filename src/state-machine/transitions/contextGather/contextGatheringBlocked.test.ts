import {
  contextGatheringBlocked,
  gcb1Transition,
  gcb1bTransition,
  gcb2Transition,
  gcb3Transition,
  gcb4Transition,
} from './contextGatheringBlocked';
import { StateContext } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { MockFileSystem } from '../../testUtils';

describe('Context Gathering Blocked Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
  });

  describe('GCB1 - GATHER_NEEDS_CONTEXT + Reverto -> [BLOCKED]', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_NEEDS_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcb1Transition).toBeDefined();
      expect(gcb1Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcb1Transition.spell).toBe('Reverto');
      expect(gcb1Transition.toState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcb1Transition.execute).toBeDefined();
      expect(gcb1Transition.condition).toBeUndefined(); // No condition for blocked transitions
    });

    it('should return formatted blocked response', async () => {
      const result = await gcb1Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_blocked_GCB1');
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

      await gcb1Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (blocked behavior)', () => {
      expect(gcb1Transition.fromState).toBe(gcb1Transition.toState);
    });
  });

  describe('GCB1b - GATHER_EDITING_CONTEXT + Reverto -> [BLOCKED]', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_EDITING_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcb1bTransition).toBeDefined();
      expect(gcb1bTransition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcb1bTransition.spell).toBe('Reverto');
      expect(gcb1bTransition.toState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcb1bTransition.execute).toBeDefined();
      expect(gcb1bTransition.condition).toBeUndefined();
    });

    it('should return formatted blocked response', async () => {
      const result = await gcb1bTransition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Should use the same response as GCB1 since they're the same logical block
      const expectedResponse = ResponseUtils.formatResponse('gather_blocked_GCB1');
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

      await gcb1bTransition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (blocked behavior)', () => {
      expect(gcb1bTransition.fromState).toBe(gcb1bTransition.toState);
    });
  });

  describe('GCB2 - GATHER_NEEDS_CONTEXT + Expecto -> [BLOCKED]', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_NEEDS_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcb2Transition).toBeDefined();
      expect(gcb2Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcb2Transition.spell).toBe('Expecto');
      expect(gcb2Transition.toState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcb2Transition.execute).toBeDefined();
      expect(gcb2Transition.condition).toBeUndefined();
    });

    it('should return formatted blocked response', async () => {
      const result = await gcb2Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_blocked_GCB2');
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

      await gcb2Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (blocked behavior)', () => {
      expect(gcb2Transition.fromState).toBe(gcb2Transition.toState);
    });
  });

  describe('GCB3 - GATHER_NEEDS_CONTEXT + Reparo -> [BLOCKED]', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_NEEDS_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcb3Transition).toBeDefined();
      expect(gcb3Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcb3Transition.spell).toBe('Reparo');
      expect(gcb3Transition.toState).toBe('GATHER_NEEDS_CONTEXT');
      expect(gcb3Transition.execute).toBeDefined();
      expect(gcb3Transition.condition).toBeUndefined();
    });

    it('should return formatted blocked response', async () => {
      const result = await gcb3Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_blocked_GCB3');
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

      await gcb3Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (blocked behavior)', () => {
      expect(gcb3Transition.fromState).toBe(gcb3Transition.toState);
    });
  });

  describe('GCB4 - GATHER_EDITING_CONTEXT + Reparo -> [BLOCKED]', () => {
    beforeEach(() => {
      mockContext = {
        currentState: 'GATHER_EDITING_CONTEXT',
      };
    });

    it('should be defined with correct properties', () => {
      expect(gcb4Transition).toBeDefined();
      expect(gcb4Transition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcb4Transition.spell).toBe('Reparo');
      expect(gcb4Transition.toState).toBe('GATHER_EDITING_CONTEXT');
      expect(gcb4Transition.execute).toBeDefined();
      expect(gcb4Transition.condition).toBeUndefined();
    });

    it('should return formatted blocked response', async () => {
      const result = await gcb4Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_blocked_GCB4');
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

      await gcb4Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (blocked behavior)', () => {
      expect(gcb4Transition.fromState).toBe(gcb4Transition.toState);
    });
  });

  describe('Blocked Transitions Collection', () => {
    it('should have all transitions defined', () => {
      expect(contextGatheringBlocked).toBeDefined();
      expect(contextGatheringBlocked.length).toBe(5);
    });

    it('should contain all expected transitions', () => {
      expect(contextGatheringBlocked).toContain(gcb1Transition);
      expect(contextGatheringBlocked).toContain(gcb1bTransition);
      expect(contextGatheringBlocked).toContain(gcb2Transition);
      expect(contextGatheringBlocked).toContain(gcb3Transition);
      expect(contextGatheringBlocked).toContain(gcb4Transition);
    });

    it('should have no transitions with conditions', () => {
      contextGatheringBlocked.forEach(transition => {
        expect(transition.condition).toBeUndefined();
      });
    });

    it('should have all transitions stay in the same state', () => {
      contextGatheringBlocked.forEach(transition => {
        expect(transition.fromState).toBe(transition.toState);
      });
    });
  });
});
