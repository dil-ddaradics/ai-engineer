#!/usr/bin/env node

/**
 * Fix ES module imports in demo build
 * 
 * TypeScript compiler doesn't add .js extensions to relative imports
 * when targeting ES modules, so we need to fix them manually.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const demoDir = path.join(__dirname, '..', 'dist', 'demo');

async function fixImports() {
  try {
    // Fix cli.js imports
    const cliPath = path.join(demoDir, 'cli.js');
    let cliContent = await fs.readFile(cliPath, 'utf-8');
    cliContent = cliContent.replace(/from '\.\/([^']+)';/g, "from './$1.js';");
    await fs.writeFile(cliPath, cliContent);

    // Fix index.js imports
    const indexPath = path.join(demoDir, 'index.js');
    let indexContent = await fs.readFile(indexPath, 'utf-8');
    indexContent = indexContent.replace(/from '\.\/([^']+)';/g, "from './$1.js';");
    await fs.writeFile(indexPath, indexContent);

    // Fix templates.js - replace __dirname with ES module equivalent
    const templatesPath = path.join(demoDir, 'templates.js');
    let templatesContent = await fs.readFile(templatesPath, 'utf-8');
    
    // Add necessary imports
    if (!templatesContent.includes('import { fileURLToPath }')) {
      templatesContent = templatesContent.replace(
        "import * as path from 'path';",
        "import * as path from 'path';\nimport { fileURLToPath } from 'url';"
      );
    }
    
    // Replace __dirname usage
    templatesContent = templatesContent.replace(
      '__dirname',
      'path.dirname(fileURLToPath(import.meta.url))'
    );
    
    await fs.writeFile(templatesPath, templatesContent);

    console.log('✅ Fixed ES module imports in demo build');
  } catch (error) {
    console.error('❌ Failed to fix imports:', error.message);
    process.exit(1);
  }
}

fixImports();