import {
  e1bTransition,
  e2Transition,
  e3Transition,
  e3bTransition,
  e4Transition,
  e4bTransition,
  expectoTransitions,
} from './expectoTransitions';
import { MockFileSystem } from '../../testUtils';
import { StateContext, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TransitionUtils } from '../../utils/transitionUtils';

describe('Universal Expecto Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'GATHER_EDITING_CONTEXT' };
  });

  describe('E1b - GATHER_EDITING_CONTEXT + Expecto -> GATHER_EDITING_CONTEXT', () => {
    it('should be defined with correct properties', () => {
      expect(e1bTransition).toBeDefined();
      expect(e1bTransition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(e1bTransition.spell).toBe('Expecto');
      expect(e1bTransition.toState).toBe('GATHER_EDITING_CONTEXT');
    });

    describe('condition', () => {
      it('should return false when context.md does not exist', async () => {
        const result = await e1bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return false when context.md exists but has no Atlassian URLs', async () => {
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, 'Some content without Atlassian URLs');

        const result = await e1bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return true when context.md has Atlassian URLs and no .atlassian-refs file', async () => {
        await mockFileSystem.write(
          FILE_PATHS.CONTEXT_FILE,
          'Check this Jira ticket: https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e1bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return true when context.md has new Atlassian URLs not in .atlassian-refs', async () => {
        await mockFileSystem.write(
          FILE_PATHS.CONTEXT_FILE,
          'Check these tickets: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e1bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return false when all Atlassian URLs are already processed', async () => {
        await mockFileSystem.write(
          FILE_PATHS.CONTEXT_FILE,
          'Check this ticket: https://company.atlassian.net/browse/PROJ-123'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e1bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });
    });

    describe('execute', () => {
      it('should process unprocessed Atlassian URLs and update .atlassian-refs', async () => {
        const contextContent =
          'Check these: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456';
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

        const result = await e1bTransition.execute(mockContext, mockFileSystem);

        // Check that .atlassian-refs was created with URLs
        const refsContent = await mockFileSystem.readSafe(FILE_PATHS.ATLASSIAN_REFS_FILE);
        expect(refsContent).toContain('https://company.atlassian.net/browse/PROJ-123');
        expect(refsContent).toContain('https://company.atlassian.net/browse/PROJ-456');

        // Check that response contains the URLs
        expect(result.message).toContain('https://company.atlassian.net/browse/PROJ-123');
        expect(result.message).toContain('https://company.atlassian.net/browse/PROJ-456');
      });

      it('should append new URLs to existing .atlassian-refs file', async () => {
        const contextContent =
          'Check these: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456';
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e1bTransition.execute(mockContext, mockFileSystem);

        // Check that .atlassian-refs contains both old and new URLs
        const refsContent = await mockFileSystem.readSafe(FILE_PATHS.ATLASSIAN_REFS_FILE);
        expect(refsContent).toContain('https://company.atlassian.net/browse/PROJ-123');
        expect(refsContent).toContain('https://company.atlassian.net/browse/PROJ-456');

        // Check that response only contains the new URL
        expect(result.message).toContain('https://company.atlassian.net/browse/PROJ-456');
        expect(result.message).not.toContain('PROJ-123');
      });

      it('should handle multiple URLs with proper formatting', async () => {
        const contextContent = `
          Tickets to check:
          - https://company.atlassian.net/browse/PROJ-123
          - https://company.atlassian.net/wiki/spaces/DEV/pages/123456
          - https://company.atlassian.net/browse/PROJ-789
        `;
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

        await e1bTransition.execute(mockContext, mockFileSystem);

        // Check that all URLs are processed
        const refsContent = await mockFileSystem.readSafe(FILE_PATHS.ATLASSIAN_REFS_FILE);
        const urls = refsContent.split('\n').filter(line => line.trim().length > 0);
        expect(urls).toHaveLength(3);
        expect(urls).toContain('https://company.atlassian.net/browse/PROJ-123');
        expect(urls).toContain('https://company.atlassian.net/wiki/spaces/DEV/pages/123456');
        expect(urls).toContain('https://company.atlassian.net/browse/PROJ-789');
      });

      it('should use ResponseUtils.formatResponse with correct key and placeholder', async () => {
        const contextContent = 'Check: https://company.atlassian.net/browse/PROJ-123';
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, contextContent);

        const spy = jest.spyOn(ResponseUtils, 'formatResponse');

        await e1bTransition.execute(mockContext, mockFileSystem);

        expect(spy).toHaveBeenCalledWith('universal_expecto_E1b', {
          ATLASSIAN_URLS_PLACEHOLDER: 'https://company.atlassian.net/browse/PROJ-123',
        });

        spy.mockRestore();
      });
    });
  });

  describe('E2 - GATHER_EDITING + Expecto -> GATHER_EDITING', () => {
    it('should be defined with correct properties', () => {
      expect(e2Transition).toBeDefined();
      expect(e2Transition.fromState).toBe('GATHER_EDITING');
      expect(e2Transition.spell).toBe('Expecto');
      expect(e2Transition.toState).toBe('GATHER_EDITING');
    });

    describe('condition', () => {
      it('should return false when plan.md does not exist', async () => {
        const result = await e2Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return false when plan.md exists but has no Atlassian URLs', async () => {
        await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content without Atlassian URLs');

        const result = await e2Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return true when plan.md has Atlassian URLs and no .atlassian-refs file', async () => {
        await mockFileSystem.write(
          FILE_PATHS.PLAN_FILE,
          'Check this Jira ticket: https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e2Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return true when plan.md has new Atlassian URLs not in .atlassian-refs', async () => {
        await mockFileSystem.write(
          FILE_PATHS.PLAN_FILE,
          'Check these tickets: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e2Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return false when all Atlassian URLs are already processed', async () => {
        await mockFileSystem.write(
          FILE_PATHS.PLAN_FILE,
          'Check this ticket: https://company.atlassian.net/browse/PROJ-123'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e2Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });
    });

    describe('execute', () => {
      it('should process unprocessed Atlassian URLs from plan.md and update .atlassian-refs', async () => {
        const planContent =
          'Check these: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456';
        await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

        const result = await e2Transition.execute(mockContext, mockFileSystem);

        // Check that .atlassian-refs was created with URLs
        const refsContent = await mockFileSystem.readSafe(FILE_PATHS.ATLASSIAN_REFS_FILE);
        expect(refsContent).toContain('https://company.atlassian.net/browse/PROJ-123');
        expect(refsContent).toContain('https://company.atlassian.net/browse/PROJ-456');

        // Check that response contains the URLs
        expect(result.message).toContain('https://company.atlassian.net/browse/PROJ-123');
        expect(result.message).toContain('https://company.atlassian.net/browse/PROJ-456');
      });

      it('should use ResponseUtils.formatResponse with correct key and placeholder', async () => {
        const planContent = 'Check: https://company.atlassian.net/browse/PROJ-123';
        await mockFileSystem.write(FILE_PATHS.PLAN_FILE, planContent);

        const spy = jest.spyOn(ResponseUtils, 'formatResponse');

        await e2Transition.execute(mockContext, mockFileSystem);

        expect(spy).toHaveBeenCalledWith('universal_expecto_E2', {
          ATLASSIAN_URLS_PLACEHOLDER: 'https://company.atlassian.net/browse/PROJ-123',
        });

        spy.mockRestore();
      });
    });
  });

  describe('E3 - GATHER_EDITING_CONTEXT + Expecto -> Same state', () => {
    it('should be defined with correct properties', () => {
      expect(e3Transition).toBeDefined();
      expect(e3Transition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(e3Transition.spell).toBe('Expecto');
      expect(e3Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
    });

    describe('condition', () => {
      it('should return false when context.md does not exist', async () => {
        const result = await e3Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return true when context.md exists but has no Atlassian URLs', async () => {
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, 'Some content without Atlassian URLs');

        const result = await e3Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return false when context.md has Atlassian URLs', async () => {
        await mockFileSystem.write(
          FILE_PATHS.CONTEXT_FILE,
          'Check this Jira ticket: https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e3Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });
    });

    describe('execute', () => {
      it('should return response without performing any file operations', async () => {
        const result = await e3Transition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
      });

      it('should use ResponseUtils.formatResponse with correct key', async () => {
        const spy = jest.spyOn(ResponseUtils, 'formatResponse');

        await e3Transition.execute(mockContext, mockFileSystem);

        expect(spy).toHaveBeenCalledWith('universal_expecto_E3');

        spy.mockRestore();
      });
    });
  });

  describe('E3b - GATHER_EDITING + Expecto -> Same state', () => {
    it('should be defined with correct properties', () => {
      expect(e3bTransition).toBeDefined();
      expect(e3bTransition.fromState).toBe('GATHER_EDITING');
      expect(e3bTransition.spell).toBe('Expecto');
      expect(e3bTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
    });

    describe('condition', () => {
      it('should return false when plan.md does not exist', async () => {
        const result = await e3bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return true when plan.md exists but has no Atlassian URLs', async () => {
        await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content without Atlassian URLs');

        const result = await e3bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return false when plan.md has Atlassian URLs', async () => {
        await mockFileSystem.write(
          FILE_PATHS.PLAN_FILE,
          'Check this Jira ticket: https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e3bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });
    });

    describe('execute', () => {
      it('should return response without performing any file operations', async () => {
        const result = await e3bTransition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
      });

      it('should use ResponseUtils.formatResponse with correct key', async () => {
        const spy = jest.spyOn(ResponseUtils, 'formatResponse');

        await e3bTransition.execute(mockContext, mockFileSystem);

        expect(spy).toHaveBeenCalledWith('universal_expecto_E3b');

        spy.mockRestore();
      });
    });
  });

  describe('E4 - GATHER_EDITING_CONTEXT + Expecto -> Same state', () => {
    it('should be defined with correct properties', () => {
      expect(e4Transition).toBeDefined();
      expect(e4Transition.fromState).toBe('GATHER_EDITING_CONTEXT');
      expect(e4Transition.spell).toBe('Expecto');
      expect(e4Transition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
    });

    describe('condition', () => {
      it('should return false when context.md does not exist', async () => {
        const result = await e4Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return false when context.md exists but has no Atlassian URLs', async () => {
        await mockFileSystem.write(FILE_PATHS.CONTEXT_FILE, 'Some content without Atlassian URLs');

        const result = await e4Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return true when context.md has Atlassian URLs but all are processed', async () => {
        await mockFileSystem.write(
          FILE_PATHS.CONTEXT_FILE,
          'Check this ticket: https://company.atlassian.net/browse/PROJ-123'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e4Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return false when context.md has unprocessed Atlassian URLs', async () => {
        await mockFileSystem.write(
          FILE_PATHS.CONTEXT_FILE,
          'Check these tickets: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e4Transition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });
    });

    describe('execute', () => {
      it('should return response without performing any file operations', async () => {
        const result = await e4Transition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
      });

      it('should use ResponseUtils.formatResponse with correct key', async () => {
        const spy = jest.spyOn(ResponseUtils, 'formatResponse');

        await e4Transition.execute(mockContext, mockFileSystem);

        expect(spy).toHaveBeenCalledWith('universal_expecto_E4');

        spy.mockRestore();
      });
    });
  });

  describe('E4b - GATHER_EDITING + Expecto -> Same state', () => {
    it('should be defined with correct properties', () => {
      expect(e4bTransition).toBeDefined();
      expect(e4bTransition.fromState).toBe('GATHER_EDITING');
      expect(e4bTransition.spell).toBe('Expecto');
      expect(e4bTransition.toState).toBe(TransitionUtils.STAY_IN_SAME_STATE);
    });

    describe('condition', () => {
      it('should return false when plan.md does not exist', async () => {
        const result = await e4bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return false when plan.md exists but has no Atlassian URLs', async () => {
        await mockFileSystem.write(FILE_PATHS.PLAN_FILE, 'Some content without Atlassian URLs');

        const result = await e4bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });

      it('should return true when plan.md has Atlassian URLs but all are processed', async () => {
        await mockFileSystem.write(
          FILE_PATHS.PLAN_FILE,
          'Check this ticket: https://company.atlassian.net/browse/PROJ-123'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e4bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(true);
      });

      it('should return false when plan.md has unprocessed Atlassian URLs', async () => {
        await mockFileSystem.write(
          FILE_PATHS.PLAN_FILE,
          'Check these tickets: https://company.atlassian.net/browse/PROJ-123 and https://company.atlassian.net/browse/PROJ-456'
        );
        await mockFileSystem.write(
          FILE_PATHS.ATLASSIAN_REFS_FILE,
          'https://company.atlassian.net/browse/PROJ-123'
        );

        const result = await e4bTransition.condition!(mockContext, mockFileSystem);
        expect(result).toBe(false);
      });
    });

    describe('execute', () => {
      it('should return response without performing any file operations', async () => {
        const result = await e4bTransition.execute(mockContext, mockFileSystem);
        expect(result.message).toBeDefined();
      });

      it('should use ResponseUtils.formatResponse with correct key', async () => {
        const spy = jest.spyOn(ResponseUtils, 'formatResponse');

        await e4bTransition.execute(mockContext, mockFileSystem);

        expect(spy).toHaveBeenCalledWith('universal_expecto_E4b');

        spy.mockRestore();
      });
    });
  });

  it('should have all transitions defined', () => {
    expect(expectoTransitions).toBeDefined();
    expect(expectoTransitions.length).toBe(6);
    expect(expectoTransitions).toContain(e1bTransition);
    expect(expectoTransitions).toContain(e2Transition);
    expect(expectoTransitions).toContain(e3Transition);
    expect(expectoTransitions).toContain(e3bTransition);
    expect(expectoTransitions).toContain(e4Transition);
    expect(expectoTransitions).toContain(e4bTransition);
  });
});
