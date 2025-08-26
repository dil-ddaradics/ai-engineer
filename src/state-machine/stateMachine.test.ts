import { AiEngineerStateMachine } from './stateMachine';
import { JsonFileStateRepository } from './stateRepository';
import { NodeFileSystem } from './fileSystem';
import { StateContext, Spell, Transition, FileSystem } from './types';
import path from 'path';
import { tmpdir } from 'os';

describe('AiEngineerStateMachine', () => {
  let stateMachine: AiEngineerStateMachine;
  let stateRepository: JsonFileStateRepository;
  let fileSystem: NodeFileSystem;
  let tempDir: string;

  // Mock transitions for controlled testing - only include what's needed for testing state machine logic
  const mockTransitions: Transition[] = [
    // Working transition: GATHER_NEEDS_CONTEXT + Accio -> GATHER_EDITING_CONTEXT
    {
      fromState: 'GATHER_NEEDS_CONTEXT',
      spell: 'Accio',
      toState: 'GATHER_EDITING_CONTEXT',
      execute: async () => ({
        message: 'Mock Accio transition executed successfully',
      }),
    },
    // Conditional transition for testing condition logic: GATHER_EDITING_CONTEXT + Finite -> Same state
    {
      fromState: 'GATHER_EDITING_CONTEXT',
      spell: 'Finite',
      toState: 'GATHER_EDITING_CONTEXT',
      condition: async () => true, // Always true for testing
      execute: async () => ({
        message: 'Mock conditional transition executed',
      }),
    },
    // Conditional transition that fails: GATHER_EDITING_CONTEXT + Expecto -> Same state
    {
      fromState: 'GATHER_EDITING_CONTEXT',
      spell: 'Expecto',
      toState: 'GATHER_EDITING_CONTEXT',
      condition: async () => false, // Always false for testing
      execute: async () => ({
        message: 'This should never execute due to failing condition',
      }),
    },
  ];

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
    stateRepository = new JsonFileStateRepository(fileSystem);
    // Inject mock transitions instead of DEFAULT_TRANSITIONS
    stateMachine = new AiEngineerStateMachine(stateRepository, fileSystem, mockTransitions);
  });

  // Helper function to read current state from file
  async function getCurrentStateFromFile(): Promise<StateContext | null> {
    try {
      const stateContent = await fileSystem.read('.ai/task/state.json');
      return JSON.parse(stateContent);
    } catch {
      return null;
    }
  }

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
    it('should initialize with GATHER_NEEDS_CONTEXT state when no state exists', async () => {
      const result = await stateMachine.executeSpell('Accio');

      // Accio should now work from GATHER_NEEDS_CONTEXT because we implemented GC1 transition
      expect(result.success).toBe(true);
      expect(result.message).toBeDefined();

      // Check that state was saved and transitioned to GATHER_EDITING_CONTEXT
      const savedState = await getCurrentStateFromFile();
      expect(savedState).not.toBeNull();
      expect(savedState!.currentState).toBe('GATHER_EDITING_CONTEXT');
    });

    it('should return blocked message for spells without transitions defined', async () => {
      const result = await stateMachine.executeSpell('Lumos');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available in the current state');
    });

    it('should execute successful transition with injected transitions', async () => {
      const testTransitions: Transition[] = [
        {
          fromState: 'GATHER_NEEDS_CONTEXT',
          spell: 'Accio',
          toState: 'GATHER_EDITING_CONTEXT',
          execute: async (_context: StateContext, _fileSystem: FileSystem) => {
            return { message: 'Plan creation started' };
          },
        },
      ];

      const testStateMachine = new AiEngineerStateMachine(
        stateRepository,
        fileSystem,
        testTransitions
      );
      const result = await testStateMachine.executeSpell('Accio');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Plan creation started');

      const savedState = await getCurrentStateFromFile();
      expect(savedState!.currentState).toBe('GATHER_EDITING_CONTEXT');
    });

    it('should handle conditional transitions', async () => {
      const testTransitions: Transition[] = [
        {
          fromState: 'GATHER_NEEDS_CONTEXT',
          spell: 'Accio',
          toState: 'GATHER_EDITING_CONTEXT',
          condition: async (context: StateContext, _fileSystem: FileSystem) =>
            context.currentState === 'GATHER_NEEDS_CONTEXT',
          execute: async (_context: StateContext, _fileSystem: FileSystem) => ({
            message: 'Condition met',
          }),
        },
      ];

      const testStateMachine = new AiEngineerStateMachine(
        stateRepository,
        fileSystem,
        testTransitions
      );
      const result = await testStateMachine.executeSpell('Accio');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Condition met');
    });

    it('should handle errors without corrupting state', async () => {
      const testTransitions: Transition[] = [
        {
          fromState: 'GATHER_NEEDS_CONTEXT',
          spell: 'Accio',
          toState: 'GATHER_EDITING_CONTEXT',
          execute: async (_context: StateContext, _fileSystem: FileSystem) => {
            throw new Error('Transition execution failed');
          },
        },
      ];

      const testStateMachine = new AiEngineerStateMachine(
        stateRepository,
        fileSystem,
        testTransitions
      );
      const result = await testStateMachine.executeSpell('Accio');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Transition execution failed');

      // State should not be saved on error - file should not exist
      const savedState = await getCurrentStateFromFile();
      expect(savedState).toBeNull();
    });
  });

  describe('spell validation', () => {
    const validSpells: Spell[] = ['Accio', 'Expecto', 'Reparo', 'Reverto', 'Finite', 'Lumos'];

    validSpells.forEach(spell => {
      it(`should handle ${spell} spell and return proper response structure`, async () => {
        const result = await stateMachine.executeSpell(spell);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('message');

        if (spell === 'Accio') {
          // Accio should work from GATHER_NEEDS_CONTEXT (mock transition defined)
          expect(result.success).toBe(true);
          expect(result.message).toBe('Mock Accio transition executed successfully');
        } else {
          // Other spells should be blocked since no transitions are defined for them in GATHER_NEEDS_CONTEXT
          expect(result.success).toBe(false);
          expect(result.message).toContain('not available in the current state');
        }

        // Verify state was saved to file
        const savedState = await getCurrentStateFromFile();
        expect(savedState).not.toBeNull();
      });
    });

    it('should handle conditional transitions that succeed', async () => {
      // First transition to GATHER_EDITING_CONTEXT
      await stateMachine.executeSpell('Accio');

      // Now test Finite which has condition that always returns true
      const result = await stateMachine.executeSpell('Finite');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Mock conditional transition executed');

      const savedState = await getCurrentStateFromFile();
      expect(savedState!.currentState).toBe('GATHER_EDITING_CONTEXT');
    });

    it('should handle conditional transitions that fail', async () => {
      // First transition to GATHER_EDITING_CONTEXT
      await stateMachine.executeSpell('Accio');

      // Now test Expecto which has condition that always returns false
      const result = await stateMachine.executeSpell('Expecto');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available in the current state');

      const savedState = await getCurrentStateFromFile();
      expect(savedState!.currentState).toBe('GATHER_EDITING_CONTEXT'); // State unchanged
    });
  });
});
