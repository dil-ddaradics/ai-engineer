import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  advanceTool, 
  advanceInputSchema, 
  resetTool,
  appendLogTool,
  appendLogInputSchema
} from "./orchestrator.js";
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
  finiteInputSchema
} from "./spells.js";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  // Orchestrator tools
  server.registerTool(
    "advance",
    {
      title: "Orchestrator Advance Tool",
      description: "POC: orchestrate by drafting or executing a task.md.",
      inputSchema: advanceInputSchema
    },
    async (params) => {
      const result = await advanceTool(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "reset",
    {
      title: "Orchestrator Reset Tool",
      description: "Resets the orchestrator by deleting task.md.",
      inputSchema: {}
    },
    async () => {
      const result = await resetTool();
      return {
        content: [
          {
            type: "text",
            text: result.message
          }
        ]
      };
    }
  );

  server.registerTool(
    "append_log",
    {
      title: "Append Log Tool",
      description: "Appends a message to the task log file.",
      inputSchema: appendLogInputSchema
    },
    async (params) => {
      const result = await appendLogTool(params);
      return {
        content: [
          {
            type: "text",
            text: result.message
          }
        ]
      };
    }
  );

  // Spell tools
  server.registerTool(
    "accio",
    {
      title: "Accio Spell",
      description: "Advances workflow to next step",
      inputSchema: accioInputSchema
    },
    async (params) => {
      const result = await accioTool(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "expecto",
    {
      title: "Expecto Spell",
      description: "Enriches plan from Atlassian resources",
      inputSchema: expectoInputSchema
    },
    async (params) => {
      const result = await expectoTool(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "reparo",
    {
      title: "Reparo Spell",
      description: "Initiates or continues PR review process",
      inputSchema: reparoInputSchema
    },
    async (params) => {
      const result = await reparoTool(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "reverto",
    {
      title: "Reverto Spell",
      description: "Exits PR review flow",
      inputSchema: revertoInputSchema
    },
    async (params) => {
      const result = await revertoTool(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );

  server.registerTool(
    "finite",
    {
      title: "Finite Spell",
      description: "Returns to plan editing",
      inputSchema: finiteInputSchema
    },
    async (params) => {
      const result = await finiteTool(params);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2)
          }
        ]
      };
    }
  );
}