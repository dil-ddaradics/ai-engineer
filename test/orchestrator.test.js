const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('Orchestrator Tests', () => {
  const serverPath = path.join(__dirname, '../dist/index.js');
  const taskDirPath = path.join(process.cwd(), '.ai', 'task');
  const taskFilePath = path.join(taskDirPath, 'task.md');
  const logFilePath = path.join(taskDirPath, 'task.log');
  
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
  
  // Helper function to clean up the task directory
  function cleanupTaskDir() {
    if (fs.existsSync(taskFilePath)) {
      fs.unlinkSync(taskFilePath);
    }
    if (fs.existsSync(logFilePath)) {
      fs.unlinkSync(logFilePath);
    }
    if (fs.existsSync(taskDirPath)) {
      try {
        fs.rmdirSync(taskDirPath);
      } catch (err) {
        // Directory might not be empty, which is fine
      }
    }
  }
  
  beforeAll(() => {
    // Build the server before running tests
    execSync('npm run build', { stdio: 'inherit' });
  });
  
  beforeEach(() => {
    // Clean up before each test
    cleanupTaskDir();
  });
  
  afterAll(() => {
    // Clean up after all tests
    cleanupTaskDir();
  });
  
  describe('Orchestrator Tool Tests', () => {
    test('Tools list should include orchestrator tools', () => {
      const result = runInspector('tools/list');
      expect(result.tools).toBeDefined();
      
      const toolNames = result.tools.map(tool => tool.name);
      expect(toolNames).toContain('advance');
      expect(toolNames).toContain('reset');
      expect(toolNames).toContain('append_log');
    });
    
    test('Advance tool should create task.md in draft mode when it does not exist', () => {
      const result = runInspector('tools/call', {
        toolName: 'advance',
        toolArgs: {
          reason: 'Starting a new task'
        }
      });
      
      // Verify result
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      
      // Parse the JSON string in the text field
      const advanceResult = JSON.parse(result.content[0].text);
      expect(advanceResult.mode).toBe('draft');
      expect(advanceResult.next_instruction).toBeDefined();
      expect(advanceResult.next_instruction.message_to_user).toContain('created `.ai/task/task.md`');
      
      // Verify file was created
      expect(fs.existsSync(taskFilePath)).toBe(true);
      expect(fs.existsSync(logFilePath)).toBe(true);
      
      // Verify content of task.md
      const taskContent = fs.readFileSync(taskFilePath, 'utf8');
      expect(taskContent).toContain('# Task:');
      expect(taskContent).toContain('## Goal');
      expect(taskContent).toContain('## Steps');
      expect(taskContent).toContain('## Validation');
    });
    
    test('Advance tool should enter execute mode when task.md exists', async () => {
      // First create the task directory and file
      if (!fs.existsSync(taskDirPath)) {
        fs.mkdirSync(taskDirPath, { recursive: true });
      }
      
      const taskContent = `# Task: Test Task
      
## Goal
Test the orchestrator.

## Steps
- Step 1: Create a file
- Step 2: Verify it works

## Validation
- Check the file exists
`;
      
      fs.writeFileSync(taskFilePath, taskContent);
      
      // Now call advance
      const result = runInspector('tools/call', {
        toolName: 'advance',
        toolArgs: {
          reason: 'Execute existing task'
        }
      });
      
      // Verify result
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      
      // Parse the JSON string in the text field
      const advanceResult = JSON.parse(result.content[0].text);
      expect(advanceResult.mode).toBe('execute');
      expect(advanceResult.next_instruction).toBeDefined();
      expect(advanceResult.next_instruction.message_to_user).toContain('Test Task');
      expect(advanceResult.next_instruction.message_to_user).toContain('Step 1: Create a file');
    });
    
    test('Reset tool should delete task.md', async () => {
      // First create the task directory and file
      if (!fs.existsSync(taskDirPath)) {
        fs.mkdirSync(taskDirPath, { recursive: true });
      }
      
      fs.writeFileSync(taskFilePath, '# Task: Test Task');
      
      // Verify file exists
      expect(fs.existsSync(taskFilePath)).toBe(true);
      
      // Now call reset
      const result = runInspector('tools/call', {
        toolName: 'reset'
      });
      
      // Verify result
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].text).toContain('Reset complete');
      
      // Verify file was deleted
      expect(fs.existsSync(taskFilePath)).toBe(false);
    });
    
    test('Append log tool should add entry to task.log', async () => {
      // First create the task directory
      if (!fs.existsSync(taskDirPath)) {
        fs.mkdirSync(taskDirPath, { recursive: true });
      }
      
      // Now call append_log
      const testMessage = 'Test log message';
      const result = runInspector('tools/call', {
        toolName: 'append_log',
        toolArgs: {
          message: testMessage
        }
      });
      
      // Verify result
      expect(result.content).toBeDefined();
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.content[0].text).toContain('Log entry added');
      
      // Verify log file was created with the message
      expect(fs.existsSync(logFilePath)).toBe(true);
      const logContent = fs.readFileSync(logFilePath, 'utf8');
      expect(logContent).toContain(testMessage);
    });
  });
});