# Implement Next Transition

This command systematically implements state machine transitions from the specification.

## Description

Analyzes the state machine specification and implements the next unimplemented transition according to the transition tables defined in `state-machine/state-machine.md`. Tracks implementation progress by adding/updating an "Implementation" column in the transition tables.

## Instructions

You are implementing state machine transitions for the AI Engineer workflow system. Follow these steps:

### Step 1: Parse State Machine Specification

1. Read `state-machine/state-machine.md` and extract all transition tables
2. Read `state-machine/implementation-plan.md` for architectural guidance
3. Identify the transition table format and extract:
   - Transition ID (e.g., GC1, G2, P1)
   - Current State
   - Trigger (Spell)
   - MCP Condition
   - Next State
   - MCP Actions
   - Response file reference
   - Implementation status (if column exists)
   - **Line number where the transition is defined** (for documentation references)

### Step 2: Identify Next Table to Implement

1. Scan all transition tables in `state-machine/state-machine.md` in order:
   - Context Gathering Phase Transitions
   - Gather Acceptance Criteria Phase Transitions
   - Context Gathering Phase Blocked Transitions
   - Context Gathering Phase No-op Transitions
   - Gather Acceptance Criteria Phase Blocked Transitions
   - Gather Acceptance Criteria Phase No-op Transitions
   - Achieve Acceptance Criteria Phase Transitions
   - Achieve Acceptance Criteria Phase Blocked Transitions
   - PR Review Phase Transitions
   - Starting PR Review (Reparo) Transitions
   - PR Review Confirmation Transitions
   - Error State Recovery Transitions
   - Error State Other Transitions
   - Finite Transitions (Universal Return to Plan)
   - Blocked Finite Transitions
   - Reverto Transitions (Exit PR Review)
   - PR Review Phase Blocked Transitions
   - Universal Lumos Transitions
   - Universal Expecto Transitions

2. For each table, check if:
   - "Implementation" column exists
   - If it exists, check if all values are "yes"
   - If column doesn't exist OR has empty/no values, this is the next table to implement

3. Pick the first transition from the identified table that needs implementation

### Step 3: Generate Transition Implementation

For the next unimplemented transition, generate TypeScript code following this pattern:

```typescript
// Import statements (NO file extensions!)
import { Transition, FILE_PATHS } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';
import { TemplateUtils } from '../../utils/templateUtils';

/**
 * [TRANSITION_ID]: [FROM_STATE] + [SPELL] -> [TO_STATE]
 * From: [TABLE_NAME] table
 * Reference: state-machine/state-machine.md:[LINE_NUMBER]
 * Purpose: [Brief description of what this transition does]
 */
export const [transitionId]Transition: Transition = {
  fromState: 'SOURCE_STATE_NAME',
  spell: 'SPELL_NAME',
  toState: 'NEXT_STATE_NAME',
  // OPTION 1: No condition property (omit entirely if there is no condition to apply)

  // OPTION 2: Condition with actual logic (when MCP Condition column has checks)
  condition: async (context: StateContext, fileSystem: FileSystem) => {
    // Implementation based on MCP Condition column
    // Example: Checks `.ai/task/context.md` exists (exists)
    return await fileSystem.exists(FILE_PATHS.CONTEXT_FILE);
  },
  execute: async (context: StateContext, fileSystem: FileSystem) => {
    // Implementation based on MCP Actions column
    // Perform file operations
    // Get response template
    const response = ResponseUtils.formatResponse('response_key');
    // Process any placeholders if needed

    return {
      message: response,
    };
  },
};

// Export the array including the individual transition
export const [fileName]Transitions: Transition[] = [
  [transitionId]Transition,
  // ... other transitions
];
```

### Step 4: Implementation Guidelines

1. **Import Statements**: Always remove file extensions from imports to avoid module resolution issues:
   - ✅ `import { Transition } from '../../types';`
   - ❌ `import { Transition } from '../../types.js';`

2. **Individual Exports**: Export each transition individually with a descriptive name:
   - Pattern: `[transitionId]Transition` (e.g., `gc1Transition`, `g2Transition`)
   - Include detailed JSDoc comment with table reference and line number

3. **Conditions**: Convert MCP Condition descriptions to file existence checks and content parsing:
   - "Checks `.ai/task/context.md` exists (exists)" → `await fileSystem.exists(FILE_PATHS.CONTEXT_FILE)`
   - "Reads content; Extracts URLs (finds some)" → Parse content and check for URLs
   - Use existing utilities from `planUtils.ts` and other utility files
   - Use `FILE_PATHS` constants instead of hardcoded strings

4. **Actions**: Convert MCP Actions to file operations using FileSystem interface:
   - "Creates `.ai/task/context.md` with template" → Use `TemplateUtils.writeTemplate()`
   - "Archives files to path" → Use `TaskUtils.archiveTask()` or `TaskUtils.archiveReviewTask()`
   - "Reads content; Replaces placeholder" → Use `fileSystem.readSafe()` for safe reading, process, and use in response
   - "Creates base directories" → Use `TaskUtils.createBaseDirectories()`

5. **Responses**: Use `ResponseUtils.formatResponse()` from response utilities:
   - Extract response file name from Response column
   - Convert file path to response key (e.g., "responses/gather_transitions/GC1.md" → "gather_transitions_GC1")
   - Handle placeholders using ResponseUtils methods:
     - `ResponseUtils.hasPlaceholders()` to check for placeholders
     - `ResponseUtils.getPlaceholders()` to identify required replacements
     - `ResponseUtils.formatResponse(responseKey, replacements)` to replace placeholders
   - Common placeholders include: `[TASK_CONTENT_PLACEHOLDER]`, `[ATLASSIAN_URLS_PLACEHOLDER]`, `[REVIEW_TASK_RESULTS_PLACEHOLDER]`, etc.

6. **Templates**: Use `TemplateUtils` class when creating new files from templates

7. **Error Handling**: Include proper error handling for file operations

8. **Type Safety**: Ensure all TypeScript types are correct

### Step 5: Add to Appropriate File

1. Determine which transition file based on the table-to-file mapping:
   - **Context Gathering Phase Transitions** → `contextGather/contextGatheringTransitions.ts`
   - **Gather Acceptance Criteria Phase Transitions** → `contextGather/gatherAcceptanceCriteriaTransitions.ts`
   - **Context Gathering Phase Blocked Transitions** → `contextGather/contextGatheringBlocked.ts`
   - **Context Gathering Phase No-op Transitions** → `contextGather/contextGatheringNoop.ts`
   - **Gather Acceptance Criteria Phase Blocked Transitions** → `contextGather/gatherAcceptanceCriteriaBlocked.ts`
   - **Gather Acceptance Criteria Phase No-op Transitions** → `contextGather/gatherAcceptanceCriteriaNoop.ts`
   - **Achieve Acceptance Criteria Phase Transitions** → `achieve/achieveAcceptanceCriteriaTransitions.ts`
   - **Achieve Acceptance Criteria Phase Blocked Transitions** → `achieve/achieveAcceptanceCriteriaBlocked.ts`
   - **PR Review Phase Transitions** → `prReview/prReviewTransitions.ts`
   - **Starting PR Review (Reparo) Transitions** → `prReview/startingPrReviewTransitions.ts`
   - **PR Review Confirmation Transitions** → `prReview/prReviewConfirmationTransitions.ts`
   - **PR Review Phase Blocked Transitions** → `prReview/prReviewBlocked.ts`
   - **Error State Recovery Transitions** → `errorState/errorStateRecoveryTransitions.ts`
   - **Error State Other Transitions** → `errorState/errorStateOtherTransitions.ts`
   - **Finite Transitions (Universal Return to Plan)** → `universal/finiteTransitions.ts`
   - **Blocked Finite Transitions** → `universal/finiteBlocked.ts`
   - **Reverto Transitions (Exit PR Review)** → `universal/revertoTransitions.ts`
   - **Universal Lumos Transitions** → `universal/lumosTransitions.ts`
   - **Universal Expecto Transitions** → `universal/expectoTransitions.ts`

2. Add the individual transition export to the file
3. Add the transition to the appropriate transition array
4. Ensure imports are correct (add any new utility imports needed - WITHOUT file extensions)
5. Maintain logical ordering of transitions

### Step 6: Write Tests

Write tests for the implemented transition alongside the implementation:

1. **Use MockFileSystem from testUtils**: Import `MockFileSystem` from `../../testUtils` instead of creating inline mocks
2. **Test Individual Transitions**: Import and test the individual transition directly (e.g., `gc1Transition`), never use `.find()` to locate transitions in arrays
3. **Test Structure Pattern**:

   ```typescript
   import { [transitionName]Transition, [fileName]Transitions } from './[fileName]';
   import { MockFileSystem } from '../../testUtils';
   import { StateContext, FILE_PATHS } from '../../types';
   import { ResponseUtils } from '../../utils/responseUtils';

   describe('[File Name] Transitions', () => {
     let mockFileSystem: MockFileSystem;
     let mockContext: StateContext;

     beforeEach(() => {
       mockFileSystem = new MockFileSystem();
       mockContext = { currentState: 'CURRENT_STATE' };
     });

     describe('[TRANSITION_ID] - [FROM_STATE] + [SPELL] -> [TO_STATE]', () => {
       it('should be defined with correct properties', () => {
         expect([transitionName]Transition).toBeDefined();
         expect([transitionName]Transition.fromState).toBe('FROM_STATE');
         // ... other property tests
       });

       it('should perform expected file operations', async () => {
         await [transitionName]Transition.execute(mockContext, mockFileSystem);
         // Test file operations directly
       });

       // ... other behavior tests
     });

     it('should have transitions defined', () => {
       expect([fileName]Transitions).toBeDefined();
       expect([fileName]Transitions.length).toBeGreaterThan(0);
     });
   });
   ```

4. **Focus on Behavior**: Test what the transition does, not how it finds transitions
5. **Test Coverage**: Cover condition logic, file operations, response generation, and error handling

### Step 7: Update Implementation Status

After successfully implementing a transition:

1. Add "Implementation" column to the table if it doesn't exist
2. Set the implemented transition's row to "yes" in the Implementation column
3. Save the updated `state-machine/state-machine.md` file

### Step 8: Stop for Review

After implementing ONE transition and its tests:

1. Show the generated code
2. Show the generated tests
3. Show the updated table with Implementation status
4. Explain which transition was implemented and which file it was added to
5. Run tests and lint to verify implementation
6. Ask for approval before continuing

## Important Notes

- Only implement ONE transition at a time
- **Export transitions individually** with descriptive names (e.g., `gc1Transition`)
- **Use MockFileSystem from testUtils** - never create inline mock implementations
- **Remove file extensions from imports** to avoid module resolution issues
- **Include state machine row references** with file path and line number in JSDoc comments
- **Test individual transitions directly** - never use `.find()` to locate transitions in tests
- Use the FileSystem abstraction, never direct fs operations
- All responses must use the ResponseUtils class
- Use FILE_PATHS constants instead of hardcoded file paths
- Include proper TypeScript typing
- Test the implementation before moving to the next transition
- Update the state-machine.md file to track progress

## Files to Reference

- `state-machine/state-machine.md` - Complete state machine specification
- `state-machine/implementation-plan.md` - Architecture and patterns
- `src/state-machine/types.ts` - Type definitions and FILE_PATHS constants
- `src/state-machine/utils/responseUtils.ts` - Response processing with ResponseUtils class
- `src/state-machine/utils/templateUtils.ts` - Template operations with TemplateUtils class
- `src/state-machine/fileSystem.ts` - FileSystem interface with safe reading and validation methods
- `src/state-machine/utils/planUtils.ts` - Plan processing utilities
- `src/state-machine/utils/taskUtils.ts` - Task archiving utilities with TaskUtils class
- `src/state-machine/utils/index.ts` - Utility exports and factory functions
- `src/state-machine/testUtils/MockFileSystem.ts` - Reusable mock file system for testing

## Success Criteria

- One new transition is correctly implemented with individual export
- Transition includes JSDoc comment with table reference and line number
- Code follows established patterns (no file extensions in imports, uses utilities)
- Tests use MockFileSystem from testUtils and test individual transitions directly
- Implementation status is updated in state-machine.md
- Tests pass: `npm run test`
- Linting passes: `npm run lint`
- Ready for manual review and approval

## Example Workflow

1. Find first table without Implementation column (e.g., "Context Gathering Phase Transitions")
2. Implement first transition (e.g., GC1: GATHER_NEEDS_CONTEXT + Accio) with proper JSDoc reference
3. Export individually as `gc1Transition` and add to array in `contextGather/contextGatheringTransitions.ts`
4. Write tests in `contextGather/contextGatheringTransitions.test.ts` using MockFileSystem and testing `gc1Transition` directly
5. Add Implementation column to table and mark GC1 as "yes"
6. Run tests and lint to verify implementation
7. Stop for review and approval
8. Repeat for next unimplemented transition
