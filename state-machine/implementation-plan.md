# State Machine Implementation Plan

## Core Types and Interfaces

```typescript
// Core types for states and spells
type StateName =
  | 'GATHER_NEEDS_CONTEXT'
  | 'GATHER_EDITING_CONTEXT'
  | 'GATHER_EDITING'
  | 'ACHIEVE_TASK_DRAFTING'
  | 'ACHIEVE_TASK_EXECUTED'
  | 'ACHIEVE_COMPLETE'
  | 'PR_GATHERING_COMMENTS_G'
  | 'PR_GATHERING_COMMENTS_A'
  | 'PR_REVIEW_TASK_DRAFT_G'
  | 'PR_REVIEW_TASK_DRAFT_A'
  | 'PR_APPLIED_PENDING_ARCHIVE_G'
  | 'PR_APPLIED_PENDING_ARCHIVE_A'
  | 'PR_CONFIRM_RESTART_COMMENTS_G'
  | 'PR_CONFIRM_RESTART_COMMENTS_A'
  | 'PR_CONFIRM_RESTART_TASK_G'
  | 'PR_CONFIRM_RESTART_TASK_A'
  | 'ERROR_TASK_MISSING'
  | 'ERROR_TASK_RESULTS_MISSING'
  | 'ERROR_PLAN_MISSING'
  | 'ERROR_CONTEXT_MISSING'
  | 'ERROR_COMMENTS_MISSING_G'
  | 'ERROR_COMMENTS_MISSING_A'
  | 'ERROR_REVIEW_TASK_MISSING_G'
  | 'ERROR_REVIEW_TASK_MISSING_A'
  | 'ERROR_REVIEW_TASK_RESULTS_MISSING_G'
  | 'ERROR_REVIEW_TASK_RESULTS_MISSING_A';

type Spell = 'Accio' | 'Expecto' | 'Reparo' | 'Reverto' | 'Finite' | 'Lumos';

// State history entry
interface StateHistoryEntry {
  timestamp: string;
  transition: string;
  trigger: Spell;
}

// State context - minimalist approach with just the current state and history
interface StateContext {
  currentState: StateName;
  history: StateHistoryEntry[];
}

// Result returned by transition handlers
interface TransitionResult {
  nextState: StateName;
  response: string; // The final response string with any placeholders already replaced
}

// Core transition definition
interface Transition {
  id: string;
  sourceState: StateName;
  spell: Spell;
  // Condition is optional - if not provided, treated as always true
  condition?: (fileSystem: FileSystem) => Promise<boolean>;
  handler: (context: StateContext, fileSystem: FileSystem) => Promise<TransitionResult>;
  description?: string;
}

// File system abstraction
interface FileSystem {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  delete(path: string): Promise<void>;
  archive(source: string, destination: string): Promise<void>;
}

// State repository for persistence
interface StateRepository {
  load(): Promise<StateContext | null>;
  save(state: StateContext): Promise<void>;
  initialize(): Promise<StateContext>;
}

// Main state machine interface
interface StateMachine {
  // Minimal interface - just execute spells
  executeSpell(spell: Spell): Promise<TransitionResult>;
}
```

## Implementation Principles

1. **TypeScript with Strict Typing**
   - Use string literal union types for states and spells
   - Leverage type system to catch errors at compile time
   - Enable strict null checks and no implicit any

2. **Immutability**
   - State transitions create new state objects
   - No direct mutation of state context
   - Use functional programming patterns where appropriate

3. **Testability**
   - Abstract file system operations for easier testing
   - Separate state logic from side effects
   - Make transitions pure functions where possible

4. **Modularity**
   - Group related transitions together
   - Separate response templates from transition logic
   - Use dependency injection for components

5. **Error Handling**
   - Robust error states and recovery paths
   - Graceful degradation when files are missing
   - Clear error messages in responses

## Architecture

### Components

1. **State Machine Core**
   - Central engine that processes state transitions
   - Maintains current state and context
   - Routes spells to appropriate transition handlers

2. **Transition Registry**
   - Holds all defined transitions
   - Provides lookup by source state and spell
   - Validates transition coverage (all state-spell combinations)

3. **File System Adapter**
   - Abstracts file operations
   - Handles file existence checks
   - Manages file creation, deletion, and archiving

4. **State Repository**
   - Persists state to disk
   - Loads state from disk
   - Handles initialization of new state

5. **Response Formatter**
   - Generates structured responses from templates
   - Provides consistent formatting
   - Supports different response formats

### Data Flow

1. User casts a spell (e.g., "Accio")
2. State machine looks up transitions for current state and spell
3. All matching transitions' conditions are checked using the FileSystem directly
4. The first transition with a passing condition is selected and its handler is executed
5. Handler performs file operations directly and returns new state and response
6. State is updated and persisted
7. Response is returned to user

## Folder Structure

```
/scripts                          # Build scripts
  prebuild.ts                     # Master prebuild script
  build-responses.ts              # Generate responses.ts from response files
  build-templates.ts              # Generate templates.ts from template files

/state-machine                    # Source files (not compiled)
  /responses                      # Response template files (markdown)
  /templates                      # Template files (markdown)

/src
  /state-machine                  # State machine implementation
    index.ts                      # Main entry point and factory function
    index.test.ts                 # Tests for main entry point
    types.ts                      # Core types and interfaces
    stateMachine.ts               # State machine implementation
    stateMachine.test.ts          # Tests for state machine
    fileSystem.ts                 # File system interface and implementation
    fileSystem.test.ts            # Tests for file system
    stateRepository.ts            # State repository for persistence
    stateRepository.test.ts       # Tests for state repository
    responses.ts                  # Generated file with response templates (auto-generated)
    templates.ts                  # Generated file with template content (auto-generated)

    /transitions                  # Transition definitions organized by phase
      gatherTransitions.ts        # GATHER phase transitions
      gatherTransitions.test.ts   # Tests for GATHER transitions
      achieveTransitions.ts       # ACHIEVE phase transitions
      achieveTransitions.test.ts  # Tests for ACHIEVE transitions
      prTransitions.ts            # PR review phase transitions
      prTransitions.test.ts       # Tests for PR transitions
      errorTransitions.ts         # Error handling transitions
      errorTransitions.test.ts    # Tests for error transitions
      universalTransitions.ts     # Universal transitions (Lumos, etc.)
      universalTransitions.test.ts # Tests for universal transitions
      index.ts                    # Exports all transitions

    /utils                        # Helper utilities
      responseUtils.ts            # Response processing
      responseUtils.test.ts       # Tests for response utils
      templateUtils.ts            # Template processing (NEW)
      templateUtils.test.ts       # Tests for template utils (NEW)
      planUtils.ts                # Plan parsing and operations
      planUtils.test.ts           # Tests for plan utils
      fileUtils.ts                # File operation helpers
      fileUtils.test.ts           # Tests for file utils
```

## Build Strategy

### Prebuild Process

The project uses a prebuild system that generates TypeScript constants from template and response files:

```typescript
// Package.json scripts
{
  "scripts": {
    "prebuild": "tsx scripts/prebuild.ts",
    "build": "npm run prebuild && tsc",
    "dev": "npm run prebuild && tsc --watch",
    "prepare": "npm run prebuild"
  }
}
```

### Build Scripts Architecture

- **`scripts/prebuild.ts`**: Master script that imports both build scripts
- **`scripts/build-responses.ts`**: Generates `src/state-machine/responses.ts` from `state-machine/responses/` folder
- **`scripts/build-templates.ts`**: Generates `src/state-machine/templates.ts` from `state-machine/templates/` folder

### Generated Outputs

- **`src/state-machine/responses.ts`**: Contains `RESPONSES` constant with all response templates
- **`src/state-machine/templates.ts`**: Contains `TEMPLATES` constant with all file templates
- Both generated files export Record<string, string> for runtime access

## Template Management Architecture

The MCP server manages all template files using a two-tier approach that separates persistent guides from working templates:

### Template Categories

#### Persistent Guide Files

- **Location**: `.ai/` folder (root of AI workspace)
- **Behavior**: Copied from MCP resources only if they don't exist
- **Purpose**: Allow developers to customize and reuse across multiple tasks
- **Files**:
  - `.ai/plan-guide.md` - Planning guidelines and best practices
  - `.ai/task-guide.md` - Task creation guidelines

#### Working Template Files

- **Location**: `.ai/task/` folder (task-specific workspace)
- **Behavior**: Created fresh from embedded templates each time needed
- **Purpose**: Provide clean templates for each workflow step
- **Files**:
  - `.ai/task/context.md` - Task context template
  - `.ai/task/plan.md` - Structured plan template
  - `.ai/task/task.md` - Individual task template
  - `.ai/task/task-results.md` - Task results template
  - `.ai/task/comments.md` - PR comments template
  - `.ai/task/review-task.md` - Review task template
  - `.ai/task/review-task-results.md` - Review task results template

### Template Resource Management

- All templates are embedded in the compiled TypeScript via prebuild process
- Templates are read from `TEMPLATES` constant at runtime
- File existence checks determine copy vs. create behavior
- Template utilities handle the embedding and file creation logic

## Response Management

Response templates are handled by the MCP server with a separation of concerns:

### Template Architecture

- **Individual Response Files**: Contain specific state information starting with "### Where We Are"
- **Standard Header**: The MCP server maintains a separate Lumos header template
- **Concatenation**: The MCP server concatenates the standard header with individual response content

### Lumos Header Template

The MCP server uses this standard header for all Lumos responses:

```markdown
> **AI Engineer Workflow** helps you work together with AI on any coding task. This system was built to teach effective collaboration with AI through a guided workflow. You can create plans, break them down into smaller tasks, get information from Jira and Confluence, and improve your code by handling PR comments.
>
> For best results, commit your changes often and start new conversations to clear the AI's context when needed. Don't worry about losing progress - this system remembers where you left off!
```

### Response File Format

Individual response files should NOT include the standard header and should start directly with their content sections.

### Template Utilities

Template management follows the same pattern as responses:

```typescript
// src/state-machine/utils/templateUtils.ts
import { TEMPLATES } from '../templates';

export function getTemplate(name: string): string {
  const template = TEMPLATES[name];
  if (!template) {
    throw new Error(`Template not found: ${name}`);
  }
  return template;
}

export function processTemplate(
  templateContent: string,
  replacements?: Record<string, string>
): string {
  let processed = templateContent;

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
  }

  return processed;
}

export async function writeTemplate(
  fileSystem: FileSystem,
  templateName: string,
  filePath: string,
  replacements?: Record<string, string>
): Promise<void> {
  const template = getTemplate(templateName);
  const content = processTemplate(template, replacements);
  await fileSystem.write(filePath, content);
}
```

To handle both templates and responses efficiently, we use build scripts that generate TypeScript files:

```typescript
// scripts/build-responses.ts
import fs from 'fs';
import path from 'path';

// Build a map of all response files
const responses: Record<string, string> = {};
const responsesDir = path.resolve(__dirname, '../state-machine/responses');
const outputDir = path.resolve(__dirname, '../src/state-machine');

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

// Read all response files
readResponses(responsesDir);

// Write the responses.ts file
const outputPath = path.join(outputDir, 'responses.ts');
const content = `// Auto-generated file - do not edit directly
export const RESPONSES: Record<string, string> = ${JSON.stringify(responses, null, 2)};
`;

fs.writeFileSync(outputPath, content);
console.log(`Generated responses module with ${Object.keys(responses).length} templates`);

// scripts/build-templates.ts
import fs from 'fs';
import path from 'path';

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

// scripts/prebuild.ts
import './build-responses';
import './build-templates';

console.log('Prebuild completed - responses and templates generated');
```

## Example Implementation

### State Machine Implementation

```typescript
// src/state-machine/stateMachine.ts
import {
  StateMachine,
  StateContext,
  Spell,
  Transition,
  TransitionResult,
  FileSystem,
  StateRepository,
} from './types';

export class StateMachineImpl implements StateMachine {
  private context: StateContext;
  private transitions: Transition[];
  private fileSystem: FileSystem;
  private stateRepository: StateRepository;

  constructor(fileSystem: FileSystem, stateRepository: StateRepository, transitions: Transition[]) {
    this.fileSystem = fileSystem;
    this.stateRepository = stateRepository;
    this.transitions = transitions;
    this.context = {
      currentState: 'GATHER_NEEDS_CONTEXT',
      history: [],
    };
  }

  async initialize(): Promise<void> {
    // Load state or initialize if not exists
    const loadedState = await this.stateRepository.load();
    this.context = loadedState || (await this.stateRepository.initialize());
  }

  // Private method for finding valid transitions
  private async findValidTransition(spell: Spell): Promise<Transition | undefined> {
    // Find all transitions matching the current state and spell
    const matchingTransitions = this.transitions.filter(
      t => t.sourceState === this.context.currentState && t.spell === spell
    );

    // Find the first transition whose condition passes (or has no condition)
    for (const transition of matchingTransitions) {
      // If no condition is specified, treat it as always true
      if (!transition.condition || (await transition.condition(this.fileSystem))) {
        return transition;
      }
    }

    return undefined;
  }

  async executeSpell(spell: Spell): Promise<TransitionResult> {
    // Find a valid transition using the private method
    const transition = await this.findValidTransition(spell);

    if (!transition) {
      throw new Error(`No valid transition found for ${this.context.currentState} + ${spell}`);
    }

    // Store the previous state for logging
    const oldState = this.context.currentState;

    // Execute the transition handler
    const result = await transition.handler(this.context, this.fileSystem);

    // Add entry to history
    this.context.history.push({
      timestamp: new Date().toISOString(),
      transition: `${oldState} → ${result.nextState}`,
      trigger: spell,
    });

    // Update state
    this.context.currentState = result.nextState;

    // Save state
    await this.stateRepository.save(this.context);

    // Return the result
    return result;
  }
}
```

### File System Implementation

```typescript
// src/state-machine/fileSystem.ts
import { FileSystem } from './types';
import fs from 'fs/promises';
import path from 'path';

export class NodeFileSystem implements FileSystem {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  private resolvePath(filePath: string): string {
    return path.isAbsolute(filePath) ? filePath : path.resolve(this.basePath, filePath);
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(this.resolvePath(filePath));
      return true;
    } catch {
      return false;
    }
  }

  async read(filePath: string): Promise<string> {
    return fs.readFile(this.resolvePath(filePath), 'utf-8');
  }

  async write(filePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    const directory = path.dirname(fullPath);

    // Ensure directory exists
    await fs.mkdir(directory, { recursive: true });

    // Write the file
    await fs.writeFile(fullPath, content, 'utf-8');
  }

  async delete(filePath: string): Promise<void> {
    await fs.unlink(this.resolvePath(filePath));
  }

  async archive(source: string, destination: string): Promise<void> {
    const sourceFullPath = this.resolvePath(source);
    const destFullPath = this.resolvePath(destination);
    const destDirectory = path.dirname(destFullPath);

    // Ensure destination directory exists
    await fs.mkdir(destDirectory, { recursive: true });

    // Move file
    await fs.copyFile(sourceFullPath, destFullPath);
    await fs.unlink(sourceFullPath);
  }
}
```

### State Repository Implementation

```typescript
// src/state-machine/stateRepository.ts
import { StateContext, StateRepository } from './types';
import { FileSystem } from './types';

export class JsonFileStateRepository implements StateRepository {
  private filePath: string;
  private fileSystem: FileSystem;

  constructor(fileSystem: FileSystem, filePath: string = '.ai/task/state.json') {
    this.fileSystem = fileSystem;
    this.filePath = filePath;
  }

  async load(): Promise<StateContext | null> {
    try {
      if (await this.fileSystem.exists(this.filePath)) {
        const content = await this.fileSystem.read(this.filePath);
        return JSON.parse(content) as StateContext;
      }
      return null;
    } catch (error) {
      console.error('Failed to load state:', error);
      return null;
    }
  }

  async save(state: StateContext): Promise<void> {
    try {
      await this.fileSystem.write(this.filePath, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save state:', error);
      throw error;
    }
  }

  async initialize(): Promise<StateContext> {
    const initialState: StateContext = {
      currentState: 'GATHER_NEEDS_CONTEXT',
      history: [],
    };

    await this.save(initialState);
    return initialState;
  }
}
```

### Response Utilities

```typescript
// src/state-machine/utils/responseUtils.ts
import { RESPONSES } from '../responses';

export function getResponse(id: string): string {
  const response = RESPONSES[id];
  if (!response) {
    throw new Error(`Response template not found: ${id}`);
  }
  return response;
}

export function processResponse(
  responseTemplate: string,
  replacements?: Record<string, string>
): string {
  let processed = responseTemplate;

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
  }

  return processed;
}
```

### Transition Example

```typescript
// src/state-machine/transitions/gatherTransitions.ts
import { Transition } from '../types';
import { getResponse, processResponse } from '../utils/responseUtils';
import { getTemplate, writeTemplate } from '../utils/templateUtils';
import { hasAcceptanceCriteria, extractFirstAcceptanceCriteria } from '../utils/planUtils';
import { extractAtlassianUrls } from '../utils/fileUtils';

export const gatherTransitions: Transition[] = [
  // GC1: GATHER_NEEDS_CONTEXT + Accio -> GATHER_EDITING_CONTEXT
  {
    id: 'GC1',
    sourceState: 'GATHER_NEEDS_CONTEXT',
    spell: 'Accio',
    // No condition - always applies
    handler: async (context, fileSystem) => {
      // Create context.md from template
      await writeTemplate(fileSystem, 'context', '.ai/task/context.md');

      // Copy guide files from templates if they don't exist
      if (!(await fileSystem.exists('.ai/plan-guide.md'))) {
        await writeTemplate(fileSystem, 'plan_guide', '.ai/plan-guide.md');
      }

      if (!(await fileSystem.exists('.ai/task-guide.md'))) {
        await writeTemplate(fileSystem, 'task_guide', '.ai/task-guide.md');
      }

      // Get response template
      const responseTemplate = getResponse('gather_transitions_GC1');

      return {
        nextState: 'GATHER_EDITING_CONTEXT',
        response: responseTemplate, // No replacements needed
      };
    },
  },

  // GC2: GATHER_EDITING_CONTEXT + Accio -> GATHER_EDITING
  {
    id: 'GC2',
    sourceState: 'GATHER_EDITING_CONTEXT',
    spell: 'Accio',
    condition: async fileSystem => {
      return await fileSystem.exists('.ai/task/context.md');
    },
    handler: async (context, fileSystem) => {
      // Read context.md content
      const contextContent = await fileSystem.read('.ai/task/context.md');

      // Extract Atlassian URLs using generic function
      const atlassianUrls = extractAtlassianUrls(contextContent);

      // Get response template and replace URL placeholder
      let responseTemplate = getResponse('gather_transitions_GC2');
      responseTemplate = responseTemplate.replace(
        '[ATLASSIAN_URLS_PLACEHOLDER]',
        atlassianUrls.join('\n')
      );

      return {
        nextState: 'GATHER_EDITING',
        response: responseTemplate,
      };
    },
  },

  // Other transitions would be defined here...
];
```

## Testing Strategy

1. **Unit Testing**
   - Test each transition in isolation
   - Mock file system for deterministic tests
   - Verify state changes and responses

2. **Testing Focus**
   - Ensure complete coverage of all transitions
   - Test conditions and handlers separately
   - Verify file operations are performed correctly

3. **Co-located Tests**
   - Keep test files next to the files they test
   - Make it easy to find and update related tests
   - Ensure complete test coverage

## Implementation Roadmap

1. **Setup Project Structure**
   - Create necessary directories in `/src/state-machine`
   - Set up build script for responses
   - Configure TypeScript and Jest

2. **Core Implementation**
   - Implement types.ts with all interfaces
   - Create FileSystem implementation
   - Develop StateRepository for persistence
   - Build core StateMachine implementation

3. **Transition Definitions**
   - Implement transition files by category
   - Create utility functions for file operations
   - Develop response processing utilities

4. **Testing**
   - Write unit tests for each component
   - Create tests for each transition
   - Ensure all state-spell combinations are covered

5. **Integration with MCP Server**
   - Expose factory function for state machine creation
   - Document API for MCP integration
   - Add final type exports
