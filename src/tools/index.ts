import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  advanceTool, 
  advanceInputSchema, 
  resetTool,
  appendLogTool,
  appendLogInputSchema
} from "./orchestrator.js";

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
}