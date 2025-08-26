import { gatherAcceptanceCriteriaBlocked, gb1Transition } from './gatherAcceptanceCriteriaBlocked';
import { StateContext } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { MockFileSystem } from '../../testUtils';

describe('Gather Acceptance Criteria Blocked Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = {
      currentState: 'GATHER_EDITING',
    };
  });

  describe('GB1 - GATHER_EDITING + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(gb1Transition).toBeDefined();
      expect(gb1Transition.fromState).toBe('GATHER_EDITING');
      expect(gb1Transition.spell).toBe('Reverto');
      expect(gb1Transition.toState).toBe('GATHER_EDITING');
      expect(gb1Transition.execute).toBeDefined();
      expect(gb1Transition.condition).toBeUndefined(); // No condition for blocked transitions
    });

    it('should return formatted blocked response', async () => {
      const result = await gb1Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_blocked_GB1');
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

      await gb1Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (blocked behavior)', () => {
      expect(gb1Transition.fromState).toBe(gb1Transition.toState);
    });
  });

  describe('Blocked Transitions Collection', () => {
    it('should have all transitions defined', () => {
      expect(gatherAcceptanceCriteriaBlocked).toBeDefined();
      expect(gatherAcceptanceCriteriaBlocked.length).toBe(1);
    });

    it('should contain all expected transitions', () => {
      expect(gatherAcceptanceCriteriaBlocked).toContain(gb1Transition);
    });

    it('should have no transitions with conditions', () => {
      gatherAcceptanceCriteriaBlocked.forEach(transition => {
        expect(transition.condition).toBeUndefined();
      });
    });

    it('should have all transitions stay in the same state', () => {
      gatherAcceptanceCriteriaBlocked.forEach(transition => {
        expect(transition.fromState).toBe(transition.toState);
      });
    });
  });
});
