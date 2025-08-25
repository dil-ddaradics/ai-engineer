const { execSync } = require('child_process');
const path = require('path');

describe('MCP Server Tests', () => {
  const serverPath = path.join(__dirname, '../dist/index.js');
  
  // Helper function to run MCP Inspector commands
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
    
    try {
      const output = execSync(command, { encoding: 'utf8' });
      return JSON.parse(output);
    } catch (error) {
      console.error(`Command failed: ${command}`);
      console.error(error.stdout || error.message);
      throw error;
    }
  }
  
  beforeAll(() => {
    // Build the server before running tests
    execSync('npm run build', { stdio: 'inherit' });
  });
  
  // No resource tests needed since resources were removed
  
  describe('Tool Tests', () => {
    test('Tools list should include spell tools', () => {
      const result = runInspector('tools/list');
      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThan(0);
      
      const toolNames = result.tools.map(tool => tool.name);
      expect(toolNames).toContain('accio');
      expect(toolNames).toContain('expecto');
      expect(toolNames).toContain('reparo');
      expect(toolNames).toContain('reverto');
      expect(toolNames).toContain('finite');
    });
  });
});