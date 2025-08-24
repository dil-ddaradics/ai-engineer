import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

/**
 * Lumos Resource - Shows current state information
 * This is a placeholder implementation that will be extended with actual state machine integration
 */
export function registerLumosResource(server: McpServer): void {
  server.registerResource(
    'lumos',
    'lumos://current',
    {
      title: 'Current AI Engineer State',
      description: 'Shows the current state of the AI Engineer workflow',
      mimeType: 'application/json',
    },
    async uri => {
      // Placeholder implementation - will be replaced with actual state machine integration
      // In real implementation, this would read from .ai/task/state.json
      const currentState = {
        state: 'PLACEHOLDER_STATE',
        timestamp: new Date().toISOString(),
        message: 'Lumos resource called - placeholder implementation',
        availableSpells: ['Accio', 'Expecto', 'Reparo', 'Reverto', 'Finite', 'Lumos'],
        description: 'State-driven behavior - will read current state from .ai/task/ files',
        note: 'Parameter-less implementation - state determined by file system inspection',
      };

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(currentState, null, 2),
          },
        ],
      };
    }
  );
}

/**
 * Register all spell resources with the MCP server
 * Designed to be extendable for future spell resources
 */
export function registerSpellResources(server: McpServer): void {
  registerLumosResource(server);
}
