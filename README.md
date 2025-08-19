# AI Engineer MCP Server

A Model Context Protocol (MCP) server designed for AI engineering tasks. This server provides resources and tools to assist with AI model evaluation, prompt engineering, and best practices.

## Features

### Resources

- **AI Engineering Frameworks** - Information about popular frameworks for machine learning, NLP, computer vision, and more
- **AI Best Practices** - Guidance on testing, deployment, monitoring, and ethical considerations for AI systems

### Tools

- **MCP Orchestrator** - Coordinates task execution between users and AI agents

## MCP Orchestrator

The MCP Orchestrator is a proof-of-concept that demonstrates how MCP can coordinate task execution between users and AI agents without requiring a complex state machine.

### How It Works

1. The user (via the AI agent) calls the `advance` tool.
2. On first call:
   - MCP creates `.ai/task/task.md` (a task template)
   - MCP instructs both the AI agent and user what to do next
3. On subsequent calls:
   - MCP reads `.ai/task/task.md`
   - MCP instructs the AI agent to execute what's written there
   - MCP gives the user a brief summary of what will happen

### File Structure

- `.ai/task/task.md` - Contains the task definition with goal, steps, and validation criteria
- `.ai/task/task.log` - Contains a log of task execution progress

### Usage Flow

1. User says: "advance" → the agent calls the `advance` tool
2. If response `mode: "draft"`:
   - Task template is created
   - Agent explains how to fill it out
3. User and agent collaborate on `.ai/task/task.md`
4. User says: "advance" again
5. If response `mode: "execute"`:
   - Agent summarizes what will happen
   - Agent executes the steps
   - Agent logs progress to `.ai/task/task.log`
6. To start over, use the `reset` tool

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-engineer.git
cd ai-engineer

# Install dependencies
npm install
```

## Development

```bash
# Run the server in development mode
npm run dev
```

## Building

The server can be built into a single file using @vercel/ncc:

```bash
# Build the server
npm run build
```

This creates a standalone executable in the `dist` directory.

## Running

```bash
# Run the built server
npm start
```

## Using with Claude Code

To use this MCP server with Claude Code:

```bash
# Add the MCP server to Claude Code
claude mcp add --transport stdio ai-engineer -- 'npm start --prefix /path/to/ai-engineer'
```

For more reliable configuration:

```bash
# Using add-json for precise control
claude mcp add-json ai-engineer '{
  "type": "stdio",
  "command": "/absolute/path/to/node",
  "args": ["/absolute/path/to/ai-engineer/dist/index.js"],
  "env": { "NODE_NO_WARNINGS": "1" }
}'
```

## Available Tools

### advance

The `advance` tool is part of the MCP Orchestrator, which helps coordinate task execution between users and the AI agent. This tool either creates a task template or executes an existing task.

Parameters:
- `reason`: String (free text) explaining why you're advancing the task

When called:
- If `.ai/task/task.md` doesn't exist: Creates a task template file and enters "draft" mode
- If `.ai/task/task.md` exists: Enters "execute" mode to carry out the steps in the file

### reset

Resets the orchestrator by deleting the task file.

No parameters required.

### append_log

Appends a message to the task log file.

Parameters:
- `message`: The message to add to the log

## Troubleshooting

If you encounter connection issues with Claude Code:

1. Ensure all console output uses stderr, not stdout
2. Use absolute paths for both the Node executable and your server script
3. Check the log files at `~/Library/Logs/Claude/mcp*.log`
4. Use the MCP Inspector tool to validate your server:

```bash
npx -y @modelcontextprotocol/inspector --cli --method tools/list -- \
  /absolute/path/to/node /absolute/path/to/ai-engineer/dist/index.js
```

## License

ISC