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
import { registerResources } from "./resources/index.js";
import { registerTools } from "./tools/index.js";

// CRITICAL: Protect STDOUT from accidental writes
// Override console.log to use stderr instead
console.log = function(...args) {
  console.error(...args);
};

// Create server instance
const server = new McpServer({
  name: "ai-engineer",
  version: "1.0.0"
});

// Start the server
async function main() {
  // Always log to stderr
  console.error(`[${new Date().toISOString()}] AI Engineer MCP Server initializing`);
  
  // Register all resources and tools
  registerResources(server);
  registerTools(server);
  
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[${new Date().toISOString()}] MCP Server started successfully`);
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error starting MCP server:`, err);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.error(`[${new Date().toISOString()}] Received SIGINT, shutting down`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error(`[${new Date().toISOString()}] Received SIGTERM, shutting down`);
  process.exit(0);
});

// Start the server
main().catch(err => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
  process.exit(1);
});
```

## Implementing Resources

Resources provide data to AI assistants. Here's how to implement a simple resource:

### Basic Resource Implementation

```typescript
import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Register a greeting resource
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
        text: `Hello, ${nameStr}! Welcome to AI Sandbox MCP Server.`
      }]
    };
  }
);
```

### Resource Template Best Practices

When implementing resources, follow these best practices:

#### 1. Proper `list` Callback Implementation

The `list` callback must return a specific structure:

```typescript
// CORRECT list callback implementation
{
  list: async () => ({
    resources: [{ 
      name: "resource-name", // Required
      uri: "resource://uri",  // Required
      title: "Human-readable title", // Optional but recommended
      description: "Resource description" // Optional
    }]
  })
}
```

#### 2. Parameter Type Checking

Always check parameter types since they can be undefined or non-string:

```typescript
async (uri, { param }) => {
  // Always check parameter type
  const paramValue = typeof param === 'string' ? param : 'defaultValue';
  
  // Rest of implementation...
}
```

#### 3. Error Handling

Implement proper error handling in resources:

```typescript
async (uri, { id }) => {
  try {
    // Parameter validation
    if (typeof id !== 'string' || !id.match(/^\d+$/)) {
      return {
        contents: [{
          uri: uri.href,
          text: `Error: Invalid ID format. Must be numeric.`
        }],
        status: 400
      };
    }
    
    // Resource implementation
    const data = await fetchData(id);
    
    return {
      contents: [{
        uri: uri.href,
        text: `Data: ${JSON.stringify(data)}`
      }]
    };
  } catch (error) {
    console.error(`Error processing resource: ${error}`);
    return {
      contents: [{
        uri: uri.href,
        text: `Error processing request: ${error.message}`
      }],
      status: 500
    };
  }
}
```

#### 4. Default Values

Always provide default values for optional parameters:

```typescript
// Good practice for resource with multiple parameters
new ResourceTemplate("data://{category}/{format}", {
  list: async () => ({
    resources: [
      { name: "data-json", uri: "data://products/json", title: "Products (JSON)" },
      { name: "data-csv", uri: "data://products/csv", title: "Products (CSV)" }
    ]
  })
}),
{ title: "Data Resource", description: "Product data in various formats" },
async (uri, { category, format }) => {
  const categoryValue = typeof category === 'string' ? category : 'products';
  const formatValue = typeof format === 'string' ? format : 'json';
  
  // Implementation...
}
```

#### 5. Resource Naming Conventions

Follow consistent naming conventions for resources:

- Use kebab-case for resource names: `resource-name`
- Use clear, descriptive titles: "User Profile Resource"
- Include version information when applicable: `api-v1`

## Implementing Tools

Tools allow AI assistants to perform actions. Here's how to implement tools:

### Basic Tool Implementation

```typescript
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
```

### Tool Implementation Best Practices

#### 1. Proper Input Validation

Always validate your tool inputs:

```typescript
server.registerTool(
  "search",
  {
    title: "Search Tool",
    description: "Search for content",
    inputSchema: {
      query: z.string().min(1).describe("Search query"),
      limit: z.number().optional().default(10).describe("Maximum results")
    }
  },
  async ({ query, limit }) => {
    // Input validation is handled by zod schema
    try {
      const results = await performSearch(query, limit);
      return {
        content: [{ 
          type: "text", 
          text: `Found ${results.length} results for "${query}":\n\n${results.join("\n")}`
        }]
      };
    } catch (error) {
      console.error(`Search error: ${error}`);
      return {
        content: [{ 
          type: "text", 
          text: `Error performing search: ${error.message}`
        }],
        isError: true
      };
    }
  }
);
```

#### 2. Structured Error Handling

Use the `isError` property to indicate error states:

```typescript
async ({ id }) => {
  try {
    const data = await fetchData(id);
    
    if (!data) {
      return {
        content: [{ 
          type: "text", 
          text: `No data found for ID: ${id}`
        }],
        isError: true  // Mark as error
      };
    }
    
    return {
      content: [{ 
        type: "text", 
        text: `Data: ${JSON.stringify(data, null, 2)}`
      }]
    };
  } catch (error) {
    return {
      content: [{ 
        type: "text", 
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
}
```

#### 3. Proper Description for Parameters

Use descriptive parameter definitions:

```typescript
inputSchema: {
  longitude: z.number()
    .min(-180).max(180)
    .describe("Longitude coordinate (-180 to 180)"),
  
  latitude: z.number()
    .min(-90).max(90)
    .describe("Latitude coordinate (-90 to 90)"),
  
  radius: z.number()
    .positive()
    .describe("Search radius in kilometers")
}
```

#### 4. Return Rich Responses

Use multiple content types to provide rich responses:

```typescript
return {
  content: [
    { 
      type: "text", 
      text: "Here are the search results:" 
    },
    {
      type: "resource_link",
      uri: "files://results/search.csv",
      name: "search-results.csv",
      mimeType: "text/csv",
      description: "CSV file with search results"
    }
  ]
};
```

## Testing Your MCP Server

### 1. Add Script to package.json

```json
{
  "scripts": {
    "dev": "ts-node --esm src/index.ts",
    "build": "npx @vercel/ncc build src/index.ts -o dist",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/test/**/*.test.js"],
    "verbose": true,
    "testTimeout": 30000
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

## TypeScript Gotchas and Solutions

When developing MCP servers with TypeScript, there are several common issues that can cause compilation errors or runtime bugs. Here's how to identify and fix them:

### Resource Template Type Errors

#### Issue: Invalid `list` Return Type

```typescript
// ERROR: Type 'string[]' is not assignable to type 'ListResourcesCallback'
new ResourceTemplate("greeting://{name}", {
  list: () => ["greeting://world"]
})
```

**Solution**: Return the correct structure:

```typescript
new ResourceTemplate("greeting://{name}", {
  list: async () => ({
    resources: [{ 
      name: "greeting-world", 
      uri: "greeting://world" 
    }]
  })
})
```

#### Issue: Missing Required Properties

```typescript
// ERROR: Property 'name' is missing in type '{ uri: string; }'
new ResourceTemplate("greeting://{name}", {
  list: async () => ({
    resources: [{ uri: "greeting://world" }]
  })
})
```

**Solution**: Include all required properties:

```typescript
new ResourceTemplate("greeting://{name}", {
  list: async () => ({
    resources: [{ 
      name: "greeting-world", // Required
      uri: "greeting://world" // Required
    }]
  })
})
```

### Parameter Handling Errors

#### Issue: Not Checking Parameter Types

```typescript
// ERROR: Object is possibly 'undefined'
async (uri, { name }) => {
  return {
    contents: [{
      uri: uri.href,
      text: `Hello, ${name.toUpperCase()}!` // Runtime error if name is undefined
    }]
  };
}
```

**Solution**: Always check parameter types:

```typescript
async (uri, { name }) => {
  const nameStr = typeof name === 'string' ? name : 'world';
  return {
    contents: [{
      uri: uri.href,
      text: `Hello, ${nameStr.toUpperCase()}!`
    }]
  };
}
```

### ESM Import Issues

#### Issue: Missing .js Extensions

When using ESM, TypeScript requires explicit `.js` extensions in import statements, even though the files have `.ts` extensions in the source code:

```typescript
// ERROR: Cannot find module './resources/index' or its corresponding type declarations
import { registerResources } from "./resources/index";
```

**Solution**: Add `.js` extension to import statements:

```typescript
// CORRECT: TypeScript will resolve this correctly in ESM mode
import { registerResources } from "./resources/index.js";
```

### Tool Schema Type Errors

#### Issue: Invalid Zod Schema

```typescript
// ERROR: Type 'z.ZodObject<...>' is not assignable to type 'InputObjectSchema'
server.registerTool(
  "add",
  {
    inputSchema: z.object({
      a: z.number(),
      b: z.number()
    })
  },
  async (args) => { /* implementation */ }
)
```

**Solution**: Use the object literal syntax:

```typescript
server.registerTool(
  "add",
  {
    inputSchema: {
      a: z.number(),
      b: z.number()
    }
  },
  async ({ a, b }) => { /* implementation */ }
)
```

### Build Configuration Issues

#### Issue: Output Files Not Generated Correctly

When your built files aren't working correctly:

**Solution**: Ensure your `tsconfig.json` is properly configured:

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