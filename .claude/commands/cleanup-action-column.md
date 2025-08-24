# Cleanup: Remove Old Action Column from State Machine Tables

This command is used AFTER the MCP Actions column has been added and reviewed in all transition tables.

## Your Task

Remove the old "Action" column from all transition tables in `state-machine/state-machine.md`, leaving only the new "MCP Actions" column.

## Process

1. **Find All Transition Tables**: Look for tables with this format:
   ```
   | ID | Current State | Trigger | Condition | Next State | Action | MCP Actions | Response |
   ```

2. **Remove Action Column**: Transform to:
   ```
   | ID | Current State | Trigger | Condition | Next State | MCP Actions | Response |
   ```

3. **Work Systematically**: Go through each section:
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

4. **Preserve Everything Else**: Keep all other content identical, only remove the Action column and its data

## Example Transformation

**Before:**
```
| ID | Current State | Trigger | Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| GC1 | GATHER_NEEDS_CONTEXT | Accio | - | GATHER_EDITING_CONTEXT | (1) Create `.ai/task/context.md` from template; (2) Copy `.ai/plan-guide.md` from MCP resources if it doesn't exist | (1) Creates `.ai/task/context.md` with template; (2) Copies `.ai/plan-guide.md` from MCP resources if missing | [GC1.md](responses/gather_transitions/GC1.md) |
```

**After:**
```
| ID | Current State | Trigger | Condition | Next State | MCP Actions | Response |
|----|---------------|---------|-----------|------------|-------------|----------|
| GC1 | GATHER_NEEDS_CONTEXT | Accio | - | GATHER_EDITING_CONTEXT | (1) Creates `.ai/task/context.md` with template; (2) Copies `.ai/plan-guide.md` from MCP resources if missing | [GC1.md](responses/gather_transitions/GC1.md) |
```

## Important Notes

- Only proceed with this cleanup AFTER all tables have been reviewed with both columns
- Double-check that all MCP Actions content is finalized before removing the Action column
- This is a one-way operation - make sure the MCP Actions column is complete and accurate