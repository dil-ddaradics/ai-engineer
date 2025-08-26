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
{
  id: 'TRANSITION_ID',
  sourceState: 'SOURCE_STATE_NAME',
  spell: 'SPELL_NAME',
  condition: async (fileSystem: FileSystem) => {
    // Implementation based on MCP Condition column
    // Return boolean result
  },
  handler: async (context: StateContext, fileSystem: FileSystem) => {
    // Implementation based on MCP Actions column
    // Perform file operations
    // Get response template
    const responseTemplate = getResponse('response_file_name');
    // Process any placeholders
    const response = processResponse(responseTemplate, replacements);
    
    return {
      nextState: 'NEXT_STATE_NAME',
      response: response,
    };
  },
  description: 'Human readable description of transition',
}
```

### Step 4: Implementation Guidelines

1. **Conditions**: Convert MCP Condition descriptions to file existence checks and content parsing:
   - "Checks `.ai/task/context.md` exists (exists)" → `await fileSystem.exists('.ai/task/context.md')`
   - "Reads content; Extracts URLs (finds some)" → Parse content and check for URLs
   - Use existing utilities from `fileUtils.ts` and `planUtils.ts`

2. **Actions**: Convert MCP Actions to file operations using FileSystem interface:
   - "Creates `.ai/task/context.md` with template" → Use `writeTemplate()`
   - "Archives files to path" → Use `fileSystem.archive()`
   - "Reads content; Replaces placeholder" → Read, process, and use in response

3. **Responses**: Use `ResponseUtils.formatResponse()` from response utilities:
   - Extract response file name from Response column
   - Convert file path to response key (e.g., "responses/gather_transitions/GC1.md" → "gather_transitions_GC1")
   - Handle placeholders using ResponseUtils methods:
     - `ResponseUtils.hasPlaceholders()` to check for placeholders
     - `ResponseUtils.getPlaceholders()` to identify required replacements
     - `ResponseUtils.formatResponse(responseKey, replacements)` to replace placeholders
   - Common placeholders include: `[TASK_CONTENT_PLACEHOLDER]`, `[ATLASSIAN_URLS_PLACEHOLDER]`, `[REVIEW_TASK_RESULTS_PLACEHOLDER]`, etc.

4. **Templates**: Use template utilities when creating new files from templates

5. **Error Handling**: Include proper error handling for file operations

6. **Type Safety**: Ensure all TypeScript types are correct

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

2. Add the new transition to the appropriate transition array
3. Ensure imports are correct (add any new utility imports needed)
4. Maintain logical ordering of transitions

### Step 6: Write Tests

Write tests for the implemented transition alongside the implementation:

1. The test file already exists (e.g., `contextGatheringTransitions.test.ts`)
2. Add tests for the new transition covering:
   - Condition logic (if applicable)
   - Handler execution
   - File operations performed
   - Response generation (verify response is not empty, not exact content)
   - Next state transitions
3. Use existing test patterns and mocking utilities
4. Ensure test names match transition IDs for clarity
5. Focus tests on logic and behavior, not specific response text content

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
- Follow the existing code patterns exactly
- Use the FileSystem abstraction, never direct fs operations
- All responses must use the response utilities
- Include proper TypeScript typing
- Test the implementation before moving to the next transition
- Update the state-machine.md file to track progress

## Files to Reference

- `state-machine/state-machine.md` - Complete state machine specification
- `state-machine/implementation-plan.md` - Architecture and patterns
- `src/state-machine/types.ts` - Type definitions
- `src/state-machine/utils/responseUtils.ts` - Response processing with ResponseUtils class
- `src/state-machine/utils/templateUtils.ts` - Template operations
- `src/state-machine/utils/fileUtils.ts` - File parsing utilities with FileUtils class
- `src/state-machine/utils/planUtils.ts` - Plan processing utilities
- `src/state-machine/utils/taskUtils.ts` - Task archiving utilities with TaskUtils class
- `src/state-machine/utils/index.ts` - Utility exports and factory functions

## Success Criteria

- One new transition is correctly implemented
- Code follows established patterns
- Implementation status is updated in state-machine.md
- Tests pass: `npm run test`
- Linting passes: `npm run lint`
- Ready for manual review and approval

## Example Workflow

1. Find first table without Implementation column (e.g., "Context Gathering Phase Transitions")
2. Implement first transition (e.g., GC1: GATHER_NEEDS_CONTEXT + Accio)
3. Add to `contextGather/contextGatheringTransitions.ts`
4. Write tests in `contextGather/contextGatheringTransitions.test.ts`
5. Add Implementation column to table and mark GC1 as "yes"
6. Run tests and lint to verify implementation
7. Stop for review and approval
8. Repeat for next unimplemented transition