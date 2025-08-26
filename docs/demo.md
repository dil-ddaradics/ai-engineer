# AI Engineer Demo Tool

## Introduction

The AI Engineer Demo Tool is a command-line utility that allows users to quickly set up realistic demonstration states of the AI Engineer workflow. This tool generates complete `.ai` folder structures with authentic content that matches real-world usage patterns, enabling users to explore and understand the AI Engineer state machine at any key decision point.

## Purpose & Benefits

The demo tool addresses several key needs:

- **Exploration**: Quickly jump to any state in the AI Engineer workflow without going through all the previous steps
- **Learning**: Understand what files exist and their content at different workflow stages
- **Development**: Test the AI Engineer MCP server against realistic scenarios
- **Documentation**: Provide concrete examples of workflow states with real content

## Installation & Setup

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- AI Engineer MCP server project

### Build Requirements

Before using the demo tool, you must build the demo module:

```bash
# Build the entire project (includes demo tool)
npm run build

# Or build just the demo module
npm run build:demo
```

The build process:
1. Compiles TypeScript source files to JavaScript
2. Fixes ES module imports for compatibility
3. Handles `__dirname` replacement for ES modules

## Usage Guide

### Command Reference

The demo tool provides several commands for managing demo states:

#### List Available States
```bash
# Show all available demo states
npm run demo list
# or
npx ai-engineer-demo list
```

#### Set Demo State
```bash
# Set up a specific demo state
npm run demo set <state-name>
# or
npx ai-engineer-demo set gather-editing
```

#### Check Current State
```bash
# Show current state and file structure
npm run demo current
# or
npx ai-engineer-demo current
```

#### Reset/Clear
```bash
# Remove current .ai directory
npm run demo:reset
# or
npx ai-engineer-demo reset
```

#### Backup & Restore
```bash
# Create backup of current .ai directory
npx ai-engineer-demo backup

# Restore from most recent backup
npx ai-engineer-demo restore

# Restore from specific backup
npx ai-engineer-demo restore .ai-backup-2024-01-15T10-30-00-000Z
```

#### Help
```bash
# Show help information
npm run demo help
# or
npx ai-engineer-demo help
```

### Common Workflows

#### Exploring the Workflow
```bash
# Start fresh
npm run demo:reset

# Set up initial planning state
npm run demo set gather-editing

# Check what files were created
npm run demo current

# Progress to task execution
npm run demo set achieve-task-drafting

# See completed workflow
npm run demo set achieve-complete
```

#### Testing PR Review Flow
```bash
# Set up PR review scenario
npm run demo set pr-gathering-comments

# Progress through review process
npm run demo set pr-review-task-draft

# Check the realistic PR content
cat .ai/task/comments.md
cat .ai/task/review-task.md
```

### Best Practices

1. **Backup Before Changes**: Always backup your existing `.ai` folder if it contains important work
2. **Clean State**: Use `reset` between different demo scenarios to avoid file conflicts
3. **Explore Content**: Read the generated files to understand the realistic scenarios
4. **Use Current Command**: Regularly check `current` to understand the file structure

## Available Demo States

### Planning Phase States

#### `gather-needs-context`
- **Description**: Fresh start - no files exist yet
- **State**: `GATHER_NEEDS_CONTEXT`
- **Files Created**: None (empty .ai directory)
- **Use**: Starting point for new workflows

#### `gather-editing-context`
- **Description**: Context file exists, working on initial project context
- **State**: `GATHER_EDITING_CONTEXT`
- **Files Created**:
  - `.ai/task/context.md` - Project context with authentication system example
  - `.ai/task/state.json` - State machine state
- **Content**: Realistic web application authentication project context

#### `gather-editing`
- **Description**: Plan file exists with acceptance criteria, ready to start work
- **State**: `GATHER_EDITING`
- **Files Created**:
  - `.ai/task/context.md` - Project context
  - `.ai/task/plan.md` - Structured plan with unchecked acceptance criteria
  - `.ai/task/state.json` - State machine state
- **Content**: Complete project plan with 7 acceptance criteria for JWT authentication system

### Execution Phase States

#### `achieve-task-drafting`
- **Description**: Task file exists, ready to execute work
- **State**: `ACHIEVE_TASK_DRAFTING`
- **Files Created**:
  - All planning files from previous states
  - `.ai/task/task.md` - Individual task with steps and verification criteria
- **Content**: Specific task for implementing JWT authentication core functionality

#### `achieve-task-executed`
- **Description**: Task completed with results, ready for review
- **State**: `ACHIEVE_TASK_EXECUTED`
- **Files Created**:
  - All previous files
  - `.ai/task/task-results.md` - Detailed execution results with code changes, test coverage, and performance metrics
- **Content**: Realistic task completion report with file changes, test results, and next steps

#### `achieve-complete`
- **Description**: All acceptance criteria met, workflow complete
- **State**: `ACHIEVE_COMPLETE`
- **Files Created**:
  - `.ai/task/context.md` - Project context
  - `.ai/task/plan.md` - Plan with all acceptance criteria checked (✅)
- **Content**: Completed project plan showing successful implementation of all features

### PR Review States

#### `pr-gathering-comments`
- **Description**: PR review mode, collecting comments from GATHER phase
- **State**: `PR_GATHERING_COMMENTS_G`
- **Files Created**:
  - All planning files
  - `.ai/task/comments.md` - Realistic PR review comments with security and quality feedback
- **Content**: Detailed PR review with critical security issues, code quality suggestions, and test recommendations

#### `pr-review-task-draft`
- **Description**: PR review task being drafted
- **State**: `PR_REVIEW_TASK_DRAFT_G`
- **Files Created**:
  - All previous PR files
  - `.ai/task/review-task.md` - Structured task to address PR feedback
- **Content**: Prioritized task addressing security vulnerabilities, code improvements, and test coverage gaps

### Error States

#### `error-plan-missing`
- **Description**: Error state demonstration - plan file missing
- **State**: `ERROR_PLAN_MISSING`
- **Files Created**:
  - `.ai/task/context.md` - Project context only
- **Content**: Shows what happens when the workflow encounters missing required files

## Implementation Details

### Architecture Overview

The demo tool consists of several key components:

```
src/demo/
├── index.ts          # Core demo management logic
├── cli.ts            # Command-line interface handlers
└── templates.ts      # Template processing and content generation
```

### Core Components

#### DemoManager (`src/demo/index.ts`)
- Manages demo state operations (list, set, reset, backup, restore)
- Handles `.ai` directory lifecycle
- Provides state validation and safety checks

#### CLI Handlers (`src/demo/cli.ts`)
- Command parsing and routing
- User interface and help system
- Error handling and user feedback

#### Template Processor (`src/demo/templates.ts`)
- Generates realistic content for each demo state
- Creates proper file structures
- Handles state-specific file requirements

### File Structure

When a demo state is set, the tool creates:

```
.ai/
└── task/
    ├── state.json           # State machine state
    ├── context.md           # Project context (most states)
    ├── plan.md             # Project plan (planning+ states)
    ├── task.md             # Current task (execution states)
    ├── task-results.md     # Task results (executed states)
    ├── comments.md         # PR comments (PR states)
    └── review-task.md      # Review task (PR states)
```

### Build Process

The demo tool uses a custom build process to handle ES module compatibility:

1. **TypeScript Compilation**: `tsc -p tsconfig.demo.json`
2. **Import Fixing**: `scripts/fix-demo-imports.js` adds `.js` extensions
3. **ES Module Compatibility**: Replaces `__dirname` with ES module equivalent

### ES Module Compatibility

The tool handles several ES module compatibility challenges:

- **Import Extensions**: Automatically adds `.js` extensions to relative imports
- **__dirname Replacement**: Uses `path.dirname(fileURLToPath(import.meta.url))`
- **Module Resolution**: Proper ES module import/export patterns

## Development & Customization

### Adding New Demo States

To add a new demo state:

1. **Update DEMO_STATES** in `src/demo/index.ts`:
```typescript
export const DEMO_STATES: Record<string, DemoState> = {
  // ... existing states
  'my-new-state': {
    name: 'my-new-state',
    displayName: 'My New State',
    description: 'Description of what this state represents',
    state: 'ACTUAL_STATE_MACHINE_STATE'
  }
}
```

2. **Add Template Method** in `src/demo/templates.ts`:
```typescript
private getMyNewStateTemplate(): DemoTemplate {
  return {
    files: {
      'task/example.md': `# Example Content
      
Content for the new state...`,
    },
    state: { currentState: 'ACTUAL_STATE_MACHINE_STATE' }
  };
}
```

3. **Update Switch Statement** in `getTemplate()` method:
```typescript
case 'my-new-state':
  return this.getMyNewStateTemplate();
```

4. **Rebuild**: Run `npm run build:demo` to compile changes

### Template System

Templates use a simple object structure:

```typescript
interface DemoTemplate {
  files: Record<string, string>;  // filepath -> content mapping
  state: {
    currentState: string;          // state machine state
  };
}
```

**File Path Format**: Relative to `.ai/` directory (e.g., `'task/plan.md'` creates `.ai/task/plan.md`)

**Content Format**: Raw markdown or text content with realistic examples

### Modifying Existing Content

To update existing demo content:

1. Find the appropriate template method in `src/demo/templates.ts`
2. Modify the file content strings
3. Ensure content matches the intended workflow state
4. Rebuild with `npm run build:demo`

**Content Guidelines**:
- Use realistic project examples (avoid generic placeholders)
- Include proper markdown formatting
- Escape backticks in code blocks: `` \`\`\` ``
- Match the complexity level of the workflow state

## Troubleshooting

### Common Issues

#### "Cannot find module" Errors
**Problem**: ES module import paths missing `.js` extensions

**Solution**: 
```bash
# Rebuild the demo module
npm run build:demo
```

#### "__dirname is not defined" Errors
**Problem**: `__dirname` used in ES module context

**Solution**: The build script should handle this automatically. If it persists:
```bash
# Check if the fix-demo-imports script ran
ls -la scripts/fix-demo-imports.js
npm run build:demo
```

#### "Demo CLI error: No template found"
**Problem**: Invalid state name or missing template method

**Solution**:
```bash
# Check available states
npm run demo list

# Ensure state name matches exactly
npm run demo set gather-editing  # correct
npm run demo set gather_editing  # incorrect
```

### Build Problems

#### TypeScript Compilation Errors
**Problem**: Type errors in demo source files

**Solution**:
```bash
# Check TypeScript compilation
npx tsc -p tsconfig.demo.json --noEmit

# Fix type errors in src/demo/ files
# Rebuild
npm run build:demo
```

#### Missing Dependencies
**Problem**: Import errors for missing Node.js modules

**Solution**: All dependencies should be built-in Node.js modules. Check import statements for typos.

### Platform-Specific Considerations

#### Windows Path Issues
File paths use Node.js `path` module for cross-platform compatibility. No special handling required.

#### Permissions
Ensure write permissions for:
- `.ai/` directory creation
- Backup directory creation (`.ai-backup-*`)
- Temporary file operations

## Command Reference Summary

| Command | Description | Example |
|---------|-------------|---------|
| `list` | Show available demo states | `npm run demo list` |
| `set <state>` | Set up demo state | `npm run demo set gather-editing` |
| `current` | Show current state info | `npm run demo current` |
| `reset` | Remove .ai directory | `npm run demo:reset` |
| `backup` | Create backup | `npx ai-engineer-demo backup` |
| `restore [path]` | Restore backup | `npx ai-engineer-demo restore` |
| `help` | Show help | `npm run demo help` |

## File Reference

| File | Purpose |
|------|---------|
| `bin/demo-cli.mjs` | CLI entry point |
| `src/demo/index.ts` | Core demo management |
| `src/demo/cli.ts` | CLI command handlers |
| `src/demo/templates.ts` | Content templates |
| `scripts/fix-demo-imports.js` | Build-time import fixer |
| `tsconfig.demo.json` | Demo module TypeScript config |