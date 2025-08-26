# AI Engineer Demo System Overhaul Plan

## Current State Analysis

### Existing Demo System

The current demo system uses descriptive names and only creates `.ai` folders:

**Current Demo States:**

- `gather-needs-context` - Fresh Start
- `gather-editing-context` - Context Created
- `gather-editing` - Plan Ready
- `achieve-task-drafting` - Task Ready
- `achieve-task-executed` - Task Completed
- `achieve-complete` - Workflow Complete
- `pr-gathering-comments` - PR Review Started
- `pr-review-task-draft` - PR Review Task
- `error-plan-missing` - Error State

**Current Structure:**

```
demos/gather-editing/.ai/task/
├── context.md
├── plan.md
└── state.json
```

**Limitations:**

- Only creates `.ai` folders, no actual project code
- Descriptive names don't show clear progression
- No runnable code to demonstrate implementation stages
- MCP server can't see actual implementation evolution

## New System Design

### Numbered Demo States

Replace current system with 11 numbered states showing complete project evolution:

1. **01-empty** - Completely empty directory (fresh start)
2. **02-context-gathering** - Working on project context
3. **03-context-complete** - Context established
4. **04-planning** - Creating project plan
5. **05-plan-ready** - Plan complete with acceptance criteria
6. **06-setup-drafting** - Project setup task in progress
7. **07-setup-executed** - TypeScript + Jest project fully set up
8. **08-calculator-drafting** - Calculator implementation in progress
9. **09-calculator-executed** - Calculator fully implemented with tests
10. **10-pr-review** - PR review feedback phase
11. **11-final-complete** - All feedback addressed, production ready

### CLI Command Format

```bash
npx ai-engineer-demo set 01-empty
npx ai-engineer-demo set 02-context-gathering
npx ai-engineer-demo set 05-plan-ready
npx ai-engineer-demo set 09-calculator-executed
```

## Complete File Structure Specifications

### 01-empty/

```
(completely empty directory)
```

### 02-context-gathering/

```
├── .ai/task/
│   ├── context.md (basic calculator project context, in progress)
│   └── state.json
```

### 03-context-complete/

```
├── .ai/task/
│   ├── context.md (complete calculator project context)
│   └── state.json
```

### 04-planning/

```
├── .ai/task/
│   ├── context.md (complete)
│   ├── plan.md (project plan in progress)
│   └── state.json
```

### 05-plan-ready/

```
├── .ai/task/
│   ├── context.md (complete)
│   ├── plan.md (complete plan with acceptance criteria)
│   └── state.json
```

### 06-setup-drafting/

```
├── .ai/task/
│   ├── context.md
│   ├── plan.md
│   ├── task.md (project setup task in progress)
│   └── state.json
├── package.json (basic, minimal dependencies)
└── README.md (project description)
```

### 07-setup-executed/

```
├── .ai/task/
│   ├── context.md
│   ├── plan.md
│   ├── task.md (setup task completed ✓)
│   ├── task-results.md (setup completion results)
│   └── state.json
├── package.json (TypeScript + Jest + dev dependencies)
├── tsconfig.json
├── jest.config.js
├── src/
│   └── index.ts (empty entry point)
├── tests/
│   └── .gitkeep
└── README.md
```

### 08-calculator-drafting/

```
├── .ai/task/
│   ├── context.md
│   ├── plan.md
│   ├── task.md (calculator implementation in progress)
│   └── state.json
├── [all setup files from 07]
├── src/
│   ├── Calculator.ts (skeleton class with method stubs)
│   └── index.ts (exports Calculator)
└── tests/
    └── Calculator.test.ts (test stubs/basic tests)
```

### 09-calculator-executed/

```
├── .ai/task/
│   ├── context.md
│   ├── plan.md
│   ├── task.md (calculator task completed ✓)
│   ├── task-results.md (implementation results)
│   └── state.json
├── [all setup files]
├── src/
│   ├── Calculator.ts (fully implemented with error handling)
│   └── index.ts
└── tests/
    └── Calculator.test.ts (complete test suite with 100% coverage)
```

### 10-pr-review/

```
├── .ai/task/
│   ├── context.md
│   ├── plan.md
│   ├── comments.md (PR review feedback)
│   └── state.json
├── [same project files as 09]
```

### 11-final-complete/

```
├── .ai/task/
│   ├── context.md
│   ├── plan.md (all criteria checked ✅)
│   ├── review-task.md (feedback addressed)
│   └── state.json
├── package.json
├── tsconfig.json
├── jest.config.js
├── src/
│   ├── Calculator.ts (polished with JSDoc)
│   └── index.ts
├── tests/
│   └── Calculator.test.ts (enhanced tests)
└── README.md (complete usage documentation)
```

## Implementation Steps

### Phase 1: Backup and Clean

1. **Backup existing demos** (optional, for reference)
2. **Delete entire `demos/` directory**
3. **Create new `demos/` directory structure**

### Phase 2: Create New Demo States

1. **Create 11 numbered demo directories**
2. **Populate each with appropriate file structure**
3. **Create realistic content for each stage**

### Phase 3: Update Source Code

1. **Update `src/demo/index.ts`**
2. **Update `src/demo/cli.ts`**
3. **Modify CLI behavior for full project copying**

### Phase 4: Testing and Documentation

1. **Test all demo states**
2. **Update documentation**
3. **Verify MCP integration**

## Required Code Changes

### src/demo/index.ts

**Replace DEMO_STATES object:**

```typescript
export const DEMO_STATES: Record<string, DemoState> = {
  '01-empty': {
    name: '01-empty',
    displayName: 'Empty Start',
    description: 'Completely empty directory - fresh start',
    state: 'GATHER_NEEDS_CONTEXT',
  },
  '02-context-gathering': {
    name: '02-context-gathering',
    displayName: 'Context Gathering',
    description: 'Working on project context for calculator',
    state: 'GATHER_EDITING_CONTEXT',
  },
  '03-context-complete': {
    name: '03-context-complete',
    displayName: 'Context Complete',
    description: 'Calculator project context established',
    state: 'GATHER_EDITING_CONTEXT',
  },
  '04-planning': {
    name: '04-planning',
    displayName: 'Planning',
    description: 'Creating project plan with acceptance criteria',
    state: 'GATHER_EDITING',
  },
  '05-plan-ready': {
    name: '05-plan-ready',
    displayName: 'Plan Ready',
    description: 'Complete plan with calculator acceptance criteria',
    state: 'GATHER_EDITING',
  },
  '06-setup-drafting': {
    name: '06-setup-drafting',
    displayName: 'Setup Drafting',
    description: 'TypeScript project setup task in progress',
    state: 'ACHIEVE_TASK_DRAFTING',
  },
  '07-setup-executed': {
    name: '07-setup-executed',
    displayName: 'Setup Executed',
    description: 'TypeScript + Jest project fully configured',
    state: 'ACHIEVE_TASK_EXECUTED',
  },
  '08-calculator-drafting': {
    name: '08-calculator-drafting',
    displayName: 'Calculator Drafting',
    description: 'Calculator implementation task in progress',
    state: 'ACHIEVE_TASK_DRAFTING',
  },
  '09-calculator-executed': {
    name: '09-calculator-executed',
    displayName: 'Calculator Executed',
    description: 'Calculator fully implemented with complete tests',
    state: 'ACHIEVE_TASK_EXECUTED',
  },
  '10-pr-review': {
    name: '10-pr-review',
    displayName: 'PR Review',
    description: 'Pull request review with feedback collected',
    state: 'PR_GATHERING_COMMENTS_G',
  },
  '11-final-complete': {
    name: '11-final-complete',
    displayName: 'Final Complete',
    description: 'All feedback addressed, production ready',
    state: 'ACHIEVE_COMPLETE',
  },
};
```

**Update setState method:**

```typescript
async setState(stateName: string): Promise<void> {
  const demoState = DEMO_STATES[stateName];
  if (!demoState) {
    throw new Error(
      `Unknown demo state: ${stateName}. Available states: ${Object.keys(DEMO_STATES).join(', ')}`
    );
  }

  const demoSourcePath = path.join(this.demosDir, stateName);

  // Check if demo folder exists
  try {
    await fs.access(demoSourcePath);
  } catch {
    throw new Error(`Demo folder not found: ${demoSourcePath}`);
  }

  // For 01-empty, just create empty directory
  if (stateName === '01-empty') {
    // Remove everything in current directory except hidden files and node_modules
    const files = await fs.readdir('.');
    for (const file of files) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        await fs.rm(file, { recursive: true, force: true });
      }
    }
    return;
  }

  // For other states, copy entire project
  // Remove existing files (except .git, node_modules)
  const files = await fs.readdir('.');
  for (const file of files) {
    if (!file.startsWith('.') && file !== 'node_modules') {
      await fs.rm(file, { recursive: true, force: true });
    }
  }

  // Copy demo state content to current directory
  await this.copyDirectory(demoSourcePath, '.');
}
```

### src/demo/cli.ts

**Update help text:**

```typescript
function showHelp(): void {
  console.log(`
🧙‍♂️ AI Engineer Demo Tool

USAGE:
  npx ai-engineer-demo <command> [options]

COMMANDS:
  list, ls              List all available demo states
  set <state-name>      Set up a specific demo state
  reset, clear          Remove current demo content
  current, status       Show current state and file structure
  backup                Create backup of current directory
  restore [path]        Restore from backup
  help, -h, --help      Show this help message

EXAMPLES:
  npx ai-engineer-demo list
  npx ai-engineer-demo set 01-empty
  npx ai-engineer-demo set 05-plan-ready
  npx ai-engineer-demo set 09-calculator-executed
  npx ai-engineer-demo current

DEMO STATES:
  01-empty              Empty Start - Fresh directory
  02-context-gathering  Context Gathering - Working on context
  03-context-complete   Context Complete - Context established
  04-planning           Planning - Creating project plan
  05-plan-ready         Plan Ready - Complete plan ready
  06-setup-drafting     Setup Drafting - Project setup in progress
  07-setup-executed     Setup Executed - TypeScript + Jest ready
  08-calculator-drafting Calculator Drafting - Implementation in progress
  09-calculator-executed Calculator Executed - Full implementation
  10-pr-review          PR Review - Review feedback phase
  11-final-complete     Final Complete - Production ready

For more information, visit: https://github.com/your-org/ai-engineer
`);
}
```

## Content Templates

### Context Template (used in states 02-11)

```markdown
# Task Context

## Overview

Creating a simple calculator TypeScript class for a Node.js project. The calculator should support basic arithmetic operations and be well-tested.

## Goals

- Implement a Calculator class with basic operations
- Add comprehensive error handling
- Include thorough unit tests
- Follow TypeScript best practices

## Technical Requirements

- Use TypeScript with strict mode enabled
- Support addition, subtraction, multiplication, division
- Handle division by zero errors
- Include floating-point precision handling
- Must have 100% test coverage

## Resources

### Relevant Files/Documentation

- `src/` - Source code directory
- `tests/` - Test files directory
- `package.json` - Project configuration
```

### Plan Template (used in states 04-11)

```markdown
# Project Plan

## Summary

Create a comprehensive Calculator TypeScript class with full test coverage and proper error handling for basic arithmetic operations.

## Acceptance Criteria

- [ ] Calculator class with add, subtract, multiply, divide methods
- [ ] Handle division by zero with proper error handling
- [ ] Support floating-point precision handling
- [ ] Comprehensive unit tests with 100% coverage
- [ ] TypeScript strict mode compliance
- [ ] Proper JSDoc documentation
- [ ] Export class for easy importing

## Technical Approach

### Phase 1: Project Setup

- Initialize TypeScript project
- Configure Jest for testing
- Set up project structure

### Phase 2: Core Implementation

- Create Calculator class with basic methods
- Implement proper TypeScript types
- Add input validation

### Phase 3: Error Handling & Testing

- Add division by zero handling
- Implement comprehensive test suite
- Achieve 100% test coverage

### Phase 4: Documentation & Polish

- Add JSDoc comments
- Create usage examples
- Final code review and cleanup
```

### Package.json Template (states 06-11)

```json
{
  "name": "calculator-demo",
  "version": "1.0.0",
  "description": "Simple TypeScript calculator with comprehensive tests",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "dev": "ts-node src/index.ts"
  },
  "keywords": ["calculator", "typescript", "jest", "demo"],
  "author": "AI Engineer Demo",
  "license": "MIT",
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^18.15.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

### Calculator.ts Template (states 08-11)

**State 08 (drafting):**

```typescript
/**
 * Simple Calculator class for basic arithmetic operations
 */
export class Calculator {
  /**
   * Add two numbers
   */
  add(a: number, b: number): number {
    // TODO: Implement addition
    throw new Error('Not implemented');
  }

  /**
   * Subtract two numbers
   */
  subtract(a: number, b: number): number {
    // TODO: Implement subtraction
    throw new Error('Not implemented');
  }

  /**
   * Multiply two numbers
   */
  multiply(a: number, b: number): number {
    // TODO: Implement multiplication
    throw new Error('Not implemented');
  }

  /**
   * Divide two numbers
   */
  divide(a: number, b: number): number {
    // TODO: Implement division with zero checking
    throw new Error('Not implemented');
  }
}
```

**State 09+ (executed):**

```typescript
/**
 * Simple Calculator class for basic arithmetic operations
 */
export class Calculator {
  /**
   * Add two numbers
   * @param a First number
   * @param b Second number
   * @returns Sum of a and b
   */
  add(a: number, b: number): number {
    this.validateInput(a, b);
    return a + b;
  }

  /**
   * Subtract two numbers
   * @param a First number
   * @param b Second number
   * @returns Difference of a and b
   */
  subtract(a: number, b: number): number {
    this.validateInput(a, b);
    return a - b;
  }

  /**
   * Multiply two numbers
   * @param a First number
   * @param b Second number
   * @returns Product of a and b
   */
  multiply(a: number, b: number): number {
    this.validateInput(a, b);
    return a * b;
  }

  /**
   * Divide two numbers
   * @param a Dividend
   * @param b Divisor
   * @returns Quotient of a and b
   * @throws Error if b is zero
   */
  divide(a: number, b: number): number {
    this.validateInput(a, b);
    if (b === 0) {
      throw new Error('Division by zero is not allowed');
    }
    return a / b;
  }

  /**
   * Validate input parameters
   * @param a First number
   * @param b Second number
   * @throws Error if inputs are not valid numbers
   */
  private validateInput(a: number, b: number): void {
    if (typeof a !== 'number' || typeof b !== 'number') {
      throw new Error('Both arguments must be numbers');
    }
    if (isNaN(a) || isNaN(b)) {
      throw new Error('Arguments cannot be NaN');
    }
  }
}
```

## Benefits of New System

### For Users

- **Clear Progression**: Numbers show exact workflow order
- **Time Travel**: Jump to any development stage with real code
- **Complete Context**: See full project evolution, not just .ai files
- **Runnable Code**: Can execute `npm test`, `npm run build` at appropriate stages

### For MCP Integration

- **Real Implementation**: AI can see and modify actual source code
- **Progressive Development**: Shows realistic development workflow
- **Testing Integration**: Can run actual tests and see results
- **Full Project Context**: AI understands complete project structure

### For Demonstrations

- **Realistic Scenarios**: Shows real TypeScript + Jest development
- **Clear Teaching**: Easy to explain numbered progression
- **Flexible Navigation**: Jump to any stage for specific demonstrations
- **Complete Examples**: Shows best practices for project structure

## Migration Strategy

1. **Create backup** of existing demos (optional)
2. **Remove old demos directory** entirely
3. **Create new demos structure** with 11 numbered states
4. **Update source code** with new state definitions
5. **Build and test** the new system
6. **Update documentation** to reflect new commands

## Testing Plan

1. **Test each demo state individually**
2. **Verify project files are created correctly**
3. **Test runnable code** (npm test, npm run build where applicable)
4. **Verify MCP integration** with real projects
5. **Test CLI commands** with new numbered format
6. **Verify backup/restore functionality**

This plan provides a complete blueprint for transforming the demo system into a powerful, realistic development workflow demonstration tool.
