import fs from 'fs';
import path from 'path';
import { createStateMachine, createStateMachineWithDependencies } from './index';
import { NodeFileSystem } from './fileSystem';
import { JsonFileStateRepository } from './stateRepository';
import { Transition } from './types';

describe('State Machine Index', () => {
  const testDir = path.resolve(process.cwd(), 'test-state-machine-index');

  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('createStateMachine', () => {
    it('should create a state machine with default configuration', async () => {
      const stateMachine = createStateMachine({
        baseDirectory: testDir,
      });

      expect(stateMachine).toBeDefined();
      expect(typeof stateMachine.executeSpell).toBe('function');

      // Test that it initializes properly by executing a spell
      const result = await stateMachine.executeSpell('Lumos');
      expect(result.success).toBe(false); // No transitions defined by default
      expect(result.message).toContain('not available');
    });

    it('should create a state machine with default state file path', async () => {
      const stateMachine = createStateMachine({
        baseDirectory: testDir,
      });

      expect(stateMachine).toBeDefined();

      // Execute a spell to trigger state initialization
      await stateMachine.executeSpell('Lumos');

      // Check that state file was created at default path
      const stateFilePath = path.join(testDir, '.ai/task/state.json');
      expect(fs.existsSync(stateFilePath)).toBe(true);
    });

    it('should create a state machine with custom transitions', async () => {
      const customTransitions: Transition[] = [
        {
          fromState: 'GATHER_NO_PLAN',
          spell: 'Accio',
          toState: 'GATHER_PLAN_DRAFT',
          execute: async () => ({ message: 'Custom transition executed' }),
        },
      ];

      const stateMachine = createStateMachine({
        baseDirectory: testDir,
        transitions: customTransitions,
      });

      const result = await stateMachine.executeSpell('Accio');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Custom transition executed');
    });

    it('should use default values when no options provided', () => {
      const stateMachine = createStateMachine();
      expect(stateMachine).toBeDefined();
      expect(typeof stateMachine.executeSpell).toBe('function');
    });
  });

  describe('createStateMachineWithDependencies', () => {
    it('should create a state machine with provided dependencies', async () => {
      const fileSystem = new NodeFileSystem(testDir);
      const stateRepository = new JsonFileStateRepository(fileSystem);

      const stateMachine = createStateMachineWithDependencies(stateRepository, fileSystem);

      expect(stateMachine).toBeDefined();
      expect(typeof stateMachine.executeSpell).toBe('function');

      // Test that it works with the provided dependencies
      const result = await stateMachine.executeSpell('Lumos');
      expect(result.success).toBe(false); // No transitions by default
    });

    it('should create a state machine with custom dependencies and transitions', async () => {
      const fileSystem = new NodeFileSystem(testDir);
      const stateRepository = new JsonFileStateRepository(fileSystem);

      const customTransitions: Transition[] = [
        {
          fromState: 'GATHER_NO_PLAN',
          spell: 'Lumos',
          toState: 'GATHER_NO_PLAN', // Stay in same state
          execute: async () => ({ message: 'Custom Lumos response' }),
        },
      ];

      const stateMachine = createStateMachineWithDependencies(
        stateRepository,
        fileSystem,
        customTransitions
      );

      const result = await stateMachine.executeSpell('Lumos');
      expect(result.success).toBe(true);
      expect(result.message).toBe('Custom Lumos response');
    });
  });

  describe('State Machine Integration', () => {
    it('should maintain state between spell executions', async () => {
      const customTransitions: Transition[] = [
        {
          fromState: 'GATHER_NO_PLAN',
          spell: 'Accio',
          toState: 'GATHER_PLAN_DRAFT',
          execute: async () => ({ message: 'Moved to draft state' }),
        },
        {
          fromState: 'GATHER_PLAN_DRAFT',
          spell: 'Lumos',
          toState: 'GATHER_PLAN_DRAFT',
          execute: async () => ({ message: 'Currently in draft state' }),
        },
      ];

      const stateMachine = createStateMachine({
        baseDirectory: testDir,
        transitions: customTransitions,
      });

      // First spell should transition to draft state
      const result1 = await stateMachine.executeSpell('Accio');
      expect(result1.success).toBe(true);
      expect(result1.message).toBe('Moved to draft state');

      // Second spell should work from the new state
      const result2 = await stateMachine.executeSpell('Lumos');
      expect(result2.success).toBe(true);
      expect(result2.message).toBe('Currently in draft state');
    });

    it('should persist state to file system', async () => {
      const customTransitions: Transition[] = [
        {
          fromState: 'GATHER_NO_PLAN',
          spell: 'Accio',
          toState: 'GATHER_PLAN_DRAFT',
          execute: async () => ({ message: 'State changed' }),
        },
      ];

      const stateMachine = createStateMachine({
        baseDirectory: testDir,
        transitions: customTransitions,
      });

      // Execute spell to change state
      await stateMachine.executeSpell('Accio');

      // Check that state file exists and contains correct state
      const stateFilePath = path.join(testDir, '.ai/task/state.json');
      expect(fs.existsSync(stateFilePath)).toBe(true);

      const stateContent = fs.readFileSync(stateFilePath, 'utf8');
      const stateData = JSON.parse(stateContent);
      expect(stateData.currentState).toBe('GATHER_PLAN_DRAFT');
    });

    it('should handle spell execution errors gracefully', async () => {
      const errorTransitions: Transition[] = [
        {
          fromState: 'GATHER_NO_PLAN',
          spell: 'Accio',
          toState: 'GATHER_PLAN_DRAFT',
          execute: async () => {
            throw new Error('Test error');
          },
        },
      ];

      const stateMachine = createStateMachine({
        baseDirectory: testDir,
        transitions: errorTransitions,
      });

      const result = await stateMachine.executeSpell('Accio');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to execute spell');
      expect(result.message).toContain('Test error');
    });
  });

  describe('Type Exports', () => {
    it('should export necessary types for external use', async () => {
      // This test verifies that types are properly exported
      // The actual verification happens at compile time
      const {
        createStateMachine: factory,
        AiEngineerStateMachine,
        NodeFileSystem: FileSystemImpl,
        JsonFileStateRepository: StateRepoImpl,
        DEFAULT_TRANSITIONS,
      } = await import('./index');

      expect(factory).toBeDefined();
      expect(AiEngineerStateMachine).toBeDefined();
      expect(FileSystemImpl).toBeDefined();
      expect(StateRepoImpl).toBeDefined();
      expect(DEFAULT_TRANSITIONS).toBeDefined();
      expect(Array.isArray(DEFAULT_TRANSITIONS)).toBe(true);
    });
  });
});
