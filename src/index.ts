import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerResources } from './resources/index.js';
import { registerTools } from './tools/index.js';
import { logger } from './utils/logger.js';

// CRITICAL: Protect STDOUT from accidental writes
// Override console.log to use stderr instead
console.log = function (...args) {
  console.error(...args);
};

// Create server instance
const server = new McpServer({
  name: 'ai-engineer',
  version: '1.0.0',
});

// Start the server
async function main() {
  // Always log to stderr
  console.error(`[${new Date().toISOString()}] AI Engineer MCP Server initializing`);
  await logger.info('MCP Server initializing');

  // Register all resources and tools
  registerResources(server);
  registerTools(server);
  await logger.info('Resources and tools registered');

  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[${new Date().toISOString()}] MCP Server started successfully`);
    await logger.info('MCP Server started successfully');
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error starting MCP server:`, err);
    await logger.error(`Error starting MCP server: ${err}`);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error(`[${new Date().toISOString()}] Received SIGINT, shutting down`);
  logger.info('Received SIGINT, shutting down').finally(() => process.exit(0));
});

process.on('SIGTERM', () => {
  console.error(`[${new Date().toISOString()}] Received SIGTERM, shutting down`);
  logger.info('Received SIGTERM, shutting down').finally(() => process.exit(0));
});

// Start the server
main().catch(err => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  logger.error(`Unhandled error: ${err}`).finally(() => process.exit(1));
});
