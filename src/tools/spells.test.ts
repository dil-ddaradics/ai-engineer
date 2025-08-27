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

  beforeAll(async () => {
    // Ensure dist directory exists - build should have been run by jest setup
    const fs = await import('fs');
    const distExists = fs.existsSync('./dist');
    if (!distExists) {
      throw new Error('Build artifacts not found. Run `npm run build` before running tests.');
    }
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
    const spellTools = [
      { name: 'accio', expectedSpell: 'Accio' },
      { name: 'expecto', expectedSpell: 'Expecto' },
      { name: 'reparo', expectedSpell: 'Reparo' },
      { name: 'reverto', expectedSpell: 'Reverto' },
      { name: 'finite', expectedSpell: 'Finite' },
    ];

    spellTools.forEach(({ name, expectedSpell }) => {
      test(`${expectedSpell} tool should be callable and return valid response structure`, () => {
        const result = runInspector('tools/call', {
          toolName: name,
        });

        expect(result.content).toBeDefined();
        expect(result.content.length).toBe(1);

        // Tools return plain text messages, not JSON
        const responseText = result.content[0].text;
        expect(typeof responseText).toBe('string');
        expect(responseText.length).toBeGreaterThan(0);

        // Response should contain meaningful content indicating the spell executed
        expect(responseText).toContain('AI Engineer');
      });
    });
  });
});
