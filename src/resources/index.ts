import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSpellResources } from "./spells.js";

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer): void {
  // Register spell resources
  registerSpellResources(server);
}