import { JsonFileStateRepository } from '../../src/state-machine/stateRepository.js';
import { NodeFileSystem } from '../../src/state-machine/fileSystem.js';
import { StateContext, StateName } from '../../src/state-machine/types.js';
import path from 'path';
import { tmpdir } from 'os';

describe('JsonFileStateRepository', () => {
  let repository: JsonFileStateRepository;
  let fileSystem: NodeFileSystem;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
    repository = new JsonFileStateRepository(fileSystem);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      const { rmdir } = await import('fs/promises');
      await rmdir(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('initialize', () => {
    it('should create initial state context', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      expect(context.currentState).toBe('GATHER_NO_PLAN');
      expect(context.workingDirectory).toBe(tempDir);
      expect(context.sessionId).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(context.metadata.createdAt).toBeDefined();
      expect(context.metadata.version).toBe('1.0.0');
    });

    it('should save initial state to file', async () => {
      await repository.initialize('GATHER_NO_PLAN', tempDir);

      const hasState = await repository.hasExistingState();
      expect(hasState).toBe(true);
    });
  });

  describe('save and load', () => {
    it('should save and load state context', async () => {
      const originalContext = await repository.initialize('GATHER_NO_PLAN', tempDir);

      const loadedContext = await repository.load();
      expect(loadedContext).toEqual(originalContext);
    });

    it('should return null when no state file exists', async () => {
      const context = await repository.load();
      expect(context).toBeNull();
    });

    it('should throw error for invalid state file', async () => {
      // Create invalid JSON file
      await fileSystem.write('.ai/task/state.json', 'invalid json');

      await expect(repository.load()).rejects.toThrow('Failed to load state');
    });

    it('should validate loaded state context', async () => {
      // Create state with missing required field
      const invalidState = {
        currentState: 'GATHER_NO_PLAN',
        timestamp: new Date().toISOString(),
        workingDirectory: tempDir,
        // Missing sessionId
      };

      await fileSystem.write('.ai/task/state.json', JSON.stringify(invalidState));

      await expect(repository.load()).rejects.toThrow(
        "Invalid state context: missing field 'sessionId'"
      );
    });

    it('should validate state name', async () => {
      const invalidState = {
        currentState: 'INVALID_STATE',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session',
        workingDirectory: tempDir,
      };

      await fileSystem.write('.ai/task/state.json', JSON.stringify(invalidState));

      await expect(repository.load()).rejects.toThrow('Invalid state context: unknown state');
    });
  });

  describe('updateState', () => {
    it('should update current state and set previous state', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      const updatedContext = await repository.updateState(context, 'GATHER_PLAN_DRAFT');

      expect(updatedContext.currentState).toBe('GATHER_PLAN_DRAFT');
      expect(updatedContext.previousState).toBe('GATHER_NO_PLAN');
      expect(new Date(updatedContext.timestamp).getTime()).toBeGreaterThan(
        new Date(context.timestamp).getTime()
      );
    });

    it('should persist updated state', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);
      await repository.updateState(context, 'GATHER_PLAN_DRAFT');

      const loadedContext = await repository.load();
      expect(loadedContext?.currentState).toBe('GATHER_PLAN_DRAFT');
      expect(loadedContext?.previousState).toBe('GATHER_NO_PLAN');
    });
  });

  describe('updateMetadata', () => {
    it('should update metadata and timestamp', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);
      const metadata = { testKey: 'testValue', anotherKey: 42 };

      const updatedContext = await repository.updateMetadata(context, metadata);

      expect(updatedContext.metadata.testKey).toBe('testValue');
      expect(updatedContext.metadata.anotherKey).toBe(42);
      expect(updatedContext.metadata.createdAt).toBe(context.metadata.createdAt); // Should preserve existing
      expect(new Date(updatedContext.timestamp).getTime()).toBeGreaterThan(
        new Date(context.timestamp).getTime()
      );
    });
  });

  describe('history management', () => {
    it('should add current state to history', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      const contextWithHistory = await repository.addToHistory(context);
      const history = repository.getStateHistory(contextWithHistory);

      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(context);
    });

    it('should maintain history limit of 50 entries', async () => {
      let context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      // Add 60 entries to history
      for (let i = 0; i < 60; i++) {
        context = await repository.addToHistory(context);
        context = await repository.updateState(context, 'GATHER_PLAN_DRAFT');
      }

      const history = repository.getStateHistory(context);
      expect(history).toHaveLength(50);
    });

    it('should return empty array when no history exists', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);
      const history = repository.getStateHistory(context);

      expect(history).toEqual([]);
    });
  });

  describe('session management', () => {
    it('should get session creation time', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);
      const createdAt = repository.getSessionCreatedAt(context);

      expect(createdAt).toBeInstanceOf(Date);
      expect(createdAt?.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return null for missing creation time', async () => {
      const context: StateContext = {
        currentState: 'GATHER_NO_PLAN',
        timestamp: new Date().toISOString(),
        sessionId: 'test-session',
        workingDirectory: tempDir,
        metadata: {}, // No createdAt
      };

      const createdAt = repository.getSessionCreatedAt(context);
      expect(createdAt).toBeNull();
    });

    it('should calculate session age', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      const age = repository.getSessionAge(context);
      expect(age).toBeGreaterThan(0);
    });

    it('should check if session is older than specified age', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      expect(repository.isSessionOlderThan(context, 1000)).toBe(false);
      expect(repository.isSessionOlderThan(context, -1)).toBe(true);
    });
  });

  describe('backup and restore', () => {
    it('should create backup with timestamp', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      const backupPath = await repository.createBackup(context);

      expect(backupPath).toMatch(/\.ai\/archive\/state-backup-.*\.json$/);
      expect(await fileSystem.exists(backupPath)).toBe(true);
    });

    it('should restore from backup', async () => {
      const originalContext = await repository.initialize('GATHER_NO_PLAN', tempDir);
      const backupPath = await repository.createBackup(originalContext);

      // Clear current state
      await repository.clear();
      expect(await repository.load()).toBeNull();

      // Restore from backup
      const restoredContext = await repository.restoreFromBackup(backupPath);

      expect(restoredContext).toEqual(originalContext);
      expect(await repository.load()).toEqual(originalContext);
    });
  });

  describe('clear', () => {
    it('should remove state file', async () => {
      await repository.initialize('GATHER_NO_PLAN', tempDir);
      expect(await repository.hasExistingState()).toBe(true);

      await repository.clear();
      expect(await repository.hasExistingState()).toBe(false);
    });

    it('should not throw error when state file does not exist', async () => {
      await expect(repository.clear()).resolves.not.toThrow();
    });
  });

  describe('hasExistingState', () => {
    it('should return false when no state exists', async () => {
      const hasState = await repository.hasExistingState();
      expect(hasState).toBe(false);
    });

    it('should return true when state exists', async () => {
      await repository.initialize('GATHER_NO_PLAN', tempDir);
      const hasState = await repository.hasExistingState();
      expect(hasState).toBe(true);
    });
  });

  describe('generateSessionId', () => {
    it('should generate unique session IDs', async () => {
      const context1 = await repository.initialize('GATHER_NO_PLAN', tempDir);
      await repository.clear();

      const context2 = await repository.initialize('GATHER_NO_PLAN', tempDir);

      expect(context1.sessionId).not.toBe(context2.sessionId);
      expect(context1.sessionId).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
      expect(context2.sessionId).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
    });
  });
});
