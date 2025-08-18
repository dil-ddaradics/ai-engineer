# AI Engineer MCP Server

A Model Context Protocol (MCP) server designed for AI engineering tasks. This server provides resources and tools to assist with AI model evaluation, prompt engineering, and best practices.

## Features

### Resources

- **AI Engineering Frameworks** - Information about popular frameworks for machine learning, NLP, computer vision, and more
- **AI Best Practices** - Guidance on testing, deployment, monitoring, and ethical considerations for AI systems

### Tools

- **AI Model Evaluator** - Evaluates AI model metrics and provides recommendations
- **AI Prompt Generator** - Creates structured prompts for different AI tasks

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

## Available Resources

### Frameworks

Access information about AI engineering frameworks:

```
frameworks://ml       # Machine learning frameworks
frameworks://nlp      # NLP frameworks
frameworks://cv       # Computer vision frameworks
frameworks://rl       # Reinforcement learning frameworks
frameworks://data     # Data processing frameworks
frameworks://all      # List all categories
```

### Best Practices

Access AI engineering best practices:

```
best-practices://testing      # Testing best practices
best-practices://deployment   # Deployment best practices
best-practices://monitoring   # Monitoring best practices
best-practices://ethics       # Ethical considerations
best-practices://all          # List all topics
```

## Available Tools

### evaluate-model

Evaluates AI model metrics and provides recommendations.

Parameters:
- `modelType`: "classification", "regression", or "generative"
- `accuracy`: Model accuracy (0-1)
- `precision`: Model precision (0-1) - optional for regression
- `recall`: Model recall (0-1) - optional for regression
- `f1Score`: Model F1 score (0-1) - optional

### generate-prompt

Generates structured prompts for different AI tasks.

Parameters:
- `taskType`: "text-classification", "image-generation", "code-completion", or "question-answering"
- `context`: Specific context or domain for the prompt
- `complexity`: "simple", "moderate", or "complex"

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