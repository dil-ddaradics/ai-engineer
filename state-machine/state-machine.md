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
   - *Description*: Advances workflow to next step
   - *Usage*: Progress through the workflow phases

2. **Expecto**
   - *Description*: Enriches plan from Atlassian resources
   - *Usage*: Only allowed in GATHER states

3. **Reparo**
   - *Description*: Initiates or continues PR review process
   - *Usage*: Available in most states except where blocked

4. **Reverto**
   - *Description*: Exits PR review flow
   - *Usage*: Only available in PR states

5. **Finite**
   - *Description*: Returns to plan editing
   - *Usage*: Universal return to GATHER_EDITING

6. **Lumos**
   - *Description*: Shows current state
   - *Usage*: Available in all states

### States

1. **GATHER_NEEDS_CONTEXT**
    - *Description*: Initial state; no context exists yet
    - *Indicators*: `.ai/task/context.md` does not exist
    - *Valid Actions*: Accio, Lumos

2. **GATHER_EDITING_CONTEXT**
    - *Description*: Context file exists and is being edited
    - *Indicators*: `.ai/task/context.md` exists; `.ai/task/plan.md` does not exist
    - *Valid Actions*: Accio, Expecto, Lumos, Finite (no-op)

3. **GATHER_EDITING**
    - *Description*: Plan file exists and is being edited
    - *Indicators*: `.ai/task/plan.md` exists
    - *Valid Actions*: Accio, Expecto, Lumos, Reparo, Finite (no-op)

4. **ACHIEVE_TASK_DRAFTING**
    - *Description*: Task is being created/refined but not yet executed
    - *Indicators*: `.ai/task/task.md` exists; `.ai/task/task-results.md` doesn't exist
    - *Valid Actions*: Accio, Finite, Reparo, Lumos

5. **ACHIEVE_TASK_EXECUTED**
    - *Description*: Task has been executed; results ready for review
    - *Indicators*: `.ai/task/task-results.md` exists
    - *Valid Actions*: Accio, Reparo, Lumos

6. **ACHIEVE_COMPLETE**
    - *Description*: All acceptance criteria have been met
    - *Indicators*: No unchecked acceptance criteria in `.ai/task/plan.md`
    - *Valid Actions*: Finite, Reparo, Lumos

7. **PR_GATHERING_COMMENTS_G**
    - *Description*: PR review comments have been collected (entered from GATHER phase)
    - *Indicators*: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist; state.json shows origin from GATHER
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

8. **PR_GATHERING_COMMENTS_A**
    - *Description*: PR review comments have been collected (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist; state.json shows origin from ACHIEVE
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

9. **PR_REVIEW_TASK_DRAFT_G**
    - *Description*: Review task is being created/refined (entered from GATHER phase)
    - *Indicators*: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist; state.json shows origin from GATHER
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

10. **PR_REVIEW_TASK_DRAFT_A**
    - *Description*: Review task is being created/refined (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist; state.json shows origin from ACHIEVE
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

11. **PR_APPLIED_PENDING_ARCHIVE_G**
    - *Description*: Review task has been applied; results ready for archiving (entered from GATHER phase)
    - *Indicators*: `.ai/task/review-task-results.md` exists; state.json shows origin from GATHER
    - *Valid Actions*: Accio, Finite, Lumos

12. **PR_APPLIED_PENDING_ARCHIVE_A**
    - *Description*: Review task has been applied; results ready for archiving (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/review-task-results.md` exists; state.json shows origin from ACHIEVE
    - *Valid Actions*: Accio, Finite, Lumos

13. **PR_CONFIRM_RESTART_COMMENTS_G**
    - *Description*: User requested Reparo while comments.md exists (entered from GATHER phase)
    - *Indicators*: `.ai/task/comments.md` exists and state.json marks confirm needed; state.json shows origin from GATHER
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

14. **PR_CONFIRM_RESTART_COMMENTS_A**
    - *Description*: User requested Reparo while comments.md exists (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/comments.md` exists and state.json marks confirm needed; state.json shows origin from ACHIEVE
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

15. **PR_CONFIRM_RESTART_TASK_G**
    - *Description*: User requested Reparo while review-task.md exists (entered from GATHER phase)
    - *Indicators*: `.ai/task/review-task.md` exists and state.json marks confirm needed; state.json shows origin from GATHER
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

16. **PR_CONFIRM_RESTART_TASK_A**
    - *Description*: User requested Reparo while review-task.md exists (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/review-task.md` exists and state.json marks confirm needed; state.json shows origin from ACHIEVE
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

17. **ERROR_TASK_MISSING**
    - *Description*: In ACHIEVE_TASK_DRAFTING state, but task.md is missing
    - *Indicators*: state.json shows ACHIEVE_TASK_DRAFTING but task.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

18. **ERROR_TASK_RESULTS_MISSING**
    - *Description*: In ACHIEVE_TASK_EXECUTED state, but task-results.md is missing
    - *Indicators*: state.json shows ACHIEVE_TASK_EXECUTED but task-results.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

19. **ERROR_PLAN_MISSING**
    - *Description*: Any state except GATHER_NEEDS_CONTEXT and GATHER_EDITING_CONTEXT requires plan.md but it's missing
    - *Indicators*: Any state except GATHER_NEEDS_CONTEXT and GATHER_EDITING_CONTEXT but plan.md doesn't exist
    - *Valid Actions*: Accio, Lumos

20. **ERROR_COMMENTS_MISSING_G**
    - *Description*: In PR_GATHERING_COMMENTS_G state, but comments.md is missing
    - *Indicators*: state.json shows PR_GATHERING_COMMENTS_G but comments.md doesn't exist
    - *Valid Actions*: Accio, Reverto, Lumos

21. **ERROR_COMMENTS_MISSING_A**
    - *Description*: In PR_GATHERING_COMMENTS_A state, but comments.md is missing
    - *Indicators*: state.json shows PR_GATHERING_COMMENTS_A but comments.md doesn't exist
    - *Valid Actions*: Accio, Reverto, Lumos

22. **ERROR_REVIEW_TASK_MISSING_G**
    - *Description*: In PR_REVIEW_TASK_DRAFT_G state, but review-task.md is missing
    - *Indicators*: state.json shows PR_REVIEW_TASK_DRAFT_G but review-task.md doesn't exist
    - *Valid Actions*: Accio, Lumos

23. **ERROR_REVIEW_TASK_MISSING_A**
    - *Description*: In PR_REVIEW_TASK_DRAFT_A state, but review-task.md is missing
    - *Indicators*: state.json shows PR_REVIEW_TASK_DRAFT_A but review-task.md doesn't exist
    - *Valid Actions*: Accio, Lumos

24. **ERROR_CONTEXT_MISSING**
    - *Description*: In GATHER_EDITING_CONTEXT state, but context.md is missing
    - *Indicators*: state.json shows GATHER_EDITING_CONTEXT but context.md doesn't exist
    - *Valid Actions*: Accio, Lumos

25. **ERROR_REVIEW_TASK_RESULTS_MISSING_G**
    - *Description*: In PR_APPLIED_PENDING_ARCHIVE_G state, but review-task-results.md is missing
    - *Indicators*: state.json shows PR_APPLIED_PENDING_ARCHIVE_G but review-task-results.md doesn't exist
    - *Valid Actions*: Accio, Lumos

26. **ERROR_REVIEW_TASK_RESULTS_MISSING_A**
    - *Description*: In PR_APPLIED_PENDING_ARCHIVE_A state, but review-task-results.md is missing
    - *Indicators*: state.json shows PR_APPLIED_PENDING_ARCHIVE_A but review-task-results.md doesn't exist
    - *Valid Actions*: Accio, Lumos

### Transition Rules

In this section, we use a special notation for states with _G and _A suffixes:

A state or next state written as NAME_[G/A] means:
- NAME_G when the source state has suffix _G
- NAME_A when the source state has suffix _A

The order of states in the bracket pairs must match between source and destination. For example, PR_GATHERING_COMMENTS_[G/A] → PR_REVIEW_TASK_DRAFT_[G/A] means:
- PR_GATHERING_COMMENTS_G transitions to PR_REVIEW_TASK_DRAFT_G
- PR_GATHERING_COMMENTS_A transitions to PR_REVIEW_TASK_DRAFT_A

NOTE: The verification script may report "duplicate transitions" when using the [G/A] notation. This is because the script sees multiple transition definitions for the same state-spell combination. These are not true duplicates, as they have different conditions. The state machine remains valid despite these warnings.


#### Context Gathering Phase Transitions

| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|---------------|------------|--------|-------------|----------|
| GC1 | GATHER_NEEDS_CONTEXT | Accio | - | - | GATHER_EDITING_CONTEXT | (1) Create `.ai/task/context.md` from template; (2) Copy `.ai/plan-guide.md` and `.ai/task-guide.md` from MCP resources if they don't exist | (1) Creates `.ai/task/context.md` with template; (2) Copies `.ai/plan-guide.md` and `.ai/task-guide.md` from MCP resources if missing | [GC1.md](responses/gather_transitions/GC1.md) |
| GC2a | GATHER_EDITING_CONTEXT | Accio | context.md exists AND Atlassian URLs found | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds some) | GATHER_EDITING | Read context.md, extract Atlassian URLs, provide URLs to AI for processing | Creates `.ai/task/plan.md` file | [GC2.md](responses/gather_transitions/GC2.md) |
| GC2b | GATHER_EDITING_CONTEXT | Accio | context.md exists AND no Atlassian URLs found | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds none) | GATHER_EDITING | Read context.md, provide content to AI for plan generation | Creates `.ai/task/plan.md` file | [GC2-no-urls.md](responses/gather_transitions/GC2-no-urls.md) |
| GC2c | GATHER_EDITING_CONTEXT | Accio | context.md missing | Checks `.ai/task/context.md` exists (missing) | ERROR_CONTEXT_MISSING | State updated to ERROR_CONTEXT_MISSING | - | [GC2b.md](responses/gather_transitions/GC2b.md) |

#### Gather Acceptance Criteria Phase Transitions

| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|---------------|------------|--------|-------------|----------|
| G2 | GATHER_EDITING | Accio | ≥1 AC in plan.md AND task.md doesn't exist AND plan.md exists | Reads `.ai/task/plan.md` content; Counts acceptance criteria (lines starting with `- [ ]`) (finds ≥1); Checks `.ai/task/task.md` exists (doesn't exist) | ACHIEVE_TASK_DRAFTING | Create `.ai/task/task.md` template with YAML frontmatter; mention `.ai/task-guide.md` exists for task creation guidance and can be customized | Creates `.ai/task/task.md` with template | [G2.md](responses/gather_transitions/G2.md) |
| G2b | GATHER_EDITING, ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED | Accio | plan.md missing | Checks `.ai/task/plan.md` exists (missing) | ERROR_PLAN_MISSING | (1) Update state to ERROR_PLAN_MISSING | - | [G2b.md](responses/gather_transitions/G2b.md) |
| G3 | GATHER_EDITING | Accio | No AC in plan.md AND plan.md exists | Reads `.ai/task/plan.md` content; Counts acceptance criteria (lines starting with `- [ ]`) (finds 0) | GATHER_EDITING | No state change | - | [G3.md](responses/gather_transitions/G3.md) |
| G4 | GATHER_EDITING | Accio | task.md exists AND plan.md exists | Checks `.ai/task/task.md` exists (exists); Checks `.ai/task/plan.md` exists (exists) | ACHIEVE_TASK_DRAFTING | (1) Update state to ACHIEVE_TASK_DRAFTING; (2) Load task.md content into memory | (1) Reads `.ai/task/task.md` content; (2) Replaces `[TASK_CONTENT_PLACEHOLDER]` in response with task content | [G4.md](responses/gather_transitions/G4.md) |
| G5 | GATHER_EDITING | Reparo | No PR review in progress | Checks `.ai/task/comments.md` exists (doesn't exist); Checks `.ai/task/review-task.md` exists (doesn't exist) | PR_GATHERING_COMMENTS_G | (1) Create `.ai/task/comments.md` empty file; (2) Update state to PR_GATHERING_COMMENTS_G | Creates `.ai/task/comments.md` file | [G5.md](responses/gather_transitions/G5.md) |

#### Context Gathering Phase Blocked Transitions

| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|---------------|------------|--------|-------------|----------|
| GCB1 | GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT | Reverto | - | - | [BLOCKED] | No state change | - | [GCB1.md](responses/gather_blocked/GCB1.md) |
| GCB2 | GATHER_NEEDS_CONTEXT | Expecto | - | - | [BLOCKED] | No state change | - | [GCB2.md](responses/gather_blocked/GCB2.md) |
| GCB3 | GATHER_NEEDS_CONTEXT | Reparo | - | - | [BLOCKED] | No state change | - | [GCB3.md](responses/gather_blocked/GCB3.md) |
| GCB4 | GATHER_EDITING_CONTEXT | Reparo | - | - | [BLOCKED] | No state change | - | [GCB4.md](responses/gather_blocked/GCB4.md) |

#### Context Gathering Phase No-op Transitions

| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|---------------|------------|--------|-------------|----------|
| GCN1 | GATHER_EDITING_CONTEXT | Finite | - | - | Same state | No state change | - | [GCN1.md](responses/gather_noop/GCN1.md) |
| GCN2 | GATHER_NEEDS_CONTEXT | Finite | - | - | Same state | No state change | - | [GCN2.md](responses/gather_noop/GCN2.md) |
| GCN3 | GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT | Expecto | No Atlassian URLs found | Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds none) | Same state | No state change | - | [GCN3.md](responses/gather_noop/GCN3.md) |

#### Gather Acceptance Criteria Phase Blocked Transitions

| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|---------------|------------|--------|-------------|----------|
| GB1 | GATHER_EDITING | Reverto | - | - | [BLOCKED] | No state change | - | [GB1.md](responses/gather_blocked/GB1.md) |

#### Gather Acceptance Criteria Phase No-op Transitions

| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
|----|---------------|---------|-----------|---------------|------------|--------|-------------|----------|
| GN1 | GATHER_EDITING | Finite | - | - | Same state | No state change | - | [GN1.md](responses/gather_noop/GN1.md) |
| GN3 | GATHER_EDITING | Expecto | No Atlassian URLs found | Reads `.ai/task/plan.md` content; Extracts Atlassian URLs from content (finds none) | Same state | No state change | - | [GN3.md](responses/gather_noop/GN3.md) |

#### Achieve Acceptance Criteria Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| A1 | ACHIEVE_TASK_DRAFTING | Accio | task.md exists AND plan.md exists | ACHIEVE_TASK_EXECUTED | Update state to ACHIEVE_TASK_EXECUTED | [A1.md](responses/achieve_transitions/A1.md) |
| A1b | ACHIEVE_TASK_DRAFTING | Accio | task.md missing | ERROR_TASK_MISSING | (1) Update state to ERROR_TASK_MISSING | [A1b.md](responses/achieve_transitions/A1b.md) |
| A2 | ACHIEVE_TASK_EXECUTED | Accio | task.md exists AND task-results.md exists AND plan.md exists | ACHIEVE_TASK_DRAFTING | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/`; (3) Load task-results.md content into memory; (4) Create new task.md template with YAML frontmatter; (5) Mention `.ai/task-guide.md` exists for task creation guidance and can be customized | [A2.md](responses/achieve_transitions/A2.md) |
| A2b | ACHIEVE_TASK_EXECUTED | Accio | task-results.md missing | ERROR_TASK_RESULTS_MISSING | (1) Update state to ERROR_TASK_RESULTS_MISSING | [A2b.md](responses/achieve_transitions/A2b.md) |
| A3 | ACHIEVE_TASK_DRAFTING | Accio | No unchecked AC in plan.md AND plan.md exists | ACHIEVE_COMPLETE | (1) Check plan.md for remaining unchecked ACs; (2) Update state to ACHIEVE_COMPLETE | [A3.md](responses/achieve_transitions/A3.md) |
| A4 | ACHIEVE_COMPLETE | Accio | - | ACHIEVE_COMPLETE | No state change | [A4.md](responses/achieve_transitions/A4.md) |

#### Achieve Acceptance Criteria Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| AB1 | ACHIEVE_TASK_EXECUTED | Finite | - | [BLOCKED] | No state change | [AB1.md](responses/achieve_blocked/AB1.md) |
| AB2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reverto | - | [BLOCKED] | No state change | [AB2.md](responses/achieve_blocked/AB2.md) |
| AB3 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Expecto | - | [BLOCKED] | No state change | [AB3.md](responses/achieve_blocked/AB3.md) |


#### PR Review Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| P1 | PR_GATHERING_COMMENTS_[G/A] | Accio | comments.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | (1) Update state to PR_REVIEW_TASK_DRAFT_[G/A]; (2) Create `.ai/task/review-task.md` with structured template including sections for task summary, specific tasks, and acceptance criteria; (3) Mention `.ai/task-guide.md` exists for task execution guidance and can be customized | [P1.md](responses/pr_transitions/P1.md) |
| P1b | PR_GATHERING_COMMENTS_[G/A] | Accio | comments.md missing | ERROR_COMMENTS_MISSING_[G/A] | (1) Update state to ERROR_COMMENTS_MISSING_[G/A] | [P1b.md](responses/pr_transitions/P1b.md) |
| P2 | PR_REVIEW_TASK_DRAFT_[G/A] | Accio | review-task.md exists | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Update state to PR_APPLIED_PENDING_ARCHIVE_[G/A] | [P2.md](responses/pr_transitions/P2.md) |
| P2b | PR_REVIEW_TASK_DRAFT_[G/A] | Accio | review-task.md missing | ERROR_REVIEW_TASK_MISSING_[G/A] | (1) Update state to ERROR_REVIEW_TASK_MISSING_[G/A] | [P2b.md](responses/pr_transitions/P2b.md) |
| P3 | PR_APPLIED_PENDING_ARCHIVE_G | Accio | review-task-results.md exists | GATHER_EDITING | (1) Load review-task-results.md content into memory; (2) Archive review files to pr-reviews/pr-review-<date>/; (3) Update state to GATHER_EDITING | [P3.md](responses/pr_transitions/P3.md) |
| P3b | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Accio | review-task-results.md missing | ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | (1) Update state to ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | [P3b.md](responses/pr_transitions/P3b.md) |
| P4a | PR_APPLIED_PENDING_ARCHIVE_A | Accio | review-task-results.md exists AND task.md exists | ACHIEVE_TASK_DRAFTING | (1) Load review-task-results.md content into memory; (2) Archive review files to pr-reviews/pr-review-<date>/; (3) Update state to ACHIEVE_TASK_DRAFTING | [P4a.md](responses/pr_transitions/P4a.md) |
| P4b | PR_APPLIED_PENDING_ARCHIVE_A | Accio | review-task-results.md exists AND task.md doesn't exist | ACHIEVE_TASK_DRAFTING | (1) Update plan.md with a summary of changes made based on review-task-results.md; (2) Create a new task.md focused on the next acceptance criterion: (a) Review plan.md to identify the next acceptance criterion to work on; (b) Create a clearly defined task that can be completed in one session; (c) Focus on the smallest complete unit of work that delivers value | [P4b.md](responses/pr_transitions/P4b.md) |


#### Starting PR Review (Reparo) Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| A5a | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE, ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING | Reparo | No PR review in progress | PR_GATHERING_COMMENTS_A | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) If no PR exists for the current branch or no comments found, explicitly document this in comments.md; (5) Format and write comments to comments.md. 'No PR review in progress' means there are no existing PR review files (comments.md or review-task.md) in the workspace, allowing us to start a fresh PR review. | [A5a.md](responses/reparo_transitions/A5a.md) |
| A5b | ERROR_COMMENTS_MISSING_[G/A], ERROR_REVIEW_TASK_MISSING_[G/A] | Reparo | No PR review in progress | PR_GATHERING_COMMENTS_[G/A] | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) If no PR exists for the current branch or no comments found, explicitly document this in comments.md; (5) Format and write comments to comments.md. 'No PR review in progress' means there are no existing PR review files (comments.md or review-task.md) in the workspace, allowing us to start a fresh PR review. | [A5b.md](responses/reparo_transitions/A5b.md) |
| PR1 | GATHER_EDITING | Reparo | PR review in progress (comments.md exists) | PR_CONFIRM_RESTART_COMMENTS_G | Ask user to confirm reset. This will potentially overwrite the existing comments.md file which contains PR comments that are being reviewed. Confirm only if you want to restart the PR review process with fresh comments. | [PR1.md](responses/reparo_transitions/PR1.md) |
| PR2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reparo | PR review in progress (comments.md exists) | PR_CONFIRM_RESTART_COMMENTS_A | Ask user to confirm reset. This will potentially overwrite the existing comments.md file which contains PR comments that are being reviewed. Confirm only if you want to restart the PR review process with fresh comments. | [PR2.md](responses/reparo_transitions/PR2.md) |
| PR3 | GATHER_EDITING | Reparo | PR review task in progress (review-task.md exists) | PR_CONFIRM_RESTART_TASK_G | Ask user to confirm reset. This will potentially discard the current review-task.md file which contains the specific tasks to be performed to address PR comments. Confirm only if you want to restart the review process from gathering comments. | [PR3.md](responses/reparo_transitions/PR3.md) |
| PR4 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reparo | PR review task in progress (review-task.md exists) | PR_CONFIRM_RESTART_TASK_A | Ask user to confirm reset. This will potentially discard the current review-task.md file which contains the specific tasks to be performed to address PR comments. Confirm only if you want to restart the review process from gathering comments. | [PR4.md](responses/reparo_transitions/PR4.md) |

#### PR Review Confirmation Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| C1 | PR_CONFIRM_RESTART_COMMENTS_[G/A] | Reparo | - | PR_GATHERING_COMMENTS_[G/A] | Gather PR comments from GitHub | [C1.md](responses/pr_confirm/C1.md) |
| C2 | PR_CONFIRM_RESTART_TASK_[G/A] | Reparo | - | PR_GATHERING_COMMENTS_[G/A] | Gather PR comments from GitHub | [C2.md](responses/pr_confirm/C2.md) |
| C3a | PR_CONFIRM_RESTART_COMMENTS_[G/A] | Accio | comments.md exists | PR_GATHERING_COMMENTS_[G/A] | Continue using existing comments file without resetting. This cancels the restart operation and continues the PR review with the existing comments file. | [C3a.md](responses/pr_confirm/C3a.md) |
| C3b | PR_CONFIRM_RESTART_COMMENTS_[G/A] | Accio | comments.md missing | ERROR_COMMENTS_MISSING_[G/A] | Explain: "Comments file is missing. Use Accio to recreate it and gather comments." | [C3b.md](responses/pr_confirm/C3b.md) |
| C3c | PR_CONFIRM_RESTART_TASK_[G/A] | Accio | review-task.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | Continue using existing review task without resetting. This cancels the restart operation and continues the PR review with the existing review task file. | [C3c.md](responses/pr_confirm/C3c.md) |
| C3d | PR_CONFIRM_RESTART_TASK_[G/A] | Accio | review-task.md missing | ERROR_REVIEW_TASK_MISSING_[G/A] | Explain: "Review task file is missing. Use Accio to create a new review task based on the PR comments. Alternatively, if you want to restart the PR review process from the beginning, use Reverto to cancel the current review." | [C3d.md](responses/pr_confirm/C3d.md) |


#### Error State Recovery Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| R1 | ERROR_TASK_MISSING | Accio | - | ACHIEVE_TASK_DRAFTING | Propose a task based on plan.md; mention `.ai/task-guide.md` exists for task creation guidance and can be customized | [R1.md](responses/error_recovery/R1.md) |
| R2 | ERROR_TASK_RESULTS_MISSING | Accio | task-results.md exists | ACHIEVE_TASK_DRAFTING | (1) Update plan.md with results and mark completed ACs; (2) Fill template with next task; (3) Mention `.ai/task-guide.md` exists for task creation guidance and can be customized | [R2.md](responses/error_recovery/R2.md) |
| R3 | ERROR_TASK_RESULTS_MISSING | Accio | task-results.md missing | ACHIEVE_TASK_DRAFTING | (1) Review plan, identify uncompleted ACs, fill out template; (2) Explain to user that incomplete task was archived; (3) Mention `.ai/task-guide.md` exists for task creation guidance and can be customized | [R3.md](responses/error_recovery/R3.md) |
| R4 | ERROR_PLAN_MISSING | Accio | - | GATHER_NEEDS_CONTEXT | Guide user through creating a new context | [R4.md](responses/error_recovery/R4.md) |
| R5a | ERROR_COMMENTS_MISSING_G | Accio | - | PR_GATHERING_COMMENTS_G | Gather comments using GitHub MCP | [R5a.md](responses/error_recovery/R5a.md) |
| R5b | ERROR_COMMENTS_MISSING_A | Accio | - | PR_GATHERING_COMMENTS_A | Gather comments using GitHub MCP | [R5b.md](responses/error_recovery/R5b.md) |
| R6a | ERROR_REVIEW_TASK_MISSING_[G/A] | Accio | comments.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | Fill out review task template based on comments.md | [R6a.md](responses/error_recovery/R6a.md) |
| R7a | ERROR_REVIEW_TASK_MISSING_[G/A] | Accio | comments.md missing | ERROR_COMMENTS_MISSING_[G/A] | Explain: "Cannot create review task because comments.md is also missing. Use Accio to recreate comments.md first." | [R7a.md](responses/error_recovery/R7a.md) |
| R8a | ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Accio | review-task.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | Re-execute the review task from review-task.md | [R8a.md](responses/error_recovery/R8a.md) |
| R9 | ERROR_CONTEXT_MISSING | Accio | - | GATHER_EDITING_CONTEXT | Create context.md template and guide user to add content | [R9.md](responses/error_recovery/R9.md) |

#### Error State Other Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| ER1 | ERROR_PLAN_MISSING | Finite | - | [BLOCKED] | Explain: "No plan to return to, must Accio to create one first." | [ER1.md](responses/error_other/ER1.md) |
| ER2 | ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Finite | - | [BLOCKED] | Explain: "Use Accio to recreate the review task first." | [ER2.md](responses/error_other/ER2.md) |
| ER3a | ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Reparo | - | [BLOCKED] | Explain: "Cannot start PR review until current error is resolved. Use Accio first." | [ER3a.md](responses/error_other/ER3a.md) |
| ER3b | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Reparo | - | [BLOCKED] | Explain: "Cannot start PR review until current review is archived. Use Accio first." | [ER3b.md](responses/error_other/ER3b.md) |
| ER4 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Reverto | - | [BLOCKED] | Explain: "Reverto is only available in PR review states. Resolve the current error first with Accio or Finite." | [ER4.md](responses/error_other/ER4.md) |
| ER5 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING | Finite | - | [BLOCKED] | Explain: "You should not return to plan editing until the current error is resolved. Use Accio to fix the missing file issue first." | [ER5.md](responses/error_other/ER5.md) |
| ER6 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING_[G/A] | Expecto | - | [BLOCKED] | Explain: "Expecto is only allowed in GATHER states. Resolve the current error first with Accio or Finite." | [ER6.md](responses/error_other/ER6.md) |
| ER7a | ERROR_PLAN_MISSING | Expecto | - | [BLOCKED] | Explain: "Cannot run Expecto without a plan file. Use Accio first to create one." | [ER7a.md](responses/error_other/ER7a.md) |
| ER7b | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Expecto | - | [BLOCKED] | Explain: "Cannot run Expecto until current review is archived. Use Accio first." | [ER7b.md](responses/error_other/ER7b.md) |
| ER8 | ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Expecto | - | [BLOCKED] | Explain: "Expecto is only allowed in GATHER states. Resolve the current error first with Accio." | [ER8.md](responses/error_other/ER8.md) |
| ER9 | ERROR_CONTEXT_MISSING | Finite | - | [BLOCKED] | Explain: "No context to return to, must Accio to create one first." | [ER9.md](responses/error_other/ER9.md) |
| ER10 | ERROR_CONTEXT_MISSING | Reparo | - | [BLOCKED] | Explain: "Cannot start PR review until current error is resolved. Use Accio first." | [ER10.md](responses/error_other/ER10.md) |
| ER11 | ERROR_CONTEXT_MISSING | Reverto | - | [BLOCKED] | Explain: "Reverto is only available in PR review states. Resolve the current error first with Accio." | [ER11.md](responses/error_other/ER11.md) |
| ER12 | ERROR_CONTEXT_MISSING | Expecto | - | [BLOCKED] | Explain: "Cannot run Expecto without a context file. Use Accio first to create one." | [ER12.md](responses/error_other/ER12.md) |

#### Finite Transitions (Universal Return to Plan)

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| F1 | Any state except ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE, ERROR_PLAN_MISSING, ERROR_CONTEXT_MISSING, ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A], PR_APPLIED_PENDING_ARCHIVE_[G/A], PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A], PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A], GATHER_NEEDS_CONTEXT, GATHER_EDITING_CONTEXT | Finite | - | GATHER_EDITING | Resume plan editing | [F1.md](responses/finite_transitions/F1.md) |
| F2 | ACHIEVE_COMPLETE | Finite | - | GATHER_EDITING | Resume plan editing with relevant context: you will return to plan editing with all acceptance criteria completed. | [F2.md](responses/finite_transitions/F2.md) |

#### Blocked Finite Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| F3 | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Finite | - | [BLOCKED] | Explain: "Must Accio to archive current review results first." | [F3.md](responses/finite_blocked/F3.md) |
| F4 | GATHER_NEEDS_CONTEXT | Finite | - | [BLOCKED] | Explain: "Must create context first with Accio." | [F4.md](responses/finite_blocked/F4.md) |
| F5 | GATHER_EDITING_CONTEXT | Finite | - | [BLOCKED] | Explain: "Must generate plan first with Accio." | [F5.md](responses/finite_blocked/F5.md) |

#### Reverto Transitions (Exit PR Review)
| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| V1 | PR_GATHERING_COMMENTS_G, PR_REVIEW_TASK_DRAFT_G, PR_CONFIRM_RESTART_COMMENTS_G, PR_CONFIRM_RESTART_TASK_G, ERROR_COMMENTS_MISSING_G | Reverto | - | GATHER_EDITING | Return to plan editing | [V1.md](responses/reverto_transitions/V1.md) |
| V2a | PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A | Reverto | task.md exists AND task-results.md doesn't exist | ACHIEVE_TASK_DRAFTING | Return to task drafting | [V2a.md](responses/reverto_transitions/V2a.md) |
| V2b | PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A, ERROR_COMMENTS_MISSING_A | Reverto | task.md exists AND task-results.md exists | ACHIEVE_TASK_EXECUTED | Return to executed task with results | [V2b.md](responses/reverto_transitions/V2b.md) |

#### PR Review Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| PB1 | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Reverto | - | [BLOCKED] | Tell user they must first Accio to archive current review results | [PB1.md](responses/pr_blocked/PB1.md) |
| PB2 | PR_GATHERING_COMMENTS_[G/A] | Expecto | - | [BLOCKED] | Explain: "Expecto is only allowed in GATHER states. Use Reverto to exit PR flow first." | [PB2.md](responses/pr_blocked/PB2.md) |
| PB2b | PR_REVIEW_TASK_DRAFT_[G/A] | Expecto | - | [BLOCKED] | Explain: "Expecto is only allowed in GATHER states. Use Reverto to exit PR flow first." | [PB2b.md](responses/pr_blocked/PB2b.md) |
| PB2d | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Expecto | - | [BLOCKED] | Explain: "Expecto is only allowed in GATHER states. Use Accio to archive current review results first." | [PB2d.md](responses/pr_blocked/PB2d.md) |
| PB3 | PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] | Finite | - | [BLOCKED] | Tell user they must first complete the PR review flow with Accio or exit with Reverto | [PB3.md](responses/pr_blocked/PB3.md) |
| PB4 | PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] | Reparo | - | [BLOCKED] | Tell user they must complete the current PR review process or use Reverto to cancel it | [PB4.md](responses/pr_blocked/PB4.md) |
| PB5 | PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] | Finite | - | [BLOCKED] | Tell user they must first confirm or cancel the restart operation using Reparo or Reverto | [PB5.md](responses/pr_blocked/PB5.md) |
| PB6 | PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] | Expecto | - | [BLOCKED] | Explain: "Expecto is only allowed in GATHER states. Use Reverto to cancel or Reparo to confirm, then Finite to return to plan editing." | [PB6.md](responses/pr_blocked/PB6.md) |


#### Universal Lumos Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| L1 | GATHER_NEEDS_PLAN | Lumos | - | Same state | Display current state and valid actions for the current state | [L1.md](responses/lumos_transitions/L1.md) |
| L2 | GATHER_EDITING | Lumos | - | Same state | Display current state and valid actions for the current state | [L2.md](responses/lumos_transitions/L2.md) |
| L3 | ACHIEVE_TASK_DRAFTING | Lumos | - | Same state | Display current state and valid actions for the current state | [L3.md](responses/lumos_transitions/L3.md) |
| L4 | ACHIEVE_TASK_EXECUTED | Lumos | - | Same state | Display current state and valid actions for the current state | [L4.md](responses/lumos_transitions/L4.md) |
| L5 | ACHIEVE_COMPLETE | Lumos | - | Same state | Display current state and valid actions for the current state | [L5.md](responses/lumos_transitions/L5.md) |
| L6 | PR_GATHERING_COMMENTS_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L6.md](responses/lumos_transitions/L6.md) |
| L7 | PR_GATHERING_COMMENTS_A | Lumos | - | Same state | Display current state and valid actions for the current state | [L7.md](responses/lumos_transitions/L7.md) |
| L8 | PR_REVIEW_TASK_DRAFT_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L8.md](responses/lumos_transitions/L8.md) |
| L9 | PR_REVIEW_TASK_DRAFT_A | Lumos | - | Same state | Display current state and valid actions for the current state | [L9.md](responses/lumos_transitions/L9.md) |
| L10 | PR_APPLIED_PENDING_ARCHIVE_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L10.md](responses/lumos_transitions/L10.md) |
| L11 | PR_APPLIED_PENDING_ARCHIVE_A | Lumos | - | Same state | Display current state and valid actions for the current state | [L11.md](responses/lumos_transitions/L11.md) |
| L12 | PR_CONFIRM_RESTART_COMMENTS_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L12.md](responses/lumos_transitions/L12.md) |
| L13 | PR_CONFIRM_RESTART_COMMENTS_A | Lumos | - | Same state | Display current state and valid actions for the current state | [L13.md](responses/lumos_transitions/L13.md) |
| L14 | PR_CONFIRM_RESTART_TASK_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L14.md](responses/lumos_transitions/L14.md) |
| L15 | PR_CONFIRM_RESTART_TASK_A | Lumos | - | Same state | Display current state and valid actions for the current state | [L15.md](responses/lumos_transitions/L15.md) |
| L16 | ERROR_TASK_MISSING | Lumos | - | Same state | Display current state and valid actions for the current state | [L16.md](responses/lumos_transitions/L16.md) |
| L17 | ERROR_TASK_RESULTS_MISSING | Lumos | - | Same state | Display current state and valid actions for the current state | [L17.md](responses/lumos_transitions/L17.md) |
| L18 | ERROR_PLAN_MISSING | Lumos | - | Same state | Display current state and valid actions for the current state | [L18.md](responses/lumos_transitions/L18.md) |
| L19 | ERROR_COMMENTS_MISSING_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L19.md](responses/lumos_transitions/L19.md) |
| L20 | ERROR_REVIEW_TASK_MISSING_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L20.md](responses/lumos_transitions/L20.md) |
| L21 | ERROR_REVIEW_TASK_RESULTS_MISSING_G | Lumos | - | Same state | Display current state and valid actions for the current state | [L21.md](responses/lumos_transitions/L21.md) |
| L22 | GATHER_NEEDS_CONTEXT | Lumos | - | Same state | Display current state and valid actions for the current state | [L22.md](responses/lumos_transitions/L22.md) |
| L23 | GATHER_EDITING_CONTEXT | Lumos | - | Same state | Display current state and valid actions for the current state | [L23.md](responses/lumos_transitions/L23.md) |
| L24 | ERROR_CONTEXT_MISSING | Lumos | - | Same state | Display current state and valid actions for the current state | [L24.md](responses/lumos_transitions/L24.md) |

#### Universal Expecto Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| E1b | GATHER_EDITING_CONTEXT | Expecto | Atlassian URLs found | GATHER_EDITING_CONTEXT | Enrich context with Jira/Confluence content | [E1b.md](responses/universal_expecto/E1b.md) |
| E2 | GATHER_EDITING | Expecto | Atlassian URLs found | GATHER_EDITING | Enrich plan with Jira/Confluence content | [E2.md](responses/universal_expecto/E2.md) |
| E3 | GATHER_EDITING_CONTEXT | Expecto | No Atlassian URLs found in context.md | Same state | Explain: "No Atlassian URLs found in context.md. Add Jira/Confluence links to enrich." | [E3.md](responses/universal_expecto/E3.md) |
| E3b | GATHER_EDITING | Expecto | No Atlassian URLs found in plan.md | Same state | Explain: "No Atlassian URLs found in plan.md. Add Jira/Confluence links to enrich." | [E3b.md](responses/universal_expecto/E3b.md) |
| E4 | GATHER_EDITING_CONTEXT | Expecto | All Atlassian URLs in context.md already processed | Same state | Explain: "All Atlassian URLs have already been processed. Edit .atlassian-refs to reprocess." | [E4.md](responses/universal_expecto/E4.md) |
| E4b | GATHER_EDITING | Expecto | All Atlassian URLs in plan.md already processed | Same state | Explain: "All Atlassian URLs have already been processed. Edit .atlassian-refs to reprocess." | [E4b.md](responses/universal_expecto/E4b.md) |


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
  "context": {

  },
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