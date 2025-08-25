import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build a map of all response files
const responses: Record<string, string> = {};
const responsesDir = path.resolve(__dirname, '../state-machine/responses');
const outputDir = path.resolve(__dirname, '../src/state-machine/constants');

// Recursive function to read all markdown files
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
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read all response files (only if responses directory exists)
if (fs.existsSync(responsesDir)) {
  readResponses(responsesDir);
}

// Write the responses.ts file
const outputPath = path.join(outputDir, 'responses.ts');
const content = `// Auto-generated file - do not edit directly
// Generated responses should be output to src/state-machine/constants/responses.ts
export const RESPONSES: Record<string, string> = ${JSON.stringify(responses, null, 2)};
`;

fs.writeFileSync(outputPath, content);
console.log(`Generated responses module with ${Object.keys(responses).length} responses`);
