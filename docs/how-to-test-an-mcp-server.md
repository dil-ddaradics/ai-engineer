# MCP Inspector — Manual & Automated Testing Guide

A practical, copy‑pasteable guide for exercising any MCP server with **@modelcontextprotocol/inspector** — both **manually (UI)** and **automated (CLI/CI)**. Works with stdio, SSE, and streamable‑HTTP transports.

---

## 0) Prerequisites
- **Node.js** ≥ 22.7 (Inspector requirement).
- Your MCP server entrypoint (e.g., `node build/index.js`) or a remote SSE/HTTP endpoint.
- macOS/Linux/WSL terminal.

> Tip: The Inspector runs two processes:
> - **Client UI** on port **6274**
> - **Proxy** on port **6277**
    > You can override via `CLIENT_PORT` and `SERVER_PORT`.

---

## 1) Quick Start

### UI (manual testing)
```bash
# Open the Inspector UI
npx @modelcontextprotocol/inspector
```
- The browser opens at `http://localhost:6274` (first run will include a session token in the URL).
- In the left sidebar, choose a **transport** and configure:
    - **stdio**: Command, Args, Env
    - **sse**: Remote URL (and optional auth header in UI)
    - **streamable-http**: Remote URL
- Click **Connect**.

### CLI (scriptable/CI)
```bash
# Connect to a local stdio server entrypoint and list tools
npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list

# Connect to a remote SSE server and list resources
npx @modelcontextprotocol/inspector --cli https://your-server.example/sse --method resources/list

# Call a tool with arguments
npx @modelcontextprotocol/inspector --cli node build/index.js \
  --method tools/call --tool-name myTool \
  --tool-arg query="hello" --tool-arg limit=5

# Streamable HTTP transport explicitly
npx @modelcontextprotocol/inspector --cli https://your-server.example/mcp \
  --transport http --method tools/list
```

---

## 2) Manual Testing Workflow (UI)
1. **Launch**
   ```bash
   npx @modelcontextprotocol/inspector
   ```
    - Keep the terminal open; it shows proxy logs and your one‑time session token.

2. **Pick a transport** in the left sidebar:
    - **stdio**: Fill **Command** (e.g., `node`) and **Args** (e.g., `build/index.js --debug`). Use the **Env** table to inject variables (e.g., `API_KEY`).
    - **sse**: Paste your server’s SSE endpoint (e.g., `http://localhost:8787/sse`). If your server requires **Bearer auth**, enter the token and (if needed) a custom header name.
    - **streamable-http**: Paste the base HTTP endpoint (e.g., `http://localhost:8787/mcp`).

3. **Connect** then explore tabs:
    - **Resources**: View metadata, `uri`, `mimeType`, and **open content**. Use **Subscribe** to test live updates if supported.
    - **Prompts**: Inspect prompt definitions, fill parameters, and preview rendered messages.
    - **Tools**: Browse tool list; each tool shows input schema. Use the form to invoke and inspect **results**, **errors**, and **progress** events.
    - **Notifications**: Live feed of server logs/diagnostics (MCP `notifications/logMessage`, etc.).

4. **Export configuration** (top-right):
    - **Server Entry** → copies one server block you can paste into a `mcp.json`.
    - **Servers File** → copies a full `mcp.json` with the current server as `default-server`.

5. **Reconnect quickly** via URL params (optional), e.g.:
    - `http://localhost:6274/?transport=sse&serverUrl=http://localhost:8787/sse`
    - `http://localhost:6274/?transport=stdio&serverCommand=npx&serverArgs=@modelcontextprotocol/server-everything`

---

## 3) Automated Testing (CLI)
The Inspector’s **`--cli`** mode creates a short‑lived MCP client, prints machine‑readable output, and exits. Great for smoke tests and CI.

### 3.1 Minimal commands
```bash
# Use a config file (see §6) and pick a server by name
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver --method tools/list

# Call a tool with args
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver \
  --method tools/call --tool-name search --tool-arg q="anthropic" --tool-arg limit=3

# List prompts / resources
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver --method prompts/list
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver --method resources/list
```

### 3.2 Assert with `jq`
```bash
# Verify a required tool exists
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver --method tools/list \
  | jq -e '.tools | map(.name) | index("search") != null'

# Sanity check a tool call returns expected shape
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver \
  --method tools/call --tool-name search --tool-arg q=ping \
  | jq -e 'has("content") or has("result")'
```
Non‑zero `jq -e` exit codes will **fail** your shell/CI step.

### 3.3 Golden output tests
```bash
# Generate a golden file once
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver \
  --method tools/list | jq > tests/gold/tools-list.json

# Compare in CI
npx @modelcontextprotocol/inspector --cli --config mcp.json --server myserver \
  --method tools/list | jq --sort-keys \
  | diff -u tests/gold/tools-list.json -
```

### 3.4 Exit codes
- **0** on success (method call completed)
- **≠0** on connection/protocol error or tool error propagated as failure (useful for CI gates)

---

## 4) CI Integration Examples

### 4.1 GitHub Actions (stdio server)
```yaml
name: mcp-smoke
on: [push]
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - name: Start inspector CLI smoke tests
        run: |
          npx @modelcontextprotocol/inspector --cli node build/index.js --method tools/list | jq '.'
          npx @modelcontextprotocol/inspector --cli node build/index.js \
            --method tools/call --tool-name health --tool-arg ping=true | jq '.'
```

### 4.2 GitHub Actions (remote SSE / HTTP)
```yaml
- name: SSE server smoke
  run: |
    npx @modelcontextprotocol/inspector --cli https://api.example.com/sse --method tools/list | jq '.'

- name: Streamable HTTP smoke
  run: |
    npx @modelcontextprotocol/inspector --cli https://api.example.com/mcp \
      --transport http --method tools/list | jq '.'
```

> Authentication: For SSE endpoints that require a token, prefer **UI/manual testing** or add auth in your reverse proxy. If your CLI flow needs headers, run through a proxy that injects them, or wrap the call in a small script until first‑class header flags are available.

---

## 5) Local Dev Shortcuts

### 5.1 One‑liners for common servers
```bash
# Filesystem reference server (browse local files)
npx -y @modelcontextprotocol/inspector npx @modelcontextprotocol/server-filesystem "$HOME"

# "Everything" server (kitchen sink)
npx -y @modelcontextprotocol/inspector npx @modelcontextprotocol/server-everything
```

### 5.2 Port & host overrides
```bash
CLIENT_PORT=8080 SERVER_PORT=9000 \
npx @modelcontextprotocol/inspector node build/index.js
```

### 5.3 Env injection & flag separation
```bash
# Inject env vars into your server
npx @modelcontextprotocol/inspector -e API_KEY=$MY_KEY -e DEBUG=true node build/index.js

# Use `--` to separate inspector flags from server args
npx @modelcontextprotocol/inspector -e FOO=bar -- node build/index.js --server-flag
```

### 5.4 Reproducible configs (mcp.json)
```json
{
  "mcpServers": {
    "default-server": {
      "command": "node",
      "args": ["build/index.js", "--debug"],
      "env": { "API_KEY": "your-api-key" }
    },
    "my-sse": {
      "type": "sse",
      "url": "http://localhost:8787/sse"
    },
    "my-http": {
      "type": "streamable-http",
      "url": "http://localhost:8787/mcp"
    }
  }
}
```
Use it with:
```bash
npx @modelcontextprotocol/inspector --cli --config mcp.json --server default-server --method tools/list
```

---

## 6) Security Checklist (highly recommended)
- **Upgrade** Inspector to a **patched version** (0.14.1+). Use latest available.
- **Keep auth enabled** (session token is on by default). **Do not** set `DANGEROUSLY_OMIT_AUTH=true`.
- **Bind to localhost** (default). Only use `HOST=0.0.0.0` on trusted networks.
- If exposing over the network, put Inspector behind a secure tunnel/reverse proxy that enforces **auth** and **Origin** checks.
- Rotate tokens and avoid leaking them in logs or CI output.

---

## 7) Troubleshooting
- **CLI can’t connect**: verify transport (SSE vs HTTP), endpoint path, and that the server is listening.
- **stdio server never responds**: ensure your server writes **only protocol frames to stdout** and logs to **stderr**; otherwise stdio will jam.
- **Tool schema mismatch**: validate your JSON input matches the tool’s JSON schema (use the UI to preview required fields).
- **Long‑running calls**: increase timeouts in UI **Configuration**; or add progress notifications on the server to prevent total‑timeout.
- **Working directory issues** (when testing via IDEs): use absolute paths for mounted resources and env files.

---

## 8) Testing Resources with Parameters

Resources in MCP often accept parameters to provide dynamic content. Here's how to test them effectively:

### 8.1 Testing with the CLI

```bash
# Test a resource with a specific parameter
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/read --uri "greeting://Alice"

# Test with multiple parameters
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/read --uri "products://category/electronics/sort/price"

# Test with special characters (URL encode if needed)
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/read --uri "search://query/Why%20choose%20MCP%3F"
```

### 8.2 Verifying Resource Content

When testing resources, verify that:

1. The returned content matches expectations for the given parameters
2. Parameter validation works correctly (invalid parameters should return appropriate errors)
3. Default values are applied when parameters are omitted

Example CLI test with jq assertions:

```bash
# Test that parameter affects output content
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/read --uri "greeting://Alice" | \
  jq -e '.contents[0].text | contains("Alice")'

# Test default parameter behavior
npx @modelcontextprotocol/inspector --cli node dist/index.js --method resources/read --uri "greeting://" | \
  jq -e '.contents[0].text | contains("world")'
```

### 8.3 Parameter Edge Cases

Always test these parameter edge cases:

1. **Empty parameters**: `resource://` - How does the resource handle missing parameters?
2. **Invalid parameters**: `resource://invalid_value` - Does it return a helpful error?
3. **Special characters**: `resource://Hello, world!` - Are parameters with spaces and punctuation handled correctly?
4. **Very long parameters**: Test with long strings to check for truncation issues

## 9) Common Testing Pitfalls

### 9.1 Resource Property Mismatches

The most common testing issue is asserting against the wrong property:

```javascript
// INCORRECT - resources don't have an 'id' property
const resourceIds = result.resources.map(resource => resource.id);
expect(resourceIds).toContain('greeting');

// CORRECT - use the 'name' property
const resourceNames = result.resources.map(resource => resource.name);
expect(resourceNames).toContain('greeting-world');
```

### 9.2 Not Building Before Testing

Always build your TypeScript code before testing with Inspector:

```bash
# Always build first
npm run build

# Then test
npx @modelcontextprotocol/inspector --cli node dist/index.js --method tools/list
```

### 9.3 Not Handling Resource Lists Correctly

Resource list responses have a specific structure:

```javascript
// The list callback must return this structure:
{
  resources: [
    { name: "resource-name", uri: "resource://uri", title: "Optional Title" }
  ]
}
```

### 9.4 Missing Console Output Protection

Ensure stdout is used only for JSON-RPC protocol messages:

```typescript
// Add this to prevent accidental stdout usage
console.log = function(...args) {
  console.error(...args);
};
```

## 10) Jest Integration

Jest provides powerful testing capabilities for MCP servers. Here's how to set it up:

### 10.1 Setting up Jest for MCP Testing

```bash
# Install Jest dependencies
npm install --save-dev jest @types/jest ts-jest
```

Configure Jest in package.json:

```json
{
  "jest": {
    "testEnvironment": "node",
    "testMatch": ["**/test/**/*.test.js"],
    "verbose": true,
    "testTimeout": 30000
  }
}
```

### 10.2 Helper Function for Inspector Commands

Create a helper function to run Inspector commands in tests:

```javascript
const { execSync } = require('child_process');
const path = require('path');

function runInspector(method, options = {}) {
  let command = `npx @modelcontextprotocol/inspector --cli node ${serverPath} --method ${method}`;
  
  if (options.uri) {
    command += ` --uri "${options.uri}"`;
  }
  
  if (options.toolName) {
    command += ` --tool-name ${options.toolName}`;
    
    if (options.toolArgs) {
      Object.entries(options.toolArgs).forEach(([key, value]) => {
        const argValue = typeof value === 'string' ? `"${value}"` : value;
        command += ` --tool-arg ${key}=${argValue}`;
      });
    }
  }
  
  const output = execSync(command, { encoding: 'utf8' });
  return JSON.parse(output);
}
```

### 10.3 Complete Test Example

```javascript
describe('MCP Server Tests', () => {
  const serverPath = path.join(__dirname, '../dist/index.js');
  
  beforeAll(() => {
    // Build the server before running tests
    execSync('npm run build', { stdio: 'inherit' });
  });
  
  describe('Resource Tests', () => {
    test('Resources list should include greeting resource', () => {
      const result = runInspector('resources/list');
      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBeGreaterThan(0);
      
      const resourceNames = result.resources.map(resource => resource.name);
      expect(resourceNames).toContain('greeting-world');
    });
    
    test('Should read greeting resource with custom name', () => {
      const result = runInspector('resources/read', { uri: 'greeting://Alice' });
      expect(result.contents).toBeDefined();
      expect(result.contents[0].text).toContain('Hello, Alice!');
    });
  });
  
  describe('Tool Tests', () => {
    test('Should call add tool with positive numbers', () => {
      const result = runInspector('tools/call', {
        toolName: 'add',
        toolArgs: {
          a: 5,
          b: 7
        }
      });
      
      expect(result.content[0].text).toBe('5 + 7 = 12');
    });
  });
});
```

## 11) Reference: Common MCP methods
- `tools/list`, `tools/call`
- `resources/list`, `resources/read`, `resources/subscribe`
- `prompts/list`, `prompts/get`
- `notifications/logMessage` (server → client)

---

## 9) Appendix: Example smoke script (bash)
```bash
#!/usr/bin/env bash
set -euo pipefail

CFG=${1:-mcp.json}
S=${2:-default-server}

echo "== tools/list =="
npx @modelcontextprotocol/inspector --cli --config "$CFG" --server "$S" --method tools/list |
  jq -e '.tools | type == "array"' >/dev/null

# Assert at least one tool exists
npx @modelcontextprotocol/inspector --cli --config "$CFG" --server "$S" --method tools/list |
  jq -e '(.tools | length) > 0' >/dev/null

echo "== prompts/list =="
npx @modelcontextprotocol/inspector --cli --config "$CFG" --server "$S" --method prompts/list |
  jq -e '.prompts | type == "array"' >/dev/null

echo "== resources/list =="
npx @modelcontextprotocol/inspector --cli --config "$CFG" --server "$S" --method resources/list |
  jq -e '.resources | type == "array"' >/dev/null

echo "All MCP smoke tests passed."
```

---

### TL;DR
- **UI mode** for exploration, prompt/tool shaping, and quick debugging.
- **CLI mode** for repeatable smoke tests and CI gates.
- Prefer **localhost with auth**, keep Inspector **up‑to‑date**, and export a `mcp.json` for reproducible runs.

