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
  
  describe('Resource Tests', () => {
    test('Resources list should include greeting resource', () => {
      const result = runInspector('resources/list');
      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBeGreaterThan(0);
      
      const resourceNames = result.resources.map(resource => resource.name);
      expect(resourceNames).toContain('greeting-world');
    });
    
    test('Should read greeting resource with default name', () => {
      const result = runInspector('resources/read', { uri: 'greeting://world' });
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBeGreaterThan(0);
      expect(result.contents[0].text).toContain('Hello, world!');
    });
    
    test('Should read greeting resource with custom name', () => {
      const result = runInspector('resources/read', { uri: 'greeting://Alice' });
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBeGreaterThan(0);
      expect(result.contents[0].text).toContain('Hello, Alice!');
    });
  });
  
  describe('Tool Tests', () => {
    test('Tools list should include add tool', () => {
      const result = runInspector('tools/list');
      expect(result.tools).toBeDefined();
      expect(result.tools.length).toBeGreaterThan(0);
      
      const toolNames = result.tools.map(tool => tool.name);
      expect(toolNames).toContain('add');
    });
    
    test('Should call add tool with positive numbers', () => {
      const result = runInspector('tools/call', {
        toolName: 'add',
        toolArgs: {
          a: 5,
          b: 7
        }
      });
      
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].text).toContain('5 + 7 = 12');
    });
    
    test('Should call add tool with negative numbers', () => {
      const result = runInspector('tools/call', {
        toolName: 'add',
        toolArgs: {
          a: -3,
          b: 10
        }
      });
      
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].text).toContain('-3 + 10 = 7');
    });
  });
});