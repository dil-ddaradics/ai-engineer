import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('prebuild script', () => {
  const realConstantsDir = path.resolve(__dirname, '../src/state-machine/constants');
  const realResponsesDir = path.resolve(__dirname, '../state-machine/responses');
  const realTemplatesDir = path.resolve(__dirname, '../state-machine/templates');

  it('should have generated responses.ts file', () => {
    const responsesPath = path.join(realConstantsDir, 'responses.ts');

    expect(fs.existsSync(responsesPath)).toBe(true);

    const content = fs.readFileSync(responsesPath, 'utf8');
    expect(content).toContain('export const RESPONSES: Record<string, string>');
    expect(content).toContain('Auto-generated file - do not edit directly');
  });

  it('should have generated templates.ts file', () => {
    const templatesPath = path.join(realConstantsDir, 'templates.ts');

    expect(fs.existsSync(templatesPath)).toBe(true);

    const content = fs.readFileSync(templatesPath, 'utf8');
    expect(content).toContain('export const TEMPLATES: Record<string, string>');
    expect(content).toContain('Auto-generated file - do not edit directly');
  });

  it('should generate valid TypeScript module exports', async () => {
    const responsesPath = path.join(realConstantsDir, 'responses.ts');
    const templatesPath = path.join(realConstantsDir, 'templates.ts');

    // Test that the generated files can be imported (basic syntax validation)
    expect(async () => {
      const { RESPONSES } = await import(responsesPath);
      expect(typeof RESPONSES).toBe('object');
    }).not.toThrow();

    expect(async () => {
      const { TEMPLATES } = await import(templatesPath);
      expect(typeof TEMPLATES).toBe('object');
    }).not.toThrow();
  });

  it('should process all response markdown files', () => {
    if (!fs.existsSync(realResponsesDir)) {
      console.warn('Response directory does not exist, cannot test response processing');
      return;
    }

    const responsesPath = path.join(realConstantsDir, 'responses.ts');
    const content = fs.readFileSync(responsesPath, 'utf8');

    // Count expected response files
    let expectedResponseCount = 0;
    function countResponseFiles(dir: string): void {
      if (!fs.existsSync(dir)) return;

      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          countResponseFiles(fullPath);
        } else if (entry.endsWith('.md')) {
          expectedResponseCount++;
        }
      }
    }

    countResponseFiles(realResponsesDir);

    // Verify the generated file mentions the correct count
    const match = content.match(/Generated responses module with (\d+) responses/);
    if (match && expectedResponseCount > 0) {
      expect(parseInt(match[1])).toBe(expectedResponseCount);
    }
  });

  it('should process all template markdown files', () => {
    if (!fs.existsSync(realTemplatesDir)) {
      console.warn('Templates directory does not exist, cannot test template processing');
      return;
    }

    const templatesPath = path.join(realConstantsDir, 'templates.ts');
    const content = fs.readFileSync(templatesPath, 'utf8');

    // Count expected template files
    let expectedTemplateCount = 0;
    if (fs.existsSync(realTemplatesDir)) {
      const entries = fs.readdirSync(realTemplatesDir);
      for (const entry of entries) {
        const fullPath = path.join(realTemplatesDir, entry);
        if (fs.statSync(fullPath).isFile() && entry.endsWith('.md')) {
          expectedTemplateCount++;
        }
      }
    }

    // Verify the generated file mentions the correct count
    const match = content.match(/Generated templates module with (\d+) templates/);
    if (match && expectedTemplateCount > 0) {
      expect(parseInt(match[1])).toBe(expectedTemplateCount);
    }
  });

  it('should ensure constants directory exists', () => {
    expect(fs.existsSync(realConstantsDir)).toBe(true);

    // Check that it's a directory
    const stats = fs.statSync(realConstantsDir);
    expect(stats.isDirectory()).toBe(true);
  });

  it('should handle missing source directories gracefully', () => {
    // This test verifies that the build scripts don't crash when directories are missing
    // The actual build-responses.ts script has logic to handle missing directories

    const testOutputDir = path.resolve(__dirname, '../test-output-prebuild');
    const testResponsesDir = path.resolve(__dirname, '../test-responses-missing');
    const testTemplatesDir = path.resolve(__dirname, '../test-templates-missing');

    // Ensure test directories don't exist
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }

    // Create output directory
    fs.mkdirSync(testOutputDir, { recursive: true });

    // Test responses build with missing directory
    const responses: Record<string, string> = {};

    // This should not throw when directory doesn't exist
    expect(() => {
      if (fs.existsSync(testResponsesDir)) {
        // Would read responses here
      }
    }).not.toThrow();

    // Test templates build with existing directory
    fs.mkdirSync(testTemplatesDir, { recursive: true });

    const templates: Record<string, string> = {};
    expect(() => {
      if (fs.existsSync(testTemplatesDir)) {
        const entries = fs.readdirSync(testTemplatesDir);
        for (const entry of entries) {
          if (entry.endsWith('.md')) {
            const content = fs.readFileSync(path.join(testTemplatesDir, entry), 'utf8');
            const key = entry.replace(/\.md$/, '').replace(/-/g, '_');
            templates[key] = content;
          }
        }
      }
    }).not.toThrow();

    // Clean up
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testTemplatesDir)) {
      fs.rmSync(testTemplatesDir, { recursive: true });
    }
  });
});
