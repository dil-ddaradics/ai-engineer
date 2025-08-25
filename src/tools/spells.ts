// Input schemas for spell tools (MCP format) - All spells are parameter-less
export const accioInputSchema = {};

export const expectoInputSchema = {};

export const reparoInputSchema = {};

export const revertoInputSchema = {};

export const finiteInputSchema = {};

import { AiEngineerStateMachine } from '../state-machine/stateMachine.js';
import { JsonFileStateRepository } from '../state-machine/stateRepository.js';
import { NodeFileSystem } from '../state-machine/fileSystem.js';
import { Spell } from '../state-machine/types.js';

// Create singleton instances for state machine integration
const getStateMachine = (() => {
  let instance: AiEngineerStateMachine | null = null;

  return () => {
    if (!instance) {
      const fileSystem = new NodeFileSystem(process.cwd());
      const stateRepository = new JsonFileStateRepository(fileSystem);
      instance = new AiEngineerStateMachine(stateRepository, fileSystem);
    }
    return instance;
  };
})();

// Tool implementation functions - All spells are parameter-less and state-driven
export async function accioTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Accio');

    return {
      success: result.success,
      spell: 'Accio',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      spell: 'Accio',
      message: `Failed to execute Accio: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function expectoTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Expecto');

    return {
      success: result.success,
      spell: 'Expecto',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      spell: 'Expecto',
      message: `Failed to execute Expecto: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function reparoTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Reparo');

    return {
      success: result.success,
      spell: 'Reparo',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      spell: 'Reparo',
      message: `Failed to execute Reparo: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function revertoTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Reverto');

    return {
      success: result.success,
      spell: 'Reverto',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      spell: 'Reverto',
      message: `Failed to execute Reverto: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function finiteTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Finite');

    return {
      success: result.success,
      spell: 'Finite',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      spell: 'Finite',
      message: `Failed to execute Finite: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// Lumos tool - provides state information
export async function lumosTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Lumos');

    return {
      success: result.success,
      spell: 'Lumos',
      message: result.message,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      spell: 'Lumos',
      message: `Failed to execute Lumos: ${error instanceof Error ? error.message : String(error)}`,
      timestamp: new Date().toISOString(),
    };
  }
}
