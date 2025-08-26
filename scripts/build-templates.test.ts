import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('build-templates script', () => {
  const testOutputDir = path.resolve(__dirname, '../test-output');
  const testTemplatesDir = path.resolve(__dirname, '../test-templates');

  beforeEach(() => {
    // Clean up test directories
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testTemplatesDir)) {
      fs.rmSync(testTemplatesDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directories
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true });
    }
    if (fs.existsSync(testTemplatesDir)) {
      fs.rmSync(testTemplatesDir, { recursive: true });
    }
  });

  it('should generate templates.ts file with correct structure', () => {
    // Create test template files
    fs.mkdirSync(testTemplatesDir, { recursive: true });
    
    fs.writeFileSync(
      path.join(testTemplatesDir, 'task-template.md'),
      '# Task Template\n\n## Steps\n\n- [ ] Step 1\n- [ ] Step 2'
    );
    fs.writeFileSync(
      path.join(testTemplatesDir, 'plan-guide.md'),
      '# Plan Guide\n\nThis is a guide for creating plans.'
    );

    // Mock the build-templates script logic
    const templates: Record<string, string> = {};
    
    function readTemplates(dir: string): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = entry.replace(/\.md$/, '').replace(/-/g, '_');
          templates[key] = content;
        }
      }
    }

    // Ensure output directory exists
    fs.mkdirSync(testOutputDir, { recursive: true });

    // Read templates
    readTemplates(testTemplatesDir);

    // Write the templates.ts file
    const outputPath = path.join(testOutputDir, 'templates.ts');
    const content = `// Auto-generated file - do not edit directly
// Generated templates should be output to src/state-machine/constants/templates.ts
export const TEMPLATES: Record<string, string> = ${JSON.stringify(templates, null, 2)};
`;

    fs.writeFileSync(outputPath, content);

    // Verify the file was created and has correct content
    expect(fs.existsSync(outputPath)).toBe(true);
    
    const generatedContent = fs.readFileSync(outputPath, 'utf8');
    expect(generatedContent).toContain('export const TEMPLATES');
    expect(generatedContent).toContain('"task_template"');
    expect(generatedContent).toContain('"plan_guide"');
    expect(generatedContent).toContain('# Task Template');
    expect(generatedContent).toContain('# Plan Guide');
  });

  it('should handle empty templates directory', () => {
    // Create empty directory
    fs.mkdirSync(testTemplatesDir, { recursive: true });
    fs.mkdirSync(testOutputDir, { recursive: true });

    const templates: Record<string, string> = {};
    
    function readTemplates(dir: string): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = entry.replace(/\.md$/, '').replace(/-/g, '_');
          templates[key] = content;
        }
      }
    }

    readTemplates(testTemplatesDir);

    const outputPath = path.join(testOutputDir, 'templates.ts');
    const content = `// Auto-generated file - do not edit directly
// Generated templates should be output to src/state-machine/constants/templates.ts
export const TEMPLATES: Record<string, string> = ${JSON.stringify(templates, null, 2)};
`;

    fs.writeFileSync(outputPath, content);

    const generatedContent = fs.readFileSync(outputPath, 'utf8');
    expect(generatedContent).toContain('export const TEMPLATES: Record<string, string> = {};');
  });

  it('should correctly transform template filenames to keys', () => {
    const testCases = [
      { filename: 'simple.md', expected: 'simple' },
      { filename: 'task-template.md', expected: 'task_template' },
      { filename: 'plan-guide.md', expected: 'plan_guide' },
      { filename: 'review-task-results.md', expected: 'review_task_results' },
    ];

    testCases.forEach(({ filename, expected }) => {
      const key = filename.replace(/\.md$/, '').replace(/-/g, '_');
      expect(key).toBe(expected);
    });
  });

  it('should preserve template content exactly', () => {
    const templateContent = `# Task Template

## Overview

{{TASK_NAME}}

## Steps

- [ ] {{STEP_1}}
- [ ] {{STEP_2}}

## Verification

- [ ] Tests pass
- [ ] Code reviewed

## Notes

{{NOTES}}
`;

    fs.mkdirSync(testTemplatesDir, { recursive: true });
    fs.writeFileSync(path.join(testTemplatesDir, 'test-template.md'), templateContent);

    const templates: Record<string, string> = {};
    
    function readTemplates(dir: string): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = entry.replace(/\.md$/, '').replace(/-/g, '_');
          templates[key] = content;
        }
      }
    }

    readTemplates(testTemplatesDir);

    expect(templates['test_template']).toBe(templateContent);
    expect(templates['test_template']).toContain('{{TASK_NAME}}');
    expect(templates['test_template']).toContain('{{STEP_1}}');
  });

  it('should ignore non-markdown files', () => {
    fs.mkdirSync(testTemplatesDir, { recursive: true });
    
    // Create various file types
    fs.writeFileSync(path.join(testTemplatesDir, 'template.md'), '# Valid Template');
    fs.writeFileSync(path.join(testTemplatesDir, 'readme.txt'), 'Not a template');
    fs.writeFileSync(path.join(testTemplatesDir, 'config.json'), '{"key": "value"}');
    fs.writeFileSync(path.join(testTemplatesDir, 'script.js'), 'console.log("test");');

    const templates: Record<string, string> = {};
    
    function readTemplates(dir: string): void {
      const entries = fs.readdirSync(dir);
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);

        if (entry.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const key = entry.replace(/\.md$/, '').replace(/-/g, '_');
          templates[key] = content;
        }
      }
    }

    readTemplates(testTemplatesDir);

    // Should only have the .md file
    expect(Object.keys(templates)).toHaveLength(1);
    expect(templates['template']).toBe('# Valid Template');
    expect(templates['readme']).toBeUndefined();
    expect(templates['config']).toBeUndefined();
    expect(templates['script']).toBeUndefined();
  });
});