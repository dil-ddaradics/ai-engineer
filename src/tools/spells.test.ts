import { execSync } from 'child_process';
import path from 'path';

describe('Spell Tools Tests', () => {
  const serverPath = path.join(__dirname, '../../dist/index.js');

  // Helper function to run MCP Inspector commands
  function runInspector(
    method: string,
    options: { toolName?: string; toolArgs?: Record<string, any> } = {}
  ) {
    let command = `npx @modelcontextprotocol/inspector --cli node ${serverPath} --method ${method}`;

    if (options.toolName) {
      command += ` --tool-name ${options.toolName}`;

      if (options.toolArgs) {
        Object.entries(options.toolArgs).forEach(([key, value]) => {
          const argValue = typeof value === 'string' ? `"${value}"` : value;
          command += ` --tool-arg ${key}=${argValue}`;
        });
      }
    }

    try {
      const output = execSync(command, { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error: any) {
      console.error(`Command failed: ${command}`);
      console.error(error.stdout || error.message);
      throw error;
    }
  }

  beforeAll(() => {
    // Build the server before running tests
    execSync('npm run build', { stdio: 'inherit' });
  });

  describe('Tool Registration Tests', () => {
    test('Tools list should include all spell tools', () => {
      const result = runInspector('tools/list');
      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThan(0);

      const toolNames = result.tools.map((tool: any) => tool.name);

      // Check for all spell tools (excluding lumos which is now a resource)
      expect(toolNames).toContain('accio');
      expect(toolNames).toContain('expecto');
      expect(toolNames).toContain('reparo');
      expect(toolNames).toContain('reverto');
      expect(toolNames).toContain('finite');
    });
  });

  describe('Spell Tool Execution Tests', () => {
    test('Accio tool should execute and return blocked response', () => {
      const result = runInspector('tools/call', {
        toolName: 'accio',
      });

      expect(result.content).toBeDefined();
      expect(result.content.length).toBe(1);

      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false); // No transitions defined, so blocked
      expect(response.spell).toBe('Accio');
      expect(response.newState).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message).toContain('not available in the current state');
    });

    test('Expecto tool should execute and return blocked response', () => {
      const result = runInspector('tools/call', {
        toolName: 'expecto',
      });

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false); // No transitions defined, so blocked
      expect(response.spell).toBe('Expecto');
      expect(response.newState).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message).toContain('not available in the current state');
    });

    test('Reparo tool should execute and return blocked response', () => {
      const result = runInspector('tools/call', {
        toolName: 'reparo',
      });

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false); // No transitions defined, so blocked
      expect(response.spell).toBe('Reparo');
      expect(response.newState).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message).toContain('not available in the current state');
    });

    test('Reverto tool should execute and return blocked response', () => {
      const result = runInspector('tools/call', {
        toolName: 'reverto',
      });

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false); // No transitions defined, so blocked
      expect(response.spell).toBe('Reverto');
      expect(response.newState).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message).toContain('not available in the current state');
    });

    test('Finite tool should execute and return blocked response', () => {
      const result = runInspector('tools/call', {
        toolName: 'finite',
      });

      expect(result.content).toBeDefined();
      const response = JSON.parse(result.content[0].text);
      expect(response.success).toBe(false); // No transitions defined, so blocked
      expect(response.spell).toBe('Finite');
      expect(response.newState).toBeDefined();
      expect(response.message).toBeDefined();
      expect(response.message).toContain('not available in the current state');
    });

    // Lumos is now a resource, not a tool, so it's tested in the resources test file
  });
});
