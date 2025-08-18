# How to Build an MCP Server with TypeScript

This guide provides step-by-step instructions for creating a Model Context Protocol (MCP) server using TypeScript. MCP servers allow AI assistants like Claude to access custom tools and resources.

## Table of Contents

- [Introduction to MCP](#introduction-to-mcp)
- [Prerequisites](#prerequisites)
- [Setting Up Your Environment](#setting-up-your-environment)
- [Creating a Basic MCP Server](#creating-a-basic-mcp-server)
- [Implementing Resources](#implementing-resources)
- [Implementing Tools](#implementing-tools)
- [Testing Your MCP Server](#testing-your-mcp-server)
- [Troubleshooting MCP Server Connections](#troubleshooting-mcp-server-connections)
- [Integration with AI Sandbox](#integration-with-ai-sandbox)
- [Publishing to GitHub](#publishing-to-github)

## Introduction to MCP

Model Context Protocol (MCP) is an open-source standard that allows AI assistants to interact with external tools, databases, and APIs. MCP servers provide:

- **Resources**: Data that can be accessed (similar to GET endpoints)
- **Tools**: Functions that can be executed (similar to POST endpoints)
- **Prompts**: Reusable templates for LLM interactions

MCP servers can be used to extend the capabilities of AI assistants, allowing them to access custom data sources and functionality.

## Prerequisites

Before you begin, ensure you have:

- Node.js v18.x or higher
- npm or yarn
- Basic understanding of TypeScript
- Git for version control

## Setting Up Your Environment

### 1. Create Project Structure

```bash
mkdir mcp-server
cd mcp-server
```

### 2. Initialize TypeScript Project

```bash
npm init -y
npm install typescript @types/node ts-node --save-dev
npx tsc --init
```

### 3. Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk zod
```

### 4. Configure TypeScript

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 5. Project Structure

Create the following directory structure:

```
mcp-server/
├── src/
│   ├── index.ts        # Entry point
│   ├── resources/      # Resource implementations
│   └── tools/          # Tool implementations
├── tsconfig.json
├── package.json
└── README.md
```

## Creating a Basic MCP Server

### 1. Create Entry Point

Create `src/index.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create server instance
const server = new McpServer({
  name: "ai-sandbox-mcp",
  version: "0.1.0"
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server started");
}

main().catch(err => {
  console.error("Error starting MCP server:", err);
  process.exit(1);
});
```

## Implementing Resources

Resources provide data to AI assistants. Here's how to implement a simple resource:

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Register a greeting resource
server.registerResource(
  "greeting",
  new ResourceTemplate("greeting://{name}", { list: undefined }),
  { 
    title: "Greeting Resource",
    description: "Provides a personalized greeting"
  },
  async (uri, { name }) => ({
    contents: [{
      uri: uri.href,
      text: `Hello, ${name}! Welcome to AI Sandbox MCP Server.`
    }]
  })
);
```

## Implementing Tools

Tools allow AI assistants to perform actions. Here's how to implement a simple tool:

```typescript
import { z } from "zod";

// Register an addition tool
server.registerTool(
  "add",
  {
    title: "Addition Tool",
    description: "Add two numbers together",
    inputSchema: {
      a: z.number().describe("First number"),
      b: z.number().describe("Second number")
    }
  },
  async ({ a, b }) => ({
    content: [{ 
      type: "text", 
      text: `${a} + ${b} = ${a + b}` 
    }]
  })
);
```

## Testing Your MCP Server

### 1. Add Script to package.json

```json
{
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

### 2. Running the Server

```bash
npm start
```

### 3. Testing with Claude Code

```bash
claude mcp add --transport stdio my-mcp -- 'npm start --prefix /path/to/mcp-server'
```

## Troubleshooting MCP Server Connections

When working with MCP servers, connection issues can be difficult to diagnose because they often don't produce clear error messages. Here's how to troubleshoot and solve common problems.

### 1. Protecting STDOUT (Critical for JSON-RPC)

The most common MCP connection issue is STDOUT contamination. With stdio transport, any non-JSON output on STDOUT breaks the JSON-RPC protocol:

```typescript
// In your main entry point file:

// CRITICAL: Protect STDOUT from accidental writes
// Override console.log to use stderr instead
console.log = function(...args) {
  console.error(...args);
};

// Always log to stderr
console.error(`[${new Date().toISOString()}] MCP Server initializing`);
```

For npm scripts or CLI wrappers:

```javascript
// In your CLI wrapper:
// Force stderr usage for all console output
console.log = console.error;
```

### 2. Reliable MCP Server Configuration

Instead of using the basic `claude mcp add` command, use `claude mcp add-json` for precise control:

```bash
# Remove existing configuration if needed
claude mcp remove my-mcp-server -s local

# Add with precise JSON configuration
claude mcp add-json my-mcp-server '{
  "type": "stdio",
  "command": "/absolute/path/to/node",
  "args": ["/absolute/path/to/your/mcp-server/dist/index.js"],
  "env": { "NODE_NO_WARNINGS": "1" }
}'
```

This approach avoids:
- Command line parsing/quoting issues
- Path resolution problems 
- Environment variable inconsistencies

### 3. Using Absolute Paths

Always use absolute paths for both the Node executable and your server script:

```bash
# Bad (relies on PATH and working directory)
claude mcp add --transport stdio my-mcp -- 'node index.js'

# Good (fully specified paths)
claude mcp add-json my-mcp '{
  "type": "stdio", 
  "command": "/usr/local/bin/node",
  "args": ["/Users/username/projects/mcp-server/dist/index.js"]
}'
```

### 4. Setting Environment Variables

Some useful environment variables for debugging and stability:

```bash
# Prevent Node warnings from breaking JSON-RPC
"env": { "NODE_NO_WARNINGS": "1" }

# Increase timeout for slow-starting servers
MCP_TIMEOUT=20000 claude mcp list
```

### 5. Diagnostics and Testing

Create a test script that simulates Claude Code's connection:

```javascript
// test-connection.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const SERVER_SCRIPT = path.resolve(__dirname, '../dist/index.js');
const NODE_PATH = process.execPath;

const serverProcess = spawn(NODE_PATH, [SERVER_SCRIPT], {
  stdio: ['pipe', 'pipe', 'inherit'] // Pipe stdin/stdout, inherit stderr
});

// Listen for server output
serverProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  console.log(`[SERVER OUT] ${output}`);
  
  try {
    // Try to parse as JSON to verify protocol compliance
    JSON.parse(output);
    console.log('✓ Received valid JSON response');
  } catch (err) {
    console.error('✗ Received non-JSON output - breaks MCP protocol!');
  }
});

// Send a test request
const request = {
  jsonrpc: '2.0',
  method: 'tools/list',
  id: 1
};

console.log('Sending test request...');
serverProcess.stdin.write(JSON.stringify(request) + '\n');
```

Run this with:

```bash
node test-connection.js
```

### 6. Using MCP Inspector

The MCP Inspector tool helps validate your server:

```bash
npx -y @modelcontextprotocol/inspector --cli --method tools/list -- \
  /absolute/path/to/node /absolute/path/to/your/mcp-server/dist/index.js
```

If Inspector connects but Claude Code doesn't, it's likely a configuration issue.

### 7. Common Error Patterns

If your server shows as "Failed to connect" in Claude Code:

- Check if Node warnings are appearing on STDOUT
- Verify all console output uses stderr not stdout
- Look for third-party libraries that might write to STDOUT
- Examine log files at `~/Library/Logs/Claude/mcp*.log`
- Use `claude mcp get my-mcp-server` to verify configuration

## Integration with AI Sandbox

To integrate your MCP server with AI Sandbox:

1. Place your MCP server in the AI Sandbox project structure
2. Update Docker configuration to include necessary dependencies
3. Create scripts to start and stop the MCP server
4. Document how to use the MCP server with Claude in AI Sandbox

## Publishing to GitHub

### 1. Initialize Git Repository (if not already in a repo)

```bash
git init
git add .
git commit -m "Initial MCP server implementation"
```

### 2. Create GitHub Repository

1. Go to GitHub and create a new repository
2. Follow the instructions to push to an existing repository

```bash
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

### 3. Create Release (Optional)

1. On GitHub, go to your repository
2. Click on "Releases"
3. Click "Create a new release"
4. Enter version number (e.g., v0.1.0)
5. Add release notes
6. Publish the release

## Next Steps

- Add more complex resources and tools
- Implement authentication
- Add error handling and logging
- Create comprehensive tests
- Document your MCP server API

This guide provides the basics to get started with building an MCP server using TypeScript. As you develop more features, be sure to keep your documentation updated and follow best practices for TypeScript development.