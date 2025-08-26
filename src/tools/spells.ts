// Input schemas for spell tools (MCP format) - All spells are parameter-less
export const accioInputSchema = {};

export const expectoInputSchema = {};

export const reparoInputSchema = {};

export const revertoInputSchema = {};

export const finiteInputSchema = {};

import { AiEngineerStateMachine } from '../state-machine/stateMachine.js';
import { JsonFileStateRepository } from '../state-machine/stateRepository.js';
import { NodeFileSystem } from '../state-machine/fileSystem.js';

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
    return result.message;
  } catch (error) {
    return `Failed to execute Accio: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function expectoTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Expecto');
    return result.message;
  } catch (error) {
    return `Failed to execute Expecto: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function reparoTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Reparo');
    return result.message;
  } catch (error) {
    return `Failed to execute Reparo: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function revertoTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Reverto');
    return result.message;
  } catch (error) {
    return `Failed to execute Reverto: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function lumosTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Lumos');
    return result.message;
  } catch (error) {
    return `Failed to execute Lumos: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function finiteTool() {
  try {
    const stateMachine = getStateMachine();
    const result = await stateMachine.executeSpell('Finite');
    return result.message;
  } catch (error) {
    return `Failed to execute Finite: ${error instanceof Error ? error.message : String(error)}`;
  }
}
