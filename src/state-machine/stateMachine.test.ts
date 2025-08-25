import { AiEngineerStateMachine } from './stateMachine';
import { JsonFileStateRepository } from './stateRepository';
import { NodeFileSystem } from './fileSystem';
import { StateContext, StateName, Spell, Transition } from './types';
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
    it('should initialize with GATHER_NO_PLAN state when no state exists', async () => {
      const result = await stateMachine.executeSpell('Accio');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available in the current state');
      
      // Check that state was saved to file
      const savedState = await getCurrentStateFromFile();
      expect(savedState).not.toBeNull();
      expect(savedState!.currentState).toBe('GATHER_NO_PLAN');
    });

    it('should return blocked message for any spell since no transitions are defined', async () => {
      const result = await stateMachine.executeSpell('Lumos');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available in the current state');
    });

    it('should execute successful transition with injected transitions', async () => {
      const testTransitions: Transition[] = [{
        fromState: 'GATHER_NO_PLAN',
        spell: 'Accio',
        toState: 'GATHER_PLAN_DRAFT',
        execute: async (context: StateContext) => {
          return { message: 'Plan creation started' };
        }
      }];
      
      const testStateMachine = new AiEngineerStateMachine(stateRepository, fileSystem, testTransitions);
      const result = await testStateMachine.executeSpell('Accio');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Plan creation started');
      
      const savedState = await getCurrentStateFromFile();
      expect(savedState!.currentState).toBe('GATHER_PLAN_DRAFT');
    });

    it('should handle conditional transitions', async () => {
      const testTransitions: Transition[] = [{
        fromState: 'GATHER_NO_PLAN',
        spell: 'Accio',
        toState: 'GATHER_PLAN_DRAFT',
        condition: (context: StateContext) => context.currentState === 'GATHER_NO_PLAN',
        execute: async (context: StateContext) => ({ message: 'Condition met' })
      }];
      
      const testStateMachine = new AiEngineerStateMachine(stateRepository, fileSystem, testTransitions);
      const result = await testStateMachine.executeSpell('Accio');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Condition met');
    });

    it('should handle errors without corrupting state', async () => {
      const testTransitions: Transition[] = [{
        fromState: 'GATHER_NO_PLAN',
        spell: 'Accio',
        toState: 'GATHER_PLAN_DRAFT',
        execute: async (context: StateContext) => {
          throw new Error('Transition execution failed');
        }
      }];
      
      const testStateMachine = new AiEngineerStateMachine(stateRepository, fileSystem, testTransitions);
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
        // All spells should be blocked since no transitions are defined
        expect(result.success).toBe(false);
        expect(result.message).toContain('not available in the current state');
        
        // Verify state was saved to file
        const savedState = await getCurrentStateFromFile();
        expect(savedState).not.toBeNull();
      });
    });
  });
});
