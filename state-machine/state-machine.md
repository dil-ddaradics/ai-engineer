## State Machine

### Introduction

This document defines the complete state machine for the AI Engineer workflow orchestration system. It specifies all possible states, the available spell commands, and defines every valid transition between them.

Key components documented here:

1. **Spells** - The commands users can invoke (Accio, Expecto, Reparo, Reverto, Finite, Lumos)
2. **States** - All possible workflow states (16 states including error conditions)
3. **Transition Rules** - Complete definition of what happens for every state-spell combination
4. **State Guards** - Rules that restrict certain spells to specific states
5. **State Persistence** - How state is maintained in the system

### Verification

The completeness of this state machine can be verified using the `verify-state-machine.py` script, which:

- Extracts all states and spells from this document
- Builds a coverage matrix of all possible state-spell combinations (16 states × 6 spells = 96 combinations)
- Checks that every combination has a defined transition (whether regular, blocked, or no-op)
- Reports any missing transitions or confirms 100% coverage

To run the verification:

```bash
python verify-state-machine.py
```

This workflow is implemented as a strict state machine where transitions occur only in response to specific triggers ("spells"). The system maintains its state in `.ai/task/state.json` and uses file presence/absence as supporting indicators of the current state.

### Spells

1. **Accio**
   - _Description_: Advances workflow to next step
   - _Usage_: Progress through the workflow phases

2. **Expecto**
   - _Description_: Enriches plan from Atlassian resources
   - _Usage_: Only allowed in GATHER states

3. **Reparo**
   - _Description_: Initiates or continues PR review process
   - _Usage_: Available in most states except where blocked

4. **Reverto**
   - _Description_: Exits PR review flow
   - _Usage_: Only available in PR states

5. **Finite**
   - _Description_: Returns to plan editing
   - _Usage_: Universal return to GATHER_EDITING

6. **Lumos**
   - _Description_: Shows current state
   - _Usage_: Available in all states

### States

1. **GATHER_NEEDS_CONTEXT**
   - _Description_: Initial state; no context exists yet
   - _Indicators_: `.ai/task/context.md` does not exist
   - _Valid Actions_: Accio, Lumos

2. **GATHER_EDITING_CONTEXT**
   - _Description_: Context file exists and is being edited
   - _Indicators_: `.ai/task/context.md` exists; `.ai/task/plan.md` does not exist
   - _Valid Actions_: Accio, Expecto, Lumos, Finite (no-op)

3. **GATHER_EDITING**
   - _Description_: Plan file exists and is being edited
   - _Indicators_: `.ai/task/plan.md` exists
   - _Valid Actions_: Accio, Expecto, Lumos, Reparo, Finite (no-op)

4. **ACHIEVE_TASK_DRAFTING**
   - _Description_: Task is being created/refined but not yet executed
   - _Indicators_: `.ai/task/task.md` exists; `.ai/task/task-results.md` doesn't exist
   - _Valid Actions_: Accio, Finite, Reparo, Lumos

5. **ACHIEVE_TASK_EXECUTED**
   - _Description_: Task has been executed; results ready for review
   - _Indicators_: `.ai/task/task-results.md` exists
   - _Valid Actions_: Accio, Reparo, Lumos

6. **ACHIEVE_COMPLETE**
   - _Description_: All acceptance criteria have been met
   - _Indicators_: No unchecked acceptance criteria in `.ai/task/plan.md`
   - _Valid Actions_: Finite, Reparo, Lumos

7. **PR_GATHERING_COMMENTS_G**
   - _Description_: PR review comments have been collected (entered from GATHER phase)
   - _Indicators_: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist; state.json shows origin from GATHER
   - _Valid Actions_: Accio, Finite, Reverto, Lumos

8. **PR_GATHERING_COMMENTS_A**
   - _Description_: PR review comments have been collected (entered from ACHIEVE phase)
   - _Indicators_: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist; state.json shows origin from ACHIEVE
   - _Valid Actions_: Accio, Finite, Reverto, Lumos

9. **PR_REVIEW_TASK_DRAFT_G**
   - _Description_: Review task is being created/refined (entered from GATHER phase)
   - _Indicators_: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist; state.json shows origin from GATHER
   - _Valid Actions_: Accio, Finite, Reverto, Lumos

10. **PR_REVIEW_TASK_DRAFT_A**
    - _Description_: Review task is being created/refined (entered from ACHIEVE phase)
    - _Indicators_: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist; state.json shows origin from ACHIEVE
    - _Valid Actions_: Accio, Finite, Reverto, Lumos

11. **PR_APPLIED_PENDING_ARCHIVE_G**
    - _Description_: Review task has been applied; results ready for archiving (entered from GATHER phase)
    - _Indicators_: `.ai/task/review-task-results.md` exists; state.json shows origin from GATHER
    - _Valid Actions_: Accio, Finite, Lumos

12. **PR_APPLIED_PENDING_ARCHIVE_A**
    - _Description_: Review task has been applied; results ready for archiving (entered from ACHIEVE phase)
    - _Indicators_: `.ai/task/review-task-results.md` exists; state.json shows origin from ACHIEVE
    - _Valid Actions_: Accio, Finite, Lumos

13. **PR_CONFIRM_RESTART_COMMENTS_G**
    - _Description_: User requested Reparo while comments.md exists (entered from GATHER phase)
    - _Indicators_: `.ai/task/comments.md` exists and state.json marks confirm needed; state.json shows origin from GATHER
    - _Valid Actions_: Reparo (confirm), Lumos, Reverto (cancel)

14. **PR_CONFIRM_RESTART_COMMENTS_A**
    - _Description_: User requested Reparo while comments.md exists (entered from ACHIEVE phase)
    - _Indicators_: `.ai/task/comments.md` exists and state.json marks confirm needed; state.json shows origin from ACHIEVE
    - _Valid Actions_: Reparo (confirm), Lumos, Reverto (cancel)

15. **PR_CONFIRM_RESTART_TASK_G**
    - _Description_: User requested Reparo while review-task.md exists (entered from GATHER phase)
    - _Indicators_: `.ai/task/review-task.md` exists and state.json marks confirm needed; state.json shows origin from GATHER
    - _Valid Actions_: Reparo (confirm), Lumos, Reverto (cancel)

16. **PR_CONFIRM_RESTART_TASK_A**
    - _Description_: User requested Reparo while review-task.md exists (entered from ACHIEVE phase)
    - _Indicators_: `.ai/task/review-task.md` exists and state.json marks confirm needed; state.json shows origin from ACHIEVE
    - _Valid Actions_: Reparo (confirm), Lumos, Reverto (cancel)

17. **ERROR_TASK_MISSING**
    - _Description_: In ACHIEVE_TASK_DRAFTING state, but task.md is missing
    - _Indicators_: state.json shows ACHIEVE_TASK_DRAFTING but task.md doesn't exist
    - _Valid Actions_: Accio, Finite, Lumos

18. **ERROR_TASK_RESULTS_MISSING**
    - _Description_: In ACHIEVE_TASK_EXECUTED state, but task-results.md is missing
    - _Indicators_: state.json shows ACHIEVE_TASK_EXECUTED but task-results.md doesn't exist
    - _Valid Actions_: Accio, Finite, Lumos

19. **ERROR_PLAN_MISSING**
    - _Description_: Any state except GATHER_NEEDS_CONTEXT and GATHER_EDITING_CONTEXT requires plan.md but it's missing
    - _Indicators_: Any state except GATHER_NEEDS_CONTEXT and GATHER_EDITING_CONTEXT but plan.md doesn't exist
    - _Valid Actions_: Accio, Lumos

20. **ERROR_COMMENTS_MISSING_G**
    - _Description_: In PR_GATHERING_COMMENTS_G state, but comments.md is missing
    - _Indicators_: state.json shows PR_GATHERING_COMMENTS_G but comments.md doesn't exist
    - _Valid Actions_: Accio, Reverto, Lumos

21. **ERROR_COMMENTS_MISSING_A**
    - _Description_: In PR_GATHERING_COMMENTS_A state, but comments.md is missing
    - _Indicators_: state.json shows PR_GATHERING_COMMENTS_A but comments.md doesn't exist
    - _Valid Actions_: Accio, Reverto, Lumos

22. **ERROR_REVIEW_TASK_MISSING_G**
    - _Description_: In PR_REVIEW_TASK_DRAFT_G state, but review-task.md is missing
    - _Indicators_: state.json shows PR_REVIEW_TASK_DRAFT_G but review-task.md doesn't exist
    - _Valid Actions_: Accio, Lumos

23. **ERROR_REVIEW_TASK_MISSING_A**
    - _Description_: In PR_REVIEW_TASK_DRAFT_A state, but review-task.md is missing
    - _Indicators_: state.json shows PR_REVIEW_TASK_DRAFT_A but review-task.md doesn't exist
    - _Valid Actions_: Accio, Lumos

24. **ERROR_CONTEXT_MISSING**
    - _Description_: In GATHER_EDITING_CONTEXT state, but context.md is missing
    - _Indicators_: state.json shows GATHER_EDITING_CONTEXT but context.md doesn't exist
    - _Valid Actions_: Accio, Lumos

25. **ERROR_REVIEW_TASK_RESULTS_MISSING_G**
    - _Description_: In PR_APPLIED_PENDING_ARCHIVE_G state, but review-task-results.md is missing
    - _Indicators_: state.json shows PR_APPLIED_PENDING_ARCHIVE_G but review-task-results.md doesn't exist
    - _Valid Actions_: Accio, Lumos

26. **ERROR_REVIEW_TASK_RESULTS_MISSING_A**
    - _Description_: In PR_APPLIED_PENDING_ARCHIVE_A state, but review-task-results.md is missing
    - _Indicators_: state.json shows PR_APPLIED_PENDING_ARCHIVE_A but review-task-results.md doesn't exist
    - _Valid Actions_: Accio, Lumos

### Transition Rules

In this section, we use a special notation for states with \_G and \_A suffixes:

A state or next state written as NAME\_[G/A] means:

- NAME_G when the source state has suffix \_G
- NAME_A when the source state has suffix \_A

The order of states in the bracket pairs must match between source and destination. For example, PR*GATHERING_COMMENTS*[G/A] → PR*REVIEW_TASK_DRAFT*[G/A] means:

- PR_GATHERING_COMMENTS_G transitions to PR_REVIEW_TASK_DRAFT_G
- PR_GATHERING_COMMENTS_A transitions to PR_REVIEW_TASK_DRAFT_A

NOTE: The verification script may report "duplicate transitions" when using the [G/A] notation. This is because the script sees multiple transition definitions for the same state-spell combination. These are not true duplicates, as they have different conditions. The state machine remains valid despite these warnings.

#### Context Gathering Phase Transitions

| ID   | Current State          | Trigger | MCP Condition                                                                          | Next State             | MCP Actions                                                                                                                           | Response                                                      | Implementation |
| ---- | ---------------------- | ------- | -------------------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------- |
| GC1  | GATHER_NEEDS_CONTEXT   | Accio   | -                                                                                      | GATHER_EDITING_CONTEXT | (1) Creates `.ai/task/context.md` with template; (2) Copies `.ai/plan-guide.md` and `.ai/task-guide.md` from MCP resources if missing | [GC1.md](responses/gather_transitions/GC1.md)                 | yes            |
| GC2a | GATHER_EDITING_CONTEXT | Accio   | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds some) | GATHER_EDITING         | Creates `.ai/task/plan.md` file                                                                                                       | [GC2.md](responses/gather_transitions/GC2.md)                 | yes            |
| GC2b | GATHER_EDITING_CONTEXT | Accio   | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds none) | GATHER_EDITING         | Creates `.ai/task/plan.md` file                                                                                                       | [GC2-no-urls.md](responses/gather_transitions/GC2-no-urls.md) | yes            |
| GC2c | GATHER_EDITING_CONTEXT | Accio   | Checks `.ai/task/context.md` exists (missing)                                          | ERROR_CONTEXT_MISSING  | -                                                                                                                                     | [GC2b.md](responses/gather_transitions/GC2b.md)               | yes            |

#### Gather Acceptance Criteria Phase Transitions

| ID  | Current State                                                | Trigger | MCP Condition                                                                                                                                           | Next State              | MCP Actions                                                                                                   | Response                                      | Implementation |
| --- | ------------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------- |
| G2  | GATHER_EDITING                                               | Accio   | Reads `.ai/task/plan.md` content; Counts acceptance criteria (lines starting with `- [ ]`) (finds ≥1); Checks `.ai/task/task.md` exists (doesn't exist) | ACHIEVE_TASK_DRAFTING   | Creates `.ai/task/task.md` with template                                                                      | [G2.md](responses/gather_transitions/G2.md)   | yes            |
| G2b | GATHER_EDITING, ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED | Accio   | Checks `.ai/task/plan.md` exists (missing)                                                                                                              | ERROR_PLAN_MISSING      | -                                                                                                             | [G2b.md](responses/gather_transitions/G2b.md) | yes            |
| G3  | GATHER_EDITING                                               | Accio   | Reads `.ai/task/plan.md` content; Counts acceptance criteria (lines starting with `- [ ]`) (finds 0)                                                    | GATHER_EDITING          | -                                                                                                             | [G3.md](responses/gather_transitions/G3.md)   | yes            |
| G4  | GATHER_EDITING                                               | Accio   | Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/plan.md` exists (exists)                                                                    | ACHIEVE_TASK_DRAFTING   | (1) Reads `.ai/task/task.md` content; (2) Replaces `[TASK_CONTENT_PLACEHOLDER]` in response with task content | [G4.md](responses/gather_transitions/G4.md)   | yes            |
| G5  | GATHER_EDITING                                               | Reparo  | Checks `.ai/task/comments.md` exists (doesn't exist); Checks `.ai/task/review-task.md` exists (doesn't exist)                                           | PR_GATHERING_COMMENTS_G | Creates `.ai/task/comments.md` file                                                                           | [G5.md](responses/gather_transitions/G5.md)   | yes            |

#### Context Gathering Phase Blocked Transitions

| ID   | Current State                                | Trigger | MCP Condition | Next State | MCP Actions | Response                                    | Implementation |
| ---- | -------------------------------------------- | ------- | ------------- | ---------- | ----------- | ------------------------------------------- | -------------- |
| GCB1 | GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT | Reverto | -             | [BLOCKED]  | -           | [GCB1.md](responses/gather_blocked/GCB1.md) | yes            |
| GCB2 | GATHER_NEEDS_CONTEXT                         | Expecto | -             | [BLOCKED]  | -           | [GCB2.md](responses/gather_blocked/GCB2.md) | yes            |
| GCB3 | GATHER_NEEDS_CONTEXT                         | Reparo  | -             | [BLOCKED]  | -           | [GCB3.md](responses/gather_blocked/GCB3.md) | yes            |
| GCB4 | GATHER_EDITING_CONTEXT                       | Reparo  | -             | [BLOCKED]  | -           | [GCB4.md](responses/gather_blocked/GCB4.md) | yes            |

#### Context Gathering Phase No-op Transitions

| ID   | Current State                                | Trigger | MCP Condition                                                                          | Next State | MCP Actions | Response                                 | Implementation |
| ---- | -------------------------------------------- | ------- | -------------------------------------------------------------------------------------- | ---------- | ----------- | ---------------------------------------- | -------------- |
| GCN1 | GATHER_EDITING_CONTEXT                       | Finite  | -                                                                                      | Same state | -           | [GCN1.md](responses/gather_noop/GCN1.md) | yes            |
| GCN2 | GATHER_NEEDS_CONTEXT                         | Finite  | -                                                                                      | Same state | -           | [GCN2.md](responses/gather_noop/GCN2.md) | yes            |
| GCN3 | GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT | Expecto | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds none) | Same state | -           | [GCN3.md](responses/gather_noop/GCN3.md) | yes            |

#### Gather Acceptance Criteria Phase Blocked Transitions

| ID  | Current State  | Trigger | MCP Condition | Next State | MCP Actions | Response                                  | Implementation |
| --- | -------------- | ------- | ------------- | ---------- | ----------- | ----------------------------------------- | -------------- |
| GB1 | GATHER_EDITING | Reverto | -             | [BLOCKED]  | -           | [GB1.md](responses/gather_blocked/GB1.md) | yes            |

#### Gather Acceptance Criteria Phase No-op Transitions

| ID  | Current State  | Trigger | MCP Condition                                                                       | Next State | MCP Actions | Response                               | Implementation |
| --- | -------------- | ------- | ----------------------------------------------------------------------------------- | ---------- | ----------- | -------------------------------------- | -------------- |
| GN1 | GATHER_EDITING | Finite  | -                                                                                   | Same state | -           | [GN1.md](responses/gather_noop/GN1.md) | yes            |
| GN3 | GATHER_EDITING | Expecto | Reads `.ai/task/plan.md` content; Extracts Atlassian URLs from content (finds none) | Same state | -           | [GN3.md](responses/gather_noop/GN3.md) | yes            |

#### Achieve Acceptance Criteria Phase Transitions

| ID  | Current State         | Trigger | MCP Condition                                                                                                                                             | Next State                 | MCP Actions                                                                                                                                                                                                                                                                                               | Response                                       | Implementation |
| --- | --------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------- |
| A1  | ACHIEVE_TASK_DRAFTING | Accio   | Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/plan.md` exists (exists)                                                                      | ACHIEVE_TASK_EXECUTED      | -                                                                                                                                                                                                                                                                                                         | [A1.md](responses/achieve_transitions/A1.md)   | yes            |
| A1b | ACHIEVE_TASK_DRAFTING | Accio   | Checks `.ai/task/task.md` exists (missing)                                                                                                                | ERROR_TASK_MISSING         | -                                                                                                                                                                                                                                                                                                         | [A1b.md](responses/achieve_transitions/A1b.md) | yes            |
| A2  | ACHIEVE_TASK_EXECUTED | Accio   | Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/task-results.md` exists (exists); Checks `.ai/task/plan.md` exists (exists)                   | ACHIEVE_TASK_DRAFTING      | (1) Reads `.ai/task/task.md` frontmatter; (2) Reads `.ai/task/task-results.md` content; (3) Archives task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/`; (4) Replaces `[TASK_RESULTS_PLACEHOLDER]` in response with results content; (5) Creates `.ai/task/task.md` with template | [A2.md](responses/achieve_transitions/A2.md)   | yes            |
| A2b | ACHIEVE_TASK_EXECUTED | Accio   | Checks `.ai/task/task-results.md` exists (missing)                                                                                                        | ERROR_TASK_RESULTS_MISSING | -                                                                                                                                                                                                                                                                                                         | [A2b.md](responses/achieve_transitions/A2b.md) | yes            |
| A3  | ACHIEVE_TASK_DRAFTING | Accio   | Reads `.ai/task/plan.md` content; Counts unchecked acceptance criteria (lines starting with `- [ ]`) (finds 0); Checks `.ai/task/plan.md` exists (exists) | ACHIEVE_COMPLETE           | -                                                                                                                                                                                                                                                                                                         | [A3.md](responses/achieve_transitions/A3.md)   | yes            |
| A4  | ACHIEVE_COMPLETE      | Accio   | -                                                                                                                                                         | ACHIEVE_COMPLETE           | -                                                                                                                                                                                                                                                                                                         | [A4.md](responses/achieve_transitions/A4.md)   | yes            |

#### Achieve Acceptance Criteria Phase Blocked Transitions

| ID  | Current State                                                  | Trigger | MCP Condition | Next State | MCP Actions | Response                                   | Implementation |
| --- | -------------------------------------------------------------- | ------- | ------------- | ---------- | ----------- | ------------------------------------------ | -------------- |
| AB1 | ACHIEVE_TASK_EXECUTED                                          | Finite  | -             | [BLOCKED]  | -           | [AB1.md](responses/achieve_blocked/AB1.md) | yes            |
| AB2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reverto | -             | [BLOCKED]  | -           | [AB2.md](responses/achieve_blocked/AB2.md) | yes            |
| AB3 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Expecto | -             | [BLOCKED]  | -           | [AB3.md](responses/achieve_blocked/AB3.md) | yes            |

#### PR Review Phase Transitions

| ID  | Current State                    | Trigger | MCP Condition                                                                                              | Next State                              | MCP Actions                                                                                                                                                                                                                                       | Response                                  | Implementation |
| --- | -------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- |
| P1  | PR*GATHERING_COMMENTS*[G/A]      | Accio   | Checks `.ai/task/comments.md` exists (exists)                                                              | PR*REVIEW_TASK_DRAFT*[G/A]              | Creates `.ai/task/review-task.md` with template                                                                                                                                                                                                   | [P1.md](responses/pr_transitions/P1.md)   | yes            |
| P1b | PR*GATHERING_COMMENTS*[G/A]      | Accio   | Checks `.ai/task/comments.md` exists (missing)                                                             | ERROR*COMMENTS_MISSING*[G/A]            | -                                                                                                                                                                                                                                                 | [P1b.md](responses/pr_transitions/P1b.md) | yes            |
| P2  | PR*REVIEW_TASK_DRAFT*[G/A]       | Accio   | Checks `.ai/task/review-task.md` exists (exists)                                                           | PR*APPLIED_PENDING_ARCHIVE*[G/A]        | -                                                                                                                                                                                                                                                 | [P2.md](responses/pr_transitions/P2.md)   | yes            |
| P2b | PR*REVIEW_TASK_DRAFT*[G/A]       | Accio   | Checks `.ai/task/review-task.md` exists (missing)                                                          | ERROR*REVIEW_TASK_MISSING*[G/A]         | -                                                                                                                                                                                                                                                 | [P2b.md](responses/pr_transitions/P2b.md) | yes            |
| P3  | PR_APPLIED_PENDING_ARCHIVE_G     | Accio   | Checks `.ai/task/review-task-results.md` exists (exists)                                                   | GATHER_EDITING                          | (1) Reads `.ai/task/review-task-results.md` content; (2) Archives review files to `pr-reviews/pr-review-<date>/`; (3) Replaces `[REVIEW_TASK_RESULTS_PLACEHOLDER]` in response with results content                                               | [P3.md](responses/pr_transitions/P3.md)   | yes            |
| P3b | PR*APPLIED_PENDING_ARCHIVE*[G/A] | Accio   | Checks `.ai/task/review-task-results.md` exists (missing)                                                  | ERROR*REVIEW_TASK_RESULTS_MISSING*[G/A] | -                                                                                                                                                                                                                                                 | [P3b.md](responses/pr_transitions/P3b.md) | yes            |
| P4a | PR_APPLIED_PENDING_ARCHIVE_A     | Accio   | Checks `.ai/task/review-task-results.md` exists (exists); Checks `.ai/task/task.md` exists (exists)        | ACHIEVE_TASK_DRAFTING                   | (1) Reads `.ai/task/review-task-results.md` content; (2) Archives review files to `pr-reviews/pr-review-<date>/`; (3) Replaces `[REVIEW_TASK_RESULTS_PLACEHOLDER]` in response with results content                                               | [P4a.md](responses/pr_transitions/P4a.md) | yes            |
| P4b | PR_APPLIED_PENDING_ARCHIVE_A     | Accio   | Checks `.ai/task/review-task-results.md` exists (exists); Checks `.ai/task/task.md` exists (doesn't exist) | ACHIEVE_TASK_DRAFTING                   | (1) Reads `.ai/task/review-task-results.md` content; (2) Archives review files to `pr-reviews/pr-review-<date>/`; (3) Creates `.ai/task/task.md` with template; (4) Replaces `[REVIEW_TASK_RESULTS_PLACEHOLDER]` in response with results content | [P4b.md](responses/pr_transitions/P4b.md) | yes            |

#### Starting PR Review (Reparo) Transitions

| ID  | Current State                                                                                                  | Trigger | MCP Condition                                                                                                 | Next State                    | MCP Actions                         | Response                                      | Implementation |
| --- | -------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------- | --------------------------------------------- | -------------- |
| A5a | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE, ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING | Reparo  | Checks `.ai/task/comments.md` exists (doesn't exist); Checks `.ai/task/review-task.md` exists (doesn't exist) | PR_GATHERING_COMMENTS_A       | Creates `.ai/task/comments.md` file | [A5a.md](responses/reparo_transitions/A5a.md) | yes            |
| A5b | ERROR*COMMENTS_MISSING*[G/A], ERROR*REVIEW_TASK_MISSING*[G/A]                                                  | Reparo  | Checks `.ai/task/comments.md` exists (doesn't exist); Checks `.ai/task/review-task.md` exists (doesn't exist) | PR*GATHERING_COMMENTS*[G/A]   | Creates `.ai/task/comments.md` file | [A5b.md](responses/reparo_transitions/A5b.md) | yes            |
| PR1 | GATHER_EDITING                                                                                                 | Reparo  | Checks `.ai/task/comments.md` exists (exists)                                                                 | PR_CONFIRM_RESTART_COMMENTS_G | -                                   | [PR1.md](responses/reparo_transitions/PR1.md) | yes            |
| PR2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE                                                 | Reparo  | Checks `.ai/task/comments.md` exists (exists)                                                                 | PR_CONFIRM_RESTART_COMMENTS_A | -                                   | [PR2.md](responses/reparo_transitions/PR2.md) | yes            |
| PR3 | GATHER_EDITING                                                                                                 | Reparo  | Checks `.ai/task/review-task.md` exists (exists)                                                              | PR_CONFIRM_RESTART_TASK_G     | -                                   | [PR3.md](responses/reparo_transitions/PR3.md) | yes            |
| PR4 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE                                                 | Reparo  | Checks `.ai/task/review-task.md` exists (exists)                                                              | PR_CONFIRM_RESTART_TASK_A     | -                                   | [PR4.md](responses/reparo_transitions/PR4.md) | yes            |

#### PR Review Confirmation Transitions

| ID  | Current State                     | Trigger | MCP Condition                                     | Next State                      | MCP Actions                         | Response                              |
| --- | --------------------------------- | ------- | ------------------------------------------------- | ------------------------------- | ----------------------------------- | ------------------------------------- |
| C1  | PR*CONFIRM_RESTART_COMMENTS*[G/A] | Reparo  | -                                                 | PR*GATHERING_COMMENTS*[G/A]     | Creates `.ai/task/comments.md` file | [C1.md](responses/pr_confirm/C1.md)   |
| C2  | PR*CONFIRM_RESTART_TASK*[G/A]     | Reparo  | -                                                 | PR*GATHERING_COMMENTS*[G/A]     | Creates `.ai/task/comments.md` file | [C2.md](responses/pr_confirm/C2.md)   |
| C3a | PR*CONFIRM_RESTART_COMMENTS*[G/A] | Accio   | Checks `.ai/task/comments.md` exists (exists)     | PR*GATHERING_COMMENTS*[G/A]     | -                                   | [C3a.md](responses/pr_confirm/C3a.md) |
| C3b | PR*CONFIRM_RESTART_COMMENTS*[G/A] | Accio   | Checks `.ai/task/comments.md` exists (missing)    | ERROR*COMMENTS_MISSING*[G/A]    | -                                   | [C3b.md](responses/pr_confirm/C3b.md) |
| C3c | PR*CONFIRM_RESTART_TASK*[G/A]     | Accio   | Checks `.ai/task/review-task.md` exists (exists)  | PR*REVIEW_TASK_DRAFT*[G/A]      | -                                   | [C3c.md](responses/pr_confirm/C3c.md) |
| C3d | PR*CONFIRM_RESTART_TASK*[G/A]     | Accio   | Checks `.ai/task/review-task.md` exists (missing) | ERROR*REVIEW_TASK_MISSING*[G/A] | -                                   | [C3d.md](responses/pr_confirm/C3d.md) |

#### Error State Recovery Transitions

| ID  | Current State                           | Trigger | MCP Condition                                      | Next State                   | MCP Actions                                                                                                                                                                                                                                        | Response                                  |
| --- | --------------------------------------- | ------- | -------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| R1  | ERROR_TASK_MISSING                      | Accio   | -                                                  | ACHIEVE_TASK_DRAFTING        | Creates `.ai/task/task.md` with template                                                                                                                                                                                                           | [R1.md](responses/error_recovery/R1.md)   |
| R2  | ERROR_TASK_RESULTS_MISSING              | Accio   | Checks `.ai/task/task-results.md` exists (exists)  | ACHIEVE_TASK_DRAFTING        | (1) Reads `.ai/task/task-results.md` content; (2) Archives task files; (3) Creates `.ai/task/task.md` with template; (4) Replaces `[ARCHIVE_PATH_PLACEHOLDER]` and `[TASK_RESULTS_PLACEHOLDER]` in response with archived path and results content | [R2.md](responses/error_recovery/R2.md)   |
| R3  | ERROR_TASK_RESULTS_MISSING              | Accio   | Checks `.ai/task/task-results.md` exists (missing) | ACHIEVE_TASK_DRAFTING        | (1) Archives incomplete task; (2) Creates `.ai/task/task.md` with template                                                                                                                                                                         | [R3.md](responses/error_recovery/R3.md)   |
| R4  | ERROR_PLAN_MISSING                      | Accio   | -                                                  | GATHER_NEEDS_CONTEXT         | -                                                                                                                                                                                                                                                  | [R4.md](responses/error_recovery/R4.md)   |
| R5a | ERROR_COMMENTS_MISSING_G                | Accio   | -                                                  | PR_GATHERING_COMMENTS_G      | Creates `.ai/task/comments.md` file                                                                                                                                                                                                                | [R5a.md](responses/error_recovery/R5a.md) |
| R5b | ERROR_COMMENTS_MISSING_A                | Accio   | -                                                  | PR_GATHERING_COMMENTS_A      | Creates `.ai/task/comments.md` file                                                                                                                                                                                                                | [R5b.md](responses/error_recovery/R5b.md) |
| R6a | ERROR*REVIEW_TASK_MISSING*[G/A]         | Accio   | Checks `.ai/task/comments.md` exists (exists)      | PR*REVIEW_TASK_DRAFT*[G/A]   | Creates `.ai/task/review-task.md` with template                                                                                                                                                                                                    | [R6a.md](responses/error_recovery/R6a.md) |
| R7a | ERROR*REVIEW_TASK_MISSING*[G/A]         | Accio   | Checks `.ai/task/comments.md` exists (missing)     | ERROR*COMMENTS_MISSING*[G/A] | -                                                                                                                                                                                                                                                  | [R7a.md](responses/error_recovery/R7a.md) |
| R8a | ERROR*REVIEW_TASK_RESULTS_MISSING*[G/A] | Accio   | Checks `.ai/task/review-task.md` exists (exists)   | PR*REVIEW_TASK_DRAFT*[G/A]   | -                                                                                                                                                                                                                                                  | [R8a.md](responses/error_recovery/R8a.md) |
| R9  | ERROR_CONTEXT_MISSING                   | Accio   | -                                                  | GATHER_EDITING_CONTEXT       | Creates `.ai/task/context.md` with template                                                                                                                                                                                                        | [R9.md](responses/error_recovery/R9.md)   |

#### Error State Other Transitions

| ID   | Current State                                                                                                                                | Trigger | MCP Condition | Next State | MCP Actions | Response                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- | ---------- | ----------- | ---------------------------------------- |
| ER1  | ERROR_PLAN_MISSING                                                                                                                           | Finite  | -             | [BLOCKED]  | -           | [ER1.md](responses/error_other/ER1.md)   |
| ER2  | ERROR*REVIEW_TASK_MISSING*[G/A], ERROR*REVIEW_TASK_RESULTS_MISSING*[G/A]                                                                     | Finite  | -             | [BLOCKED]  | -           | [ER2.md](responses/error_other/ER2.md)   |
| ER3a | ERROR*PLAN_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING*[G/A]                                                                                  | Reparo  | -             | [BLOCKED]  | -           | [ER3a.md](responses/error_other/ER3a.md) |
| ER3b | PR*APPLIED_PENDING_ARCHIVE*[G/A]                                                                                                             | Reparo  | -             | [BLOCKED]  | -           | [ER3b.md](responses/error_other/ER3b.md) |
| ER4  | ERROR*TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING*[G/A], ERROR*REVIEW_TASK_RESULTS_MISSING*[G/A] | Reverto | -             | [BLOCKED]  | -           | [ER4.md](responses/error_other/ER4.md)   |
| ER5  | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING                                                                                               | Finite  | -             | [BLOCKED]  | -           | [ER5.md](responses/error_other/ER5.md)   |
| ER6  | ERROR*TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING*[G/A]                                                                 | Expecto | -             | [BLOCKED]  | -           | [ER6.md](responses/error_other/ER6.md)   |
| ER7a | ERROR_PLAN_MISSING                                                                                                                           | Expecto | -             | [BLOCKED]  | -           | [ER7a.md](responses/error_other/ER7a.md) |
| ER7b | PR*APPLIED_PENDING_ARCHIVE*[G/A]                                                                                                             | Expecto | -             | [BLOCKED]  | -           | [ER7b.md](responses/error_other/ER7b.md) |
| ER8  | ERROR*REVIEW_TASK_MISSING*[G/A], ERROR*REVIEW_TASK_RESULTS_MISSING*[G/A]                                                                     | Expecto | -             | [BLOCKED]  | -           | [ER8.md](responses/error_other/ER8.md)   |
| ER9  | ERROR_CONTEXT_MISSING                                                                                                                        | Finite  | -             | [BLOCKED]  | -           | [ER9.md](responses/error_other/ER9.md)   |
| ER10 | ERROR_CONTEXT_MISSING                                                                                                                        | Reparo  | -             | [BLOCKED]  | -           | [ER10.md](responses/error_other/ER10.md) |
| ER11 | ERROR_CONTEXT_MISSING                                                                                                                        | Reverto | -             | [BLOCKED]  | -           | [ER11.md](responses/error_other/ER11.md) |
| ER12 | ERROR_CONTEXT_MISSING                                                                                                                        | Expecto | -             | [BLOCKED]  | -           | [ER12.md](responses/error_other/ER12.md) |

#### Finite Transitions (Universal Return to Plan)

| ID  | Current State                                                                                                                                                                                                                                                                                                                                                                            | Trigger | MCP Condition | Next State     | MCP Actions | Response                                    | Implementation |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------- | -------------- | ----------- | ------------------------------------------- | -------------- |
| F1  | Any state except ACHIEVE*TASK_EXECUTED, ACHIEVE_COMPLETE, ERROR_PLAN_MISSING, ERROR_CONTEXT_MISSING, ERROR_REVIEW_TASK_MISSING*[G/A], ERROR*REVIEW_TASK_RESULTS_MISSING*[G/A], PR*APPLIED_PENDING_ARCHIVE*[G/A], PR*CONFIRM_RESTART_COMMENTS*[G/A], PR*CONFIRM_RESTART_TASK*[G/A], PR*GATHERING_COMMENTS*[G/A], PR*REVIEW_TASK_DRAFT*[G/A], GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT | Finite  | -             | GATHER_EDITING | -           | [F1.md](responses/finite_transitions/F1.md) | yes            |
| F2  | ACHIEVE_COMPLETE                                                                                                                                                                                                                                                                                                                                                                         | Finite  | -             | GATHER_EDITING | -           | [F2.md](responses/finite_transitions/F2.md) | yes            |

#### Blocked Finite Transitions

| ID  | Current State                    | Trigger | MCP Condition | Next State | MCP Actions | Response                                |
| --- | -------------------------------- | ------- | ------------- | ---------- | ----------- | --------------------------------------- |
| F3  | PR*APPLIED_PENDING_ARCHIVE*[G/A] | Finite  | -             | [BLOCKED]  | -           | [F3.md](responses/finite_blocked/F3.md) |
| F4  | GATHER_NEEDS_CONTEXT             | Finite  | -             | [BLOCKED]  | -           | [F4.md](responses/finite_blocked/F4.md) |
| F5  | GATHER_EDITING_CONTEXT           | Finite  | -             | [BLOCKED]  | -           | [F5.md](responses/finite_blocked/F5.md) |

#### Reverto Transitions (Exit PR Review)

| ID  | Current State                                                                                                                       | Trigger | MCP Condition                                                                                       | Next State            | MCP Actions | Response                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- | --------------------- | ----------- | ---------------------------------------------- |
| V1  | PR_GATHERING_COMMENTS_G, PR_REVIEW_TASK_DRAFT_G, PR_CONFIRM_RESTART_COMMENTS_G, PR_CONFIRM_RESTART_TASK_G, ERROR_COMMENTS_MISSING_G | Reverto | -                                                                                                   | GATHER_EDITING        | -           | [V1.md](responses/reverto_transitions/V1.md)   |
| V2a | PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A | Reverto | Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/task-results.md` exists (doesn't exist) | ACHIEVE_TASK_DRAFTING | -           | [V2a.md](responses/reverto_transitions/V2a.md) |
| V2b | PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A | Reverto | Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/task-results.md` exists (exists)        | ACHIEVE_TASK_EXECUTED | -           | [V2b.md](responses/reverto_transitions/V2b.md) |

#### PR Review Phase Blocked Transitions

| ID   | Current State                                                    | Trigger | MCP Condition | Next State | MCP Actions | Response                                |
| ---- | ---------------------------------------------------------------- | ------- | ------------- | ---------- | ----------- | --------------------------------------- |
| PB1  | PR*APPLIED_PENDING_ARCHIVE*[G/A]                                 | Reverto | -             | [BLOCKED]  | -           | [PB1.md](responses/pr_blocked/PB1.md)   |
| PB2  | PR*GATHERING_COMMENTS*[G/A]                                      | Expecto | -             | [BLOCKED]  | -           | [PB2.md](responses/pr_blocked/PB2.md)   |
| PB2b | PR*REVIEW_TASK_DRAFT*[G/A]                                       | Expecto | -             | [BLOCKED]  | -           | [PB2b.md](responses/pr_blocked/PB2b.md) |
| PB2d | PR*APPLIED_PENDING_ARCHIVE*[G/A]                                 | Expecto | -             | [BLOCKED]  | -           | [PB2d.md](responses/pr_blocked/PB2d.md) |
| PB3  | PR*GATHERING_COMMENTS*[G/A], PR*REVIEW_TASK_DRAFT*[G/A]          | Finite  | -             | [BLOCKED]  | -           | [PB3.md](responses/pr_blocked/PB3.md)   |
| PB4  | PR*GATHERING_COMMENTS*[G/A], PR*REVIEW_TASK_DRAFT*[G/A]          | Reparo  | -             | [BLOCKED]  | -           | [PB4.md](responses/pr_blocked/PB4.md)   |
| PB5  | PR*CONFIRM_RESTART_COMMENTS*[G/A], PR*CONFIRM_RESTART_TASK*[G/A] | Finite  | -             | [BLOCKED]  | -           | [PB5.md](responses/pr_blocked/PB5.md)   |
| PB6  | PR*CONFIRM_RESTART_COMMENTS*[G/A], PR*CONFIRM_RESTART_TASK*[G/A] | Expecto | -             | [BLOCKED]  | -           | [PB6.md](responses/pr_blocked/PB6.md)   |

#### Universal Lumos Transitions

| ID   | Current State                       | Trigger | MCP Condition | Next State | MCP Actions | Response                                       |
| ---- | ----------------------------------- | ------- | ------------- | ---------- | ----------- | ---------------------------------------------- |
| L1   | GATHER_NEEDS_PLAN                   | Lumos   | -             | Same state | -           | [L1.md](responses/lumos_transitions/L1.md)     |
| L2   | GATHER_EDITING                      | Lumos   | -             | Same state | -           | [L2.md](responses/lumos_transitions/L2.md)     |
| L3   | ACHIEVE_TASK_DRAFTING               | Lumos   | -             | Same state | -           | [L3.md](responses/lumos_transitions/L3.md)     |
| L4   | ACHIEVE_TASK_EXECUTED               | Lumos   | -             | Same state | -           | [L4.md](responses/lumos_transitions/L4.md)     |
| L5   | ACHIEVE_COMPLETE                    | Lumos   | -             | Same state | -           | [L5.md](responses/lumos_transitions/L5.md)     |
| L6   | PR_GATHERING_COMMENTS_G             | Lumos   | -             | Same state | -           | [L6.md](responses/lumos_transitions/L6.md)     |
| L7   | PR_GATHERING_COMMENTS_A             | Lumos   | -             | Same state | -           | [L7.md](responses/lumos_transitions/L7.md)     |
| L8   | PR_REVIEW_TASK_DRAFT_G              | Lumos   | -             | Same state | -           | [L8.md](responses/lumos_transitions/L8.md)     |
| L9   | PR_REVIEW_TASK_DRAFT_A              | Lumos   | -             | Same state | -           | [L9.md](responses/lumos_transitions/L9.md)     |
| L10  | PR_APPLIED_PENDING_ARCHIVE_G        | Lumos   | -             | Same state | -           | [L10.md](responses/lumos_transitions/L10.md)   |
| L11  | PR_APPLIED_PENDING_ARCHIVE_A        | Lumos   | -             | Same state | -           | [L11.md](responses/lumos_transitions/L11.md)   |
| L12  | PR_CONFIRM_RESTART_COMMENTS_G       | Lumos   | -             | Same state | -           | [L12.md](responses/lumos_transitions/L12.md)   |
| L13  | PR_CONFIRM_RESTART_COMMENTS_A       | Lumos   | -             | Same state | -           | [L13.md](responses/lumos_transitions/L13.md)   |
| L14  | PR_CONFIRM_RESTART_TASK_G           | Lumos   | -             | Same state | -           | [L14.md](responses/lumos_transitions/L14.md)   |
| L15  | PR_CONFIRM_RESTART_TASK_A           | Lumos   | -             | Same state | -           | [L15.md](responses/lumos_transitions/L15.md)   |
| L16  | ERROR_TASK_MISSING                  | Lumos   | -             | Same state | -           | [L16.md](responses/lumos_transitions/L16.md)   |
| L17  | ERROR_TASK_RESULTS_MISSING          | Lumos   | -             | Same state | -           | [L17.md](responses/lumos_transitions/L17.md)   |
| L18  | ERROR_PLAN_MISSING                  | Lumos   | -             | Same state | -           | [L18.md](responses/lumos_transitions/L18.md)   |
| L19  | ERROR_COMMENTS_MISSING_G            | Lumos   | -             | Same state | -           | [L19.md](responses/lumos_transitions/L19.md)   |
| L19a | ERROR_COMMENTS_MISSING_A            | Lumos   | -             | Same state | -           | [L19a.md](responses/lumos_transitions/L19a.md) |
| L20  | ERROR_REVIEW_TASK_MISSING_G         | Lumos   | -             | Same state | -           | [L20.md](responses/lumos_transitions/L20.md)   |
| L20a | ERROR_REVIEW_TASK_MISSING_A         | Lumos   | -             | Same state | -           | [L20a.md](responses/lumos_transitions/L20a.md) |
| L21  | ERROR_REVIEW_TASK_RESULTS_MISSING_G | Lumos   | -             | Same state | -           | [L21.md](responses/lumos_transitions/L21.md)   |
| L21a | ERROR_REVIEW_TASK_RESULTS_MISSING_A | Lumos   | -             | Same state | -           | [L21a.md](responses/lumos_transitions/L21a.md) |
| L22  | GATHER_NEEDS_CONTEXT                | Lumos   | -             | Same state | -           | [L22.md](responses/lumos_transitions/L22.md)   |
| L23  | GATHER_EDITING_CONTEXT              | Lumos   | -             | Same state | -           | [L23.md](responses/lumos_transitions/L23.md)   |
| L24  | ERROR_CONTEXT_MISSING               | Lumos   | -             | Same state | -           | [L24.md](responses/lumos_transitions/L24.md)   |

#### Universal Expecto Transitions

| ID  | Current State          | Trigger | MCP Condition                                                                                                                                                         | Next State             | MCP Actions                                                                                                                                                                                                                                                     | Response                                     |
| --- | ---------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| E1b | GATHER_EDITING_CONTEXT | Expecto | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds some); Checks `.ai/task/.atlassian-refs` for processed URLs (finds unprocessed URLs) | GATHER_EDITING_CONTEXT | (1) Reads `.ai/task/.atlassian-refs`; (2) Extracts all Atlassian URLs from context.md; (3) Finds URLs not in .atlassian-refs; (4) Replaces `[ATLASSIAN_URLS_PLACEHOLDER]` in response with URL list; (5) Updates `.ai/task/.atlassian-refs` with processed URLs | [E1b.md](responses/universal_expecto/E1b.md) |
| E2  | GATHER_EDITING         | Expecto | Reads `.ai/task/plan.md` content; Extracts Atlassian URLs from content (finds some); Checks `.ai/task/.atlassian-refs` for processed URLs (finds unprocessed URLs)    | GATHER_EDITING         | (1) Reads `.ai/task/.atlassian-refs`; (2) Extracts all Atlassian URLs from plan.md; (3) Finds URLs not in .atlassian-refs; (4) Replaces `[ATLASSIAN_URLS_PLACEHOLDER]` in response with URL list; (5) Updates `.ai/task/.atlassian-refs` with processed URLs    | [E2.md](responses/universal_expecto/E2.md)   |
| E3  | GATHER_EDITING_CONTEXT | Expecto | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds none)                                                                                | Same state             | -                                                                                                                                                                                                                                                               | [E3.md](responses/universal_expecto/E3.md)   |
| E3b | GATHER_EDITING         | Expecto | Reads `.ai/task/plan.md` content; Extracts Atlassian URLs from content (finds none)                                                                                   | Same state             | -                                                                                                                                                                                                                                                               | [E3b.md](responses/universal_expecto/E3b.md) |
| E4  | GATHER_EDITING_CONTEXT | Expecto | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds some); Checks `.ai/task/.atlassian-refs` for processed URLs (all already processed)  | Same state             | -                                                                                                                                                                                                                                                               | [E4.md](responses/universal_expecto/E4.md)   |
| E4b | GATHER_EDITING         | Expecto | Reads `.ai/task/plan.md` content; Extracts Atlassian URLs from content (finds some); Checks `.ai/task/.atlassian-refs` for processed URLs (all already processed)     | Same state             | -                                                                                                                                                                                                                                                               | [E4b.md](responses/universal_expecto/E4b.md) |

### State Guards

1. **Expecto Guard**: Only allowed in GATHER states
2. **Reparo Guard**: Blocked if PR_APPLIED_PENDING_ARCHIVE (must Accio to finish current review)
3. **Reverto Guard**: Only allowed in PR states (except PR_APPLIED_PENDING_ARCHIVE where Accio must be used to complete the archive)

### Response Format Templates

To ensure a consistent user experience, all responses to state transitions will follow standardized templates. Each response has two sections:

1. **Response to the AI**: Internal instructions for the AI system (not shown to users)
2. **Response to the Developer**: User-facing structured information

#### 1. Standard Transition Response Format

For normal transitions, error states, and recovery:

```markdown
## Response to the AI

<Detailed instructions for the AI system on how to process this transition>

## Response to the Developer

### What Just Happened

<Clear explanation of the action performed in human-readable terms>

### Where We Are

<Human-friendly description of the current phase and what it means>

### Available Spells

- **Accio**: <What happens if cast in human-readable terms>
- **Expecto**: <What happens if cast in human-readable terms>
- **Reparo**: <What happens if cast in human-readable terms>
- **Reverto**: <What happens if cast in human-readable terms>
- **Finite**: <What happens if cast in human-readable terms>

### Next Steps

<Recommendation for what to do next in human-friendly language>
```

#### 2. Blocked Transition Response Format

For when a spell cannot be used in the current state:

```markdown
## Response to the AI

<Instruction to inform the developer that this action is blocked and why>

## Response to the Developer

### What Just Happened

You attempted to cast **<Spell>** which cannot be used right now because <human-readable reason>.

### Where We Are

<Human-friendly description of the current phase and what it means>

### Available Spells

- **Spell1**: <Human-readable description of effect>
- **Spell2**: <Human-readable description of effect>
  ...

### Next Steps

<Clear direction on what to do instead in human-friendly language>
```

#### 3. No-op Transition Response Format

For when a spell is cast but causes no state change:

```markdown
## Response to the AI

<Instruction to inform the developer that this action had no effect and why>

## Response to the Developer

### What Just Happened

You cast **<Spell>** which had no effect because <human-readable reason>.

### Where We Are

<Human-friendly description of the current phase and what it means>

### Available Spells

- **Spell1**: <Human-readable description of effect>
- **Spell2**: <Human-readable description of effect>
  ...

### Next Steps

<Recommendation for what to do to make progress in human-friendly language>
```

#### 4. Confirmation Transitions Response Format

For when user confirmation is required before proceeding:

```markdown
## Response to the AI

<Instructions for requesting confirmation from the developer>

## Response to the Developer

### What Just Happened

A confirmation is needed: <explanation of what requires confirmation>.

### Where We Are

<Human-friendly description of the confirmation decision point>

### Available Choices

- **Reparo**: <Confirm the action and its consequences>
- **Reverto**: <Cancel the action and its consequences>

### Next Steps

Please choose whether to proceed with the action or cancel it. Use **Reparo** to confirm or **Reverto** to cancel.
```

#### 5. Lumos Header Template

The MCP server will prepend this standard header to all Lumos responses before concatenating with the specific response content:

```markdown
> **AI Engineer Workflow** helps you work together with AI on any coding task. This system was built to teach effective collaboration with AI through a guided workflow. You can create plans, break them down into smaller tasks, get information from Jira and Confluence, and improve your code by handling PR comments.
>
> For best results, commit your changes often and start new conversations to clear the AI's context when needed. Don't worry about losing progress - this system remembers where you left off!
```

#### 6. Lumos Response Format

For the Lumos spell that shows current state and available actions, each response file contains:

```markdown
### Where We Are

<Human-friendly description of the current phase without using state names>

**Key Files:**

- `.ai/task/plan.md`: <Brief description if it exists>
- `.ai/task/task.md`: <Brief description if it exists>
- `.ai/task/task-results.md`: <Brief description if it exists>
- `.ai/task/comments.md`: <Brief description if it exists>
- `.ai/task/review-task.md`: <Brief description if it exists>
- `.ai/task/review-task-results.md`: <Brief description if it exists>

Only include files that actually exist in the current state.

### Available Spells

- **Spell1**: <Human-readable description of effect>
- **Spell2**: <Human-readable description of effect>
  ...

### Unavailable Spells

- **Spell1**: <Clear explanation of why it can't be used>
- **Spell2**: <Clear explanation of why it can't be used>
  ...

### Next Steps

<Recommendation for what to do next in human-friendly language>
```

Note: The MCP server concatenates the Lumos Header Template with individual response files to create the complete user-facing response.

#### 7. Ask/Plan Mode Recommendation Template

For responses where users should iterate on files before advancing, include this recommendation in the Next Steps section:

```markdown
> **💡 Tip**: Consider using Ask/Plan mode in your AI assistant to iterate on this file without accidentally executing the next step. Most AI agents like Cursor or Claude Code have a mode where they cannot edit files, which is useful for planning and refining content collaboratively before proceeding.
```

### Template Management

The MCP server manages template files using a two-tier approach:

#### Persistent Guide Files

Located in `.ai/` folder, copied only if they don't exist, allowing developers to customize and reuse across tasks:

- `.ai/plan-guide.md` - Planning guidelines and best practices
- `.ai/task-guide.md` - Task execution guidelines for both regular tasks and review tasks

#### Working Template Files

Located in `.ai/task/` folder, created fresh from MCP resources for each workflow step:

- `.ai/task/context.md` - Task context template
- `.ai/task/plan.md` - Structured plan template
- `.ai/task/task.md` - Individual task template

The MCP server reads all templates from its resources folder (similar to response files) and handles the appropriate copying/creation logic based on template type and file existence.

### State Persistence

All state is persisted in `.ai/task/state.json` with the following structure:

```json
{
  "current_state": "GATHER_EDITING_CONTEXT",
  "context": {},
  "history": [
    {
      "timestamp": "2025-08-20T15:30:00Z",
      "transition": "GATHER_NEEDS_CONTEXT → GATHER_EDITING_CONTEXT",
      "trigger": "Accio"
    }
  ]
}
```

The existence of specific files serves as a secondary indicator of state, but the authoritative source is always the state file.
Context is only populated for states that need additional info.
