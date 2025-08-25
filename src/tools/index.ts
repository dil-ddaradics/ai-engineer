import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  accioTool,
  accioInputSchema,
  expectoTool,
  expectoInputSchema,
  reparoTool,
  reparoInputSchema,
  revertoTool,
  revertoInputSchema,
  finiteTool,
  finiteInputSchema,
  lumosTool,
} from './spells.js';

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  // Spell tools
  server.registerTool(
    'accio',
    {
      title: 'Accio Spell',
      description: 'Advances workflow to next step',
      inputSchema: accioInputSchema,
    },
    async () => {
      const result = await accioTool();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'expecto',
    {
      title: 'Expecto Spell',
      description: 'Enriches plan from Atlassian resources',
      inputSchema: expectoInputSchema,
    },
    async () => {
      const result = await expectoTool();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'reparo',
    {
      title: 'Reparo Spell',
      description: 'Initiates or continues PR review process',
      inputSchema: reparoInputSchema,
    },
    async () => {
      const result = await reparoTool();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'reverto',
    {
      title: 'Reverto Spell',
      description: 'Exits PR review flow',
      inputSchema: revertoInputSchema,
    },
    async () => {
      const result = await revertoTool();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'finite',
    {
      title: 'Finite Spell',
      description: 'Returns to plan editing',
      inputSchema: finiteInputSchema,
    },
    async () => {
      const result = await finiteTool();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    'lumos',
    {
      title: 'Lumos Spell',
      description: 'Shows current state and available actions',
      inputSchema: {},
    },
    async () => {
      const result = await lumosTool();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );
}
