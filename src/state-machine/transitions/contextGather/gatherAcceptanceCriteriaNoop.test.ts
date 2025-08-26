import {
  gatherAcceptanceCriteriaNoop,
  gn1Transition,
  gn3Transition,
} from './gatherAcceptanceCriteriaNoop';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { MockFileSystem } from '../../testUtils';

describe('Gather Acceptance Criteria No-op Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = {
      currentState: 'GATHER_EDITING',
    };
  });

  describe('GN1 - GATHER_EDITING + Finite -> Same state', () => {
    it('should be defined with correct properties', () => {
      expect(gn1Transition).toBeDefined();
      expect(gn1Transition.fromState).toBe('GATHER_EDITING');
      expect(gn1Transition.spell).toBe('Finite');
      expect(gn1Transition.toState).toBe('GATHER_EDITING');
      expect(gn1Transition.execute).toBeDefined();
      expect(gn1Transition.condition).toBeUndefined(); // No condition for GN1
    });

    it('should return formatted no-op response', async () => {
      const result = await gn1Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_noop_GN1');
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

      await gn1Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (no-op behavior)', () => {
      expect(gn1Transition.fromState).toBe(gn1Transition.toState);
    });
  });

  describe('GN3 - GATHER_EDITING + Expecto -> Same state', () => {
    it('should be defined with correct properties', () => {
      expect(gn3Transition).toBeDefined();
      expect(gn3Transition.fromState).toBe('GATHER_EDITING');
      expect(gn3Transition.spell).toBe('Expecto');
      expect(gn3Transition.toState).toBe('GATHER_EDITING');
      expect(gn3Transition.execute).toBeDefined();
      expect(gn3Transition.condition).toBeDefined(); // GN3 has a condition
    });

    it('should return true condition when plan.md exists with no Atlassian URLs', async () => {
      // Create plan.md without Atlassian URLs
      const planContent = `
# Project Plan

## Acceptance Criteria

- [ ] Implement user authentication
- [ ] Add database integration

This plan has no Atlassian URLs.
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await gn3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(true);
    });

    it('should return false condition when plan.md does not exist', async () => {
      // Ensure plan.md doesn't exist
      expect(await mockFileSystem.exists(FILE_PATHS.PLAN_FILE)).toBe(false);

      const result = await gn3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return false condition when plan.md exists with Atlassian URLs', async () => {
      // Create plan.md with Atlassian URLs
      const planContent = `
# Project Plan

## Acceptance Criteria

- [ ] Implement user authentication
- [ ] Add database integration

Related resources:
https://company.atlassian.net/wiki/spaces/DEV/pages/123456/Requirements
https://company.atlassian.net/browse/PROJ-123
      `;
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

      const result = await gn3Transition.condition!(mockContext, mockFileSystem);

      expect(result).toBe(false);
    });

    it('should return formatted no-op response', async () => {
      const result = await gn3Transition.execute(mockContext, mockFileSystem);

      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
      expect(result.message.length).toBeGreaterThan(0);

      // Verify the response uses the correct response key
      const expectedResponse = ResponseUtils.formatResponse('gather_noop_GN3');
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

      await gn3Transition.execute(mockContext, mockFileSystem);

      // Verify no files were written
      expect(writeOperations).toHaveLength(0);
    });

    it('should stay in the same state (no-op behavior)', () => {
      expect(gn3Transition.fromState).toBe(gn3Transition.toState);
    });

    it('should handle condition check errors gracefully', async () => {
      // Create a mock file system that throws errors during exists check
      const errorFileSystem = new MockFileSystem();
      errorFileSystem.exists = () => Promise.reject(new Error('File check failed'));

      await expect(gn3Transition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'File check failed'
      );
    });

    it('should handle parsing errors gracefully', async () => {
      // Create plan.md file
      await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content');

      // Mock PlanUtils to throw an error
      const errorFileSystem = new MockFileSystem();
      await errorFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content');
      errorFileSystem.read = () => Promise.reject(new Error('Parse failed'));

      await expect(gn3Transition.condition!(mockContext, errorFileSystem)).rejects.toThrow(
        'Parse failed'
      );
    });
  });

  describe('No-op Transitions Collection', () => {
    it('should have all transitions defined', () => {
      expect(gatherAcceptanceCriteriaNoop).toBeDefined();
      expect(gatherAcceptanceCriteriaNoop.length).toBe(2);
    });

    it('should contain all expected transitions', () => {
      expect(gatherAcceptanceCriteriaNoop).toContain(gn1Transition);
      expect(gatherAcceptanceCriteriaNoop).toContain(gn3Transition);
    });

    it('should have all transitions stay in the same state', () => {
      gatherAcceptanceCriteriaNoop.forEach(transition => {
        expect(transition.fromState).toBe(transition.toState);
      });
    });

    it('should have GN1 without conditions, GN3 with conditions', () => {
      expect(gn1Transition.condition).toBeUndefined();
      expect(gn3Transition.condition).toBeDefined();
    });
  });
});
