import { AiEngineerStateMachine } from './stateMachine';
import { JsonFileStateRepository } from './stateRepository';
import { NodeFileSystem } from './fileSystem';
import { StateContext, StateName, Spell } from './types';
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

      expect(result.success).toBe(false);
      expect(result.newState).toBe('GATHER_NO_PLAN');
      expect(result.message).toContain('not available in the current state');
    });

    it('should return blocked message for any spell since no transitions are defined', async () => {
      const result = await stateMachine.executeSpell('Lumos');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not available in the current state');
    });

    it('should block all spells since no transitions are defined', async () => {
      const spells: Spell[] = ['Accio', 'Expecto', 'Reparo', 'Reverto', 'Finite', 'Lumos'];
      
      for (const spell of spells) {
        const result = await stateMachine.executeSpell(spell);
        expect(result.success).toBe(false);
        expect(result.message).toContain('not available in the current state');
      }
    });



  });


  describe('spell validation', () => {
    const validSpells: Spell[] = ['Accio', 'Expecto', 'Reparo', 'Reverto', 'Finite', 'Lumos'];

    validSpells.forEach(spell => {
      it(`should handle ${spell} spell and return proper response structure`, async () => {
        const result = await stateMachine.executeSpell(spell);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('newState');
        expect(result).toHaveProperty('message');
        // All spells should be blocked since no transitions are defined
        expect(result.success).toBe(false);
        expect(result.message).toContain('not available in the current state');
      });
    });
  });
});
