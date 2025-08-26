import { contextGatheringTransitions, gc1Transition } from './contextGatheringTransitions';
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

  it('should have transitions defined', () => {
    expect(contextGatheringTransitions).toBeDefined();
    expect(contextGatheringTransitions.length).toBeGreaterThan(0);
  });
});
