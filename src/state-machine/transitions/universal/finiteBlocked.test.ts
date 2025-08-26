import { f3Transition, f4Transition, f5Transition, finiteBlocked } from './finiteBlocked';
import { MockFileSystem } from '../../testUtils';
import { StateContext } from '../../types';
import { TransitionUtils } from '../../utils';

describe('Finite Blocked Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
  });

  describe('F3 - PR_APPLIED_PENDING_ARCHIVE_[G/A] + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(f3Transition).toBeDefined();
      expect(f3Transition.fromState).toEqual([
        'PR_APPLIED_PENDING_ARCHIVE_G',
        'PR_APPLIED_PENDING_ARCHIVE_A',
      ]);
      expect(f3Transition.spell).toBe('Finite');
      expect(f3Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(f3Transition.condition).toBeUndefined();
    });

    it('should return blocked response for PR_APPLIED_PENDING_ARCHIVE_G', async () => {
      mockContext = { currentState: 'PR_APPLIED_PENDING_ARCHIVE_G' };

      const result = await f3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('complete the current PR review process first');
      expect(result.message).toContain('**Accio**');
    });

    it('should return blocked response for PR_APPLIED_PENDING_ARCHIVE_A', async () => {
      mockContext = { currentState: 'PR_APPLIED_PENDING_ARCHIVE_A' };

      const result = await f3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('complete the current PR review process first');
      expect(result.message).toContain('**Accio**');
    });

    it('should not perform any file operations', async () => {
      mockContext = { currentState: 'PR_APPLIED_PENDING_ARCHIVE_G' };

      // Get initial state
      const initialFiles = mockFileSystem.getFiles();
      const initialDirectories = mockFileSystem.getDirectories();

      await f3Transition.execute(mockContext, mockFileSystem);

      // Verify no file operations were performed
      expect(mockFileSystem.getFiles()).toEqual(initialFiles);
      expect(mockFileSystem.getDirectories()).toEqual(initialDirectories);
    });
  });

  describe('F4 - GATHER_NEEDS_CONTEXT + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(f4Transition).toBeDefined();
      expect(f4Transition.fromState).toBe('GATHER_NEEDS_CONTEXT');
      expect(f4Transition.spell).toBe('Finite');
      expect(f4Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(f4Transition.condition).toBeUndefined();
    });

    it('should return blocked response for GATHER_NEEDS_CONTEXT', async () => {
      mockContext = { currentState: 'GATHER_NEEDS_CONTEXT' };

      const result = await f4Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('create your context document first');
      expect(result.message).toContain('**Accio**');
    });

    it('should not perform any file operations', async () => {
      mockContext = { currentState: 'GATHER_NEEDS_CONTEXT' };

      // Get initial state
      const initialFiles = mockFileSystem.getFiles();
      const initialDirectories = mockFileSystem.getDirectories();

      await f4Transition.execute(mockContext, mockFileSystem);

      // Verify no file operations were performed
      expect(mockFileSystem.getFiles()).toEqual(initialFiles);
      expect(mockFileSystem.getDirectories()).toEqual(initialDirectories);
    });
  });

  describe('F5 - GATHER_EDITING_CONTEXT + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(f5Transition).toBeDefined();
      expect(f5Transition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(f5Transition.spell).toBe('Finite');
      expect(f5Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
      expect(f5Transition.condition).toBeUndefined();
    });

    it('should return blocked response for GATHER_EDITING_CONTEXT', async () => {
      mockContext = { currentState: 'GATHER_EDITING_CONTEXT' };

      const result = await f5Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toContain('cannot be used right now');
      expect(result.message).toContain('generate your plan document first');
      expect(result.message).toContain('**Accio**');
    });

    it('should not perform any file operations', async () => {
      mockContext = { currentState: 'GATHER_EDITING_CONTEXT' };

      // Get initial state
      const initialFiles = mockFileSystem.getFiles();
      const initialDirectories = mockFileSystem.getDirectories();

      await f5Transition.execute(mockContext, mockFileSystem);

      // Verify no file operations were performed
      expect(mockFileSystem.getFiles()).toEqual(initialFiles);
      expect(mockFileSystem.getDirectories()).toEqual(initialDirectories);
    });
  });

  it('should have all transitions defined', () => {
    expect(finiteBlocked).toBeDefined();
    expect(finiteBlocked.length).toBe(3);
    expect(finiteBlocked).toContain(f3Transition);
    expect(finiteBlocked).toContain(f4Transition);
    expect(finiteBlocked).toContain(f5Transition);
  });
});
