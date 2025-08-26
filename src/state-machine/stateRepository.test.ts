import { JsonFileStateRepository } from './stateRepository';
import { NodeFileSystem } from './fileSystem';
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
    });

    it('should save initial state to file', async () => {
      await repository.initialize('GATHER_NO_PLAN', tempDir);

      const loadedContext = await repository.load();
      expect(loadedContext).not.toBeNull();
      expect(loadedContext!.currentState).toBe('GATHER_NO_PLAN');
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
      // Create state with invalid state name
      const invalidState = {
        currentState: 'INVALID_STATE_NAME',
      };

      await fileSystem.write('.ai/task/state.json', JSON.stringify(invalidState));

      await expect(repository.load()).rejects.toThrow('Invalid state context');
    });
  });

  describe('updateState', () => {
    it('should update current state', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);

      const updatedContext = await repository.updateState(context, 'GATHER_PLAN_DRAFT');

      expect(updatedContext.currentState).toBe('GATHER_PLAN_DRAFT');
    });

    it('should persist updated state', async () => {
      const context = await repository.initialize('GATHER_NO_PLAN', tempDir);
      await repository.updateState(context, 'GATHER_PLAN_DRAFT');

      const loadedContext = await repository.load();
      expect(loadedContext?.currentState).toBe('GATHER_PLAN_DRAFT');
    });
  });

  describe('clear', () => {
    it('should remove state file', async () => {
      await repository.initialize('GATHER_NO_PLAN', tempDir);
      expect(await repository.load()).not.toBeNull();

      await repository.clear();
      expect(await repository.load()).toBeNull();
    });

    it('should not throw error when state file does not exist', async () => {
      await expect(repository.clear()).resolves.not.toThrow();
    });
  });
});
