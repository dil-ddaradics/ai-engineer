import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

/**
 * Register all tools with the MCP server
 */
export function registerTools(server: McpServer): void {
  // Simple addition tool
  server.registerTool(
    "add",
    {
      title: "Addition Tool",
      description: "Adds two numbers together",
      inputSchema: {
        a: z.number().describe("First number"),
        b: z.number().describe("Second number")
      }
    },
    async ({ a, b }) => {
      const sum = a + b;
      
      return {
        content: [{ 
          type: "text", 
          text: `${a} + ${b} = ${sum}` 
        }]
      };
    }
  );
}