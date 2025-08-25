import { execSync } from 'child_process';
import path from 'path';

describe('Spell Resources Tests', () => {
  const serverPath = path.join(__dirname, '../../dist/index.js');

  // Helper function to run MCP Inspector commands
  function runInspector(method: string, options: { uri?: string } = {}) {
    let command = `npx @modelcontextprotocol/inspector --cli node ${serverPath} --method ${method}`;

    if (options.uri) {
      command += ` --uri "${options.uri}"`;
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

  describe('Resource Registration Tests', () => {
    test('Resources list should include Lumos resource', () => {
      const result = runInspector('resources/list');
      expect(result.resources).toBeDefined();
      expect(result.resources.length).toBeGreaterThan(0);

      const resourceUris = result.resources.map((resource: any) => resource.uri);
      expect(resourceUris).toContain('lumos://current');

      // Check the Lumos resource has the right properties
      const lumosResource = result.resources.find(
        (resource: any) => resource.uri === 'lumos://current'
      );
      expect(lumosResource.name).toBe('lumos-current');
      expect(lumosResource.description).toBe('Shows the current state of the AI Engineer workflow');
      expect(lumosResource.mimeType).toBe('application/json');
    });

    test('Lumos resource should return current state information', () => {
      const result = runInspector('resources/read', { uri: 'lumos://current' });
      expect(result.contents).toBeDefined();
      expect(result.contents.length).toBe(1);

      const content = result.contents[0];
      expect(content.uri).toBe('lumos://current');
      expect(content.mimeType).toBe('application/json');

      const stateData = JSON.parse(content.text);
      expect(stateData.state).toBeDefined();
      expect(stateData.timestamp).toBeDefined();
      expect(stateData.message).toBeDefined();
      expect(stateData.availableSpells).toBeDefined();
      expect(stateData.description).toBeDefined();
      expect(stateData.note).toContain('Parameter-less implementation');
    });
  });
});
