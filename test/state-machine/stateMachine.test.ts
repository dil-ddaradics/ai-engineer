import { AiEngineerStateMachine } from '../../src/state-machine/stateMachine.js';
import { JsonFileStateRepository } from '../../src/state-machine/stateRepository.js';
import { NodeFileSystem } from '../../src/state-machine/fileSystem.js';
import { StateContext, StateName, Spell } from '../../src/state-machine/types.js';
import { jest } from '@jest/globals';
import path from 'path';
import { tmpdir } from 'os';

describe('AiEngineerStateMachine', () => {
  let stateMachine: AiEngineerStateMachine;
  let stateRepository: JsonFileStateRepository;
  let fileSystem: NodeFileSystem;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
    stateRepository = new JsonFileStateRepository(fileSystem);
    stateMachine = new AiEngineerStateMachine(stateRepository, fileSystem);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fileSystem.delete('.ai/task/state.json');
      const { rmdir } = await import('fs/promises');
      await rmdir(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('executeSpell', () => {
    it('should initialize with GATHER_NO_PLAN state when no state exists', async () => {
      const result = await stateMachine.executeSpell('Accio');

      expect(result.success).toBe(true);
      expect(result.newState).toBe('GATHER_PLAN_DRAFT');
      expect(result.previousState).toBe('GATHER_NO_PLAN');
    });

    it('should handle Lumos spell in any state', async () => {
      const result = await stateMachine.executeSpell('Lumos');

      expect(result.success).toBe(true);
      expect(result.responseType).toBe('transition');
      expect(result.message).toContain('Where We Are');
    });

    it('should block invalid spells in current state', async () => {
      // Initialize state
      await stateMachine.executeSpell('Accio');

      // Try Reverto in GATHER state (should be blocked)
      const result = await stateMachine.executeSpell('Reverto');

      expect(result.success).toBe(false);
      expect(result.responseType).toBe('blocked');
    });

    it('should handle state transitions correctly', async () => {
      // Start from initial state
      let result = await stateMachine.executeSpell('Accio');
      expect(result.newState).toBe('GATHER_PLAN_DRAFT');

      // Move to task drafting
      result = await stateMachine.executeSpell('Accio');
      expect(result.newState).toBe('ACHIEVE_TASK_DRAFT');
    });

    it('should maintain state history', async () => {
      await stateMachine.executeSpell('Accio'); // GATHER_NO_PLAN -> GATHER_PLAN_DRAFT
      await stateMachine.executeSpell('Accio'); // GATHER_PLAN_DRAFT -> ACHIEVE_TASK_DRAFT

      const context = await stateMachine.getCurrentState();
      expect(context?.previousState).toBe('GATHER_PLAN_DRAFT');
    });

    it('should handle errors gracefully', async () => {
      // Mock a repository error
      const mockRepository = {
        ...stateRepository,
        load: jest.fn().mockRejectedValue(new Error('Repository error')),
      };

      const errorStateMachine = new AiEngineerStateMachine(mockRepository as any, fileSystem);
      const result = await errorStateMachine.executeSpell('Accio');

      expect(result.success).toBe(false);
      expect(result.responseType).toBe('error');
      expect(result.message).toContain('Repository error');
    });
  });

  describe('getCurrentState', () => {
    it('should return null when no state exists', async () => {
      const state = await stateMachine.getCurrentState();
      expect(state).toBeNull();
    });

    it('should return current state after initialization', async () => {
      await stateMachine.executeSpell('Accio');
      const state = await stateMachine.getCurrentState();

      expect(state).not.toBeNull();
      expect(state?.currentState).toBe('GATHER_PLAN_DRAFT');
    });
  });

  describe('resetState', () => {
    it('should clear existing state', async () => {
      await stateMachine.executeSpell('Accio');
      expect(await stateMachine.getCurrentState()).not.toBeNull();

      await stateMachine.resetState();
      expect(await stateMachine.getCurrentState()).toBeNull();
    });
  });

  describe('getTemplate', () => {
    it('should return template content', async () => {
      const template = await stateMachine.getTemplate('plan');
      expect(template).toContain('# Project Plan');
      expect(template).toContain('## Acceptance Criteria');
    });

    it('should return empty string for non-existent template', async () => {
      const template = await stateMachine.getTemplate('nonexistent');
      expect(template).toBe('');
    });
  });

  describe('isInitialized', () => {
    it('should return false when no state exists', async () => {
      const initialized = await stateMachine.isInitialized();
      expect(initialized).toBe(false);
    });

    it('should return true after state is created', async () => {
      await stateMachine.executeSpell('Accio');
      const initialized = await stateMachine.isInitialized();
      expect(initialized).toBe(true);
    });
  });

  describe('getSessionInfo', () => {
    it('should return null when no state exists', async () => {
      const sessionInfo = await stateMachine.getSessionInfo();
      expect(sessionInfo).toBeNull();
    });

    it('should return session info after initialization', async () => {
      await stateMachine.executeSpell('Accio');
      const sessionInfo = await stateMachine.getSessionInfo();

      expect(sessionInfo).not.toBeNull();
      expect(sessionInfo?.age).toBeGreaterThanOrEqual(0);
      expect(sessionInfo?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('state transition logic', () => {
    it('should handle Finite transitions correctly', async () => {
      // Initialize and get to task state
      await stateMachine.executeSpell('Accio'); // -> GATHER_PLAN_DRAFT
      await stateMachine.executeSpell('Accio'); // -> ACHIEVE_TASK_DRAFT

      // Use Finite to return to plan editing
      const result = await stateMachine.executeSpell('Finite');
      expect(result.newState).toBe('GATHER_PLAN_DRAFT');
    });

    it('should handle Reparo transitions for PR review', async () => {
      // Get to plan state
      await stateMachine.executeSpell('Accio'); // -> GATHER_PLAN_DRAFT

      // Start PR review
      const result = await stateMachine.executeSpell('Reparo');
      expect(result.newState).toBe('PR_COMMENTS_PLAN');
    });

    it('should handle error states', async () => {
      // Force an error state by corrupting the state context
      const context: StateContext = {
        currentState: 'ERROR_NO_PLAN' as StateName,
        timestamp: new Date().toISOString(),
        sessionId: 'test-session',
        workingDirectory: tempDir,
        metadata: {},
      };

      await stateRepository.save(context);

      // Execute Accio in error state (should trigger recovery)
      const result = await stateMachine.executeSpell('Accio');
      expect(result.success).toBe(true);
      expect(result.newState).toBe('GATHER_PLAN_DRAFT');
    });
  });

  describe('response key generation', () => {
    it('should generate correct transition keys', async () => {
      const stateMachine = new AiEngineerStateMachine(stateRepository, fileSystem);

      // Test that private methods work correctly through public interface
      await stateMachine.executeSpell('Accio'); // Should use gather_transitions_G1
      const state = await stateMachine.getCurrentState();
      expect(state?.currentState).toBe('GATHER_PLAN_DRAFT');
    });

    it('should handle blocked spells correctly', async () => {
      await stateMachine.executeSpell('Accio'); // -> GATHER_PLAN_DRAFT

      // Try Reverto (should be blocked in GATHER state)
      const result = await stateMachine.executeSpell('Reverto');
      expect(result.success).toBe(false);
      expect(result.responseType).toBe('blocked');
    });
  });

  describe('spell validation', () => {
    const validSpells: Spell[] = ['Accio', 'Expecto', 'Reparo', 'Reverto', 'Finite', 'Lumos'];

    validSpells.forEach(spell => {
      it(`should handle ${spell} spell`, async () => {
        const result = await stateMachine.executeSpell(spell);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('newState');
        expect(result).toHaveProperty('message');
        expect(result).toHaveProperty('responseType');
      });
    });
  });
});
