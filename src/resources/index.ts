import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register all resources with the MCP server
 */
export function registerResources(server: McpServer): void {
  // Simple greeting resource
  server.registerResource(
    "greeting",
    new ResourceTemplate("greeting://{name}", {
      list: async () => ({ 
        resources: [{ 
          name: "greeting-world", 
          uri: "greeting://world",
          title: "Default Greeting"
        }] 
      })
    }),
    { 
      title: "Greeting Resource",
      description: "Provides a personalized greeting"
    },
    async (uri, { name }) => {
      const nameStr = typeof name === 'string' ? name : 'world';
      
      return {
        contents: [{
          uri: uri.href,
          text: `Hello, ${nameStr}! Welcome to the AI Engineer MCP Server.`
        }]
      };
    }
  );
}