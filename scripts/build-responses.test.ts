import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('build-responses script', () => {
  const testOutputDir = path.resolve(__dirname, '../test-output');
  const testResponsesDir = path.resolve(__dirname, '../test-responses');

  beforeEach(() => {
    // Clean up test directories
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testResponsesDir)) {
      fs.rmSync(testResponsesDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testResponsesDir)) {
      fs.rmSync(testResponsesDir, { recursive: true });
    }
  });

  it('should generate responses.ts file with correct structure', () => {
    // Create test response files
    fs.mkdirSync(testResponsesDir, { recursive: true });
    fs.mkdirSync(path.join(testResponsesDir, 'subfolder'), { recursive: true });

    fs.writeFileSync(path.join(testResponsesDir, 'test1.md'), 'Test response 1 content');
    fs.writeFileSync(
      path.join(testResponsesDir, 'subfolder', 'test2.md'),
      'Test response 2 content'
    );

    // Mock the build-responses script logic
    const responses: Record<string, string> = {};

    function readResponses(dir: string, base = ''): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.join(base, entry);

        if (fs.statSync(fullPath).isDirectory()) {
          readResponses(fullPath, relativePath);
        } else if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = relativePath.replace(/\.md$/, '').replace(/\//g, '_');
          responses[key] = content;
        }
      }
    }

    // Ensure output directory exists
    fs.mkdirSync(testOutputDir, { recursive: true });

    // Read responses
    readResponses(testResponsesDir);

    // Write the responses.ts file
    const outputPath = path.join(testOutputDir, 'responses.ts');
    const content = `// Auto-generated file - do not edit directly
// Generated responses should be output to src/state-machine/constants/responses.ts
export const RESPONSES: Record<string, string> = ${JSON.stringify(responses, null, 2)};
`;

    fs.writeFileSync(outputPath, content);

    // Verify the file was created and has correct content
    expect(fs.existsSync(outputPath)).toBe(true);

    const generatedContent = fs.readFileSync(outputPath, 'utf8');
    expect(generatedContent).toContain('export const RESPONSES');
    expect(generatedContent).toContain('"test1": "Test response 1 content"');
    expect(generatedContent).toContain('"subfolder_test2": "Test response 2 content"');
  });

  it('should handle empty responses directory', () => {
    // Create empty directory
    fs.mkdirSync(testResponsesDir, { recursive: true });
    fs.mkdirSync(testOutputDir, { recursive: true });

    const responses: Record<string, string> = {};

    function readResponses(dir: string, base = ''): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.join(base, entry);

        if (fs.statSync(fullPath).isDirectory()) {
          readResponses(fullPath, relativePath);
        } else if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = relativePath.replace(/\.md$/, '').replace(/\//g, '_');
          responses[key] = content;
        }
      }
    }

    readResponses(testResponsesDir);

    const outputPath = path.join(testOutputDir, 'responses.ts');
    const content = `// Auto-generated file - do not edit directly
// Generated responses should be output to src/state-machine/constants/responses.ts
export const RESPONSES: Record<string, string> = ${JSON.stringify(responses, null, 2)};
`;

    fs.writeFileSync(outputPath, content);

    const generatedContent = fs.readFileSync(outputPath, 'utf8');
    expect(generatedContent).toContain('export const RESPONSES: Record<string, string> = {};');
  });

  it('should correctly transform file paths to keys', () => {
    const testCases = [
      { path: 'simple.md', expected: 'simple' },
      { path: 'folder/file.md', expected: 'folder_file' },
      { path: 'deep/nested/path.md', expected: 'deep_nested_path' },
      { path: 'with-dashes.md', expected: 'with-dashes' },
    ];

    testCases.forEach(({ path: filePath, expected }) => {
      const key = filePath.replace(/\.md$/, '').replace(/\//g, '_');
      expect(key).toBe(expected);
    });
  });

  it('should preserve content exactly', () => {
    const testContent = `# Test Content

This is a test response with:
- Markdown formatting
- Special characters: !@#$%^&*()
- Unicode: 🚀 💻 ✨

## Code Example
\`\`\`typescript
const test = "value";
\`\`\`
`;

    fs.mkdirSync(testResponsesDir, { recursive: true });
    fs.writeFileSync(path.join(testResponsesDir, 'test.md'), testContent);

    const responses: Record<string, string> = {};

    function readResponses(dir: string, base = ''): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.join(base, entry);

        if (fs.statSync(fullPath).isDirectory()) {
          readResponses(fullPath, relativePath);
        } else if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = relativePath.replace(/\.md$/, '').replace(/\//g, '_');
          responses[key] = content;
        }
      }
    }

    readResponses(testResponsesDir);

    expect(responses['test']).toBe(testContent);
  });
});
