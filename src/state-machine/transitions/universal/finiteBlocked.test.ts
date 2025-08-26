import { f3Transition, finiteBlocked } from './finiteBlocked';
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

  it('should have transitions defined', () => {
    expect(finiteBlocked).toBeDefined();
    expect(finiteBlocked.length).toBeGreaterThan(0);
    expect(finiteBlocked).toContain(f3Transition);
  });
});
