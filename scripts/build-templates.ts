import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build a map of all template files
const templates: Record<string, string> = {};
const templatesDir = path.resolve(__dirname, '../state-machine/templates');
const outputDir = path.resolve(__dirname, '../src/state-machine');

// Read all template files
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
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read all template files
readTemplates(templatesDir);

// Write the templates.ts file
const outputPath = path.join(outputDir, 'templates.ts');
const content = `// Auto-generated file - do not edit directly
export const TEMPLATES: Record<string, string> = ${JSON.stringify(templates, null, 2)};
`;

fs.writeFileSync(outputPath, content);
console.log(`Generated templates module with ${Object.keys(templates).length} templates`);