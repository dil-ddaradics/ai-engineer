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

1. **GATHER_NEEDS_PLAN**
    - *Description*: Initial state; no plan exists yet
    - *Indicators*: `.ai/task/plan.md` does not exist
    - *Valid Actions*: Accio, Expecto, Lumos

2. **GATHER_EDITING**
    - *Description*: Plan file exists and is being edited
    - *Indicators*: `.ai/task/plan.md` exists
    - *Valid Actions*: Accio, Expecto, Lumos, Reparo, Finite (no-op)

3. **ACHIEVE_TASK_DRAFTING**
    - *Description*: Task is being created/refined but not yet executed
    - *Indicators*: `.ai/task/task.md` exists; `.ai/task/task-results.md` doesn't exist
    - *Valid Actions*: Accio, Finite, Reparo, Lumos

4. **ACHIEVE_TASK_EXECUTED**
    - *Description*: Task has been executed; results ready for review
    - *Indicators*: `.ai/task/task-results.md` exists
    - *Valid Actions*: Accio, Reparo, Lumos

5. **ACHIEVE_COMPLETE**
    - *Description*: All acceptance criteria have been met
    - *Indicators*: No unchecked acceptance criteria in `.ai/task/plan.md`
    - *Valid Actions*: Finite, Reparo, Lumos

6. **PR_GATHERING_COMMENTS**
    - *Description*: PR review comments have been collected
    - *Indicators*: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

7. **PR_REVIEW_TASK_DRAFT**
    - *Description*: Review task is being created/refined
    - *Indicators*: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

8. **PR_APPLIED_PENDING_ARCHIVE**
    - *Description*: Review task has been applied; results ready for archiving
    - *Indicators*: `.ai/task/review-task-results.md` exists
    - *Valid Actions*: Accio, Finite, Lumos

9. **PR_CONFIRM_RESTART_COMMENTS**
    - *Description*: User requested Reparo while comments.md exists
    - *Indicators*: `.ai/task/comments.md` exists and state.json marks confirm needed
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

10. **PR_CONFIRM_RESTART_TASK**
    - *Description*: User requested Reparo while review-task.md exists
    - *Indicators*: `.ai/task/review-task.md` exists and state.json marks confirm needed
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

11. **ERROR_TASK_MISSING**
    - *Description*: In ACHIEVE_TASK_DRAFTING state, but task.md is missing
    - *Indicators*: state.json shows ACHIEVE_TASK_DRAFTING but task.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

12. **ERROR_TASK_RESULTS_MISSING**
    - *Description*: In ACHIEVE_TASK_EXECUTED state, but task-results.md is missing
    - *Indicators*: state.json shows ACHIEVE_TASK_EXECUTED but task-results.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

13. **ERROR_PLAN_MISSING**
    - *Description*: Any state except GATHER_NEEDS_PLAN requires plan.md but it's missing
    - *Indicators*: Any state except GATHER_NEEDS_PLAN but plan.md doesn't exist
    - *Valid Actions*: Accio, Lumos

14. **ERROR_COMMENTS_MISSING**
    - *Description*: In PR_GATHERING_COMMENTS state, but comments.md is missing
    - *Indicators*: state.json shows PR_GATHERING_COMMENTS but comments.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

15. **ERROR_REVIEW_TASK_MISSING**
    - *Description*: In PR_REVIEW_TASK_DRAFT state, but review-task.md is missing
    - *Indicators*: state.json shows PR_REVIEW_TASK_DRAFT but review-task.md doesn't exist
    - *Valid Actions*: Accio, Lumos

16. **ERROR_REVIEW_TASK_RESULTS_MISSING**
    - *Description*: In PR_APPLIED_PENDING_ARCHIVE state, but review-task-results.md is missing
    - *Indicators*: state.json shows PR_APPLIED_PENDING_ARCHIVE but review-task-results.md doesn't exist
    - *Valid Actions*: Accio, Lumos

### Transition Rules

#### Gather Acceptance Criteria Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| G1 | GATHER_NEEDS_PLAN | Accio | - | GATHER_EDITING | Create `.ai/task/plan.md` from template | Guide user in filling out sections, especially Acceptance Criteria |
| G2 | GATHER_EDITING | Accio | ≥1 AC in plan.md AND task.md doesn't exist AND plan.md exists | ACHIEVE_TASK_DRAFTING | Create `.ai/task/task.md` template with YAML frontmatter | Propose next smallest task toward remaining Acceptance Criteria |
| G2b | GATHER_EDITING, ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED | Accio | plan.md missing | ERROR_PLAN_MISSING | (1) Update state to ERROR_PLAN_MISSING; (2) Store original state in context.error_original_state | Explain: "Plan file is missing. Use Accio to reset and create a new plan." |
| G3 | GATHER_EDITING | Accio | No AC in plan.md AND plan.md exists | GATHER_EDITING | No state change | Prompt user to add at least one Acceptance Criterion to plan.md |
| G4 | GATHER_EDITING | Accio | task.md exists AND plan.md exists | ACHIEVE_TASK_DRAFTING | (1) Update state to ACHIEVE_TASK_DRAFTING; (2) Load task.md content into memory | (1) Summarize the task.md content; (2) Tell the user to continue drafting it |
| G5 | GATHER_NEEDS_PLAN, GATHER_EDITING, ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE, ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING, ERROR_REVIEW_TASK_MISSING | Reparo | No PR review in progress | PR_GATHERING_COMMENTS | (1) Create `.ai/task/comments.md` empty file; (2) Store current state in context.pr_return_state; (3) Update state to PR_GATHERING_COMMENTS | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) Format and write comments to comments.md |

#### Gather Acceptance Criteria Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| GB1 | GATHER_NEEDS_PLAN, GATHER_EDITING | Reverto | - | [BLOCKED] | No state change | Explain: "Reverto is only available in PR states." |

#### Gather Acceptance Criteria Phase No-op Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| GN1 | GATHER_EDITING | Finite | - | GATHER_EDITING | No state change | Explain: "Already in plan editing state." |
| GN2 | GATHER_NEEDS_PLAN | Finite | - | GATHER_NEEDS_PLAN | No state change | Explain: "Cannot return to plan editing since we're already in initial state. Use Accio to create a plan." |
| GN3 | GATHER_NEEDS_PLAN, GATHER_EDITING | Expecto | No Atlassian URLs found | Same state | No state change | Explain: "No Atlassian URLs found in plan.md. Add Jira/Confluence links to enrich." |

#### Achieve Acceptance Criteria Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| A1 | ACHIEVE_TASK_DRAFTING | Accio | task.md exists AND plan.md exists | ACHIEVE_TASK_EXECUTED | Update state to ACHIEVE_TASK_EXECUTED | (1) Execute task in task.md; (2) Document results in task-results.md |
| A1b | ACHIEVE_TASK_DRAFTING | Accio | task.md missing | ERROR_TASK_MISSING | (1) Update state to ERROR_TASK_MISSING; (2) Store original state in context.error_original_state | Explain: "Task file is missing. Use Accio to create a new task or Finite to return to plan editing." |
| A2 | ACHIEVE_TASK_EXECUTED | Accio | task.md exists AND task-results.md exists AND plan.md exists | ACHIEVE_TASK_DRAFTING | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/`; (3) Load task-results.md content into memory; (4) Create new task.md template with YAML frontmatter | (1) Update plan.md with results and mark completed ACs; (2) Fill template with next task toward remaining ACs or note if all ACs appear complete |
| A2b | ACHIEVE_TASK_EXECUTED | Accio | task-results.md missing | ERROR_TASK_RESULTS_MISSING | (1) Update state to ERROR_TASK_RESULTS_MISSING; (2) Store original state in context.error_original_state | Explain: "Task results file is missing. Please ask the AI to recreate task-results.md based on the current git diff." |
| A3 | ACHIEVE_TASK_DRAFTING | Accio | No unchecked AC in plan.md AND plan.md exists | ACHIEVE_COMPLETE | (1) Check plan.md for remaining unchecked ACs; (2) Update state to ACHIEVE_COMPLETE | Inform user all ACs are complete and suggest Finite (to add more ACs) or Reparo (for PR reviews) |
| A4 | ACHIEVE_COMPLETE | Accio | - | ACHIEVE_COMPLETE | No state change | Remind user that all ACs are complete and suggest Finite (to add more ACs) or Reparo (for PR reviews) |

#### Achieve Acceptance Criteria Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| AB1 | ACHIEVE_TASK_EXECUTED, PR_APPLIED_PENDING_ARCHIVE | Finite | - | [BLOCKED] | No state change | Tell user they must complete task integration with Accio first |
| AB2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reverto | - | [BLOCKED] | No state change | Explain: "Reverto is only available in PR states." |
| AB3 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Finite to return to plan editing first." |


#### PR Review Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| P1 | PR_GATHERING_COMMENTS | Accio | comments.md exists | PR_REVIEW_TASK_DRAFT | (1) Update state to PR_REVIEW_TASK_DRAFT; (2) Create `.ai/task/review-task.md` template | Propose review tasks covering all comments |
| P1b | PR_GATHERING_COMMENTS | Accio | comments.md missing | ERROR_COMMENTS_MISSING | (1) Update state to ERROR_COMMENTS_MISSING; (2) Store original state in context.error_original_state | Explain: "Comments file is missing. Use Accio to recreate it and gather comments." |
| P2 | PR_REVIEW_TASK_DRAFT | Accio | review-task.md exists | PR_APPLIED_PENDING_ARCHIVE | Update state to PR_APPLIED_PENDING_ARCHIVE | (1) Apply review tasks from review-task.md; (2) Document results in review-task-results.md |
| P2b | PR_REVIEW_TASK_DRAFT | Accio | review-task.md missing | ERROR_REVIEW_TASK_MISSING | (1) Update state to ERROR_REVIEW_TASK_MISSING; (2) Store original state in context.error_original_state | Explain: "Review task file is missing. Use Accio to create a new review task." |
| P3 | PR_APPLIED_PENDING_ARCHIVE | Accio | context.pr_return_state starts with GATHER AND review-task-results.md exists | GATHER_EDITING | (1) Archive review files to pr-reviews/pr-review-<date>/; (2) Update state to GATHER_EDITING; (3) Clear context.pr_return_state | Resume plan editing |
| P3b | PR_APPLIED_PENDING_ARCHIVE | Accio | review-task-results.md missing | ERROR_REVIEW_TASK_RESULTS_MISSING | (1) Update state to ERROR_REVIEW_TASK_RESULTS_MISSING; (2) Store original state in context.error_original_state | Explain: "Review task results file is missing. Please ask the AI to execute the review task again." |
| P4 | PR_APPLIED_PENDING_ARCHIVE | Accio | context.pr_return_state starts with ACHIEVE AND review-task-results.md exists | ACHIEVE_TASK_DRAFTING | (1) Archive review files to pr-reviews/pr-review-<date>/; (2) Update state to ACHIEVE_TASK_DRAFTING; (3) Clear context.pr_return_state | If task.md exists, resume with it, otherwise create new task.md |


#### Starting PR Review (Reparo) Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| R1 | Any state except ACHIEVE_TASK_EXECUTED, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING, PR_APPLIED_PENDING_ARCHIVE | Reparo | No PR review in progress | PR_GATHERING_COMMENTS | (1) Create `.ai/task/comments.md` empty file; (2) Store current state in context.pr_return_state; (3) Update state to PR_GATHERING_COMMENTS | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) Format and write comments to comments.md |
| R2 | Any | Reparo | PR review in progress (comments.md exists) | PR_CONFIRM_RESTART_COMMENTS | (1) Update state to PR_CONFIRM_RESTART_COMMENTS; (2) Store current state in context.pr_return_state | Ask user to confirm reset |
| R3 | Any | Reparo | PR review task in progress (review-task.md exists) | PR_CONFIRM_RESTART_TASK | (1) Update state to PR_CONFIRM_RESTART_TASK; (2) Store current state in context.pr_return_state | Ask user to confirm reset |

#### PR Review Confirmation Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| C1 | PR_CONFIRM_RESTART_COMMENTS | Reparo | - | PR_GATHERING_COMMENTS | (1) Delete existing comments.md; (2) Create new comments.md; (3) Update state to PR_GATHERING_COMMENTS | Gather PR comments from GitHub |
| C2 | PR_CONFIRM_RESTART_COMMENTS, PR_CONFIRM_RESTART_TASK | Accio | - | Previous state | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state | Resume previous context |
| C3 | PR_CONFIRM_RESTART_TASK | Reparo | - | PR_GATHERING_COMMENTS | (1) Delete existing review files; (2) Create new comments.md; (3) Update state to PR_GATHERING_COMMENTS | Gather PR comments from GitHub |


#### Error State Recovery Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| R1 | ERROR_TASK_MISSING | Accio | - | ACHIEVE_TASK_DRAFTING | (1) Create new task.md template; (2) Update state to ACHIEVE_TASK_DRAFTING; (3) Clear context.error_original_state | Propose a task based on plan.md |
| R2 | ERROR_TASK_RESULTS_MISSING | Accio | task-results.md exists | ACHIEVE_TASK_DRAFTING | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to proper location; (3) Load task-results.md content; (4) Create new task.md template; (5) Update state to ACHIEVE_TASK_DRAFTING; (6) Clear context.error_original_state | (1) Update plan.md with results and mark completed ACs; (2) Fill template with next task |
| R3 | ERROR_TASK_RESULTS_MISSING | Accio | task-results.md missing | ACHIEVE_TASK_DRAFTING | (1) Archive task.md to incomplete-task folder; (2) Create new task.md; (3) Load plan.md content; (4) Update state to ACHIEVE_TASK_DRAFTING; (5) Clear context.error_original_state | (1) Review plan, identify uncompleted ACs, propose next task; (2) Explain to user that incomplete task was archived |
| R4 | ERROR_PLAN_MISSING | Accio | - | GATHER_NEEDS_PLAN | (1) Create new plan.md template; (2) Update state to GATHER_NEEDS_PLAN; (3) Clear context.error_original_state | Guide user through creating a new plan |
| R5 | ERROR_COMMENTS_MISSING | Accio | - | PR_GATHERING_COMMENTS | (1) Create empty comments.md; (2) Update state to PR_GATHERING_COMMENTS; (3) Clear context.error_original_state | Gather comments using GitHub MCP |
| R6 | ERROR_REVIEW_TASK_MISSING | Accio | comments.md exists | PR_REVIEW_TASK_DRAFT | (1) Create new review-task.md template; (2) Update state to PR_REVIEW_TASK_DRAFT; (3) Clear context.error_original_state | Recreate review task based on comments.md |
| R7 | ERROR_REVIEW_TASK_MISSING | Accio | comments.md missing | ERROR_COMMENTS_MISSING | (1) Update state to ERROR_COMMENTS_MISSING | Explain: "Cannot create review task because comments.md is also missing. Use Accio to recreate comments.md first." |
| R8 | ERROR_REVIEW_TASK_RESULTS_MISSING | Accio | review-task.md exists | PR_REVIEW_TASK_DRAFT | (1) Update state to PR_REVIEW_TASK_DRAFT; (2) Clear context.error_original_state | Re-execute the review task from review-task.md |

#### Error State Other Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| ER1 | ERROR_PLAN_MISSING | Finite | - | [BLOCKED] | No state change | Explain: "Cannot return to plan editing because plan.md is missing. Use Accio to create a new plan." |
| ER2 | ERROR_REVIEW_TASK_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING | Finite | - | [BLOCKED] | No state change | Explain: "Use Accio to recreate the review task first." |
| ER3 | ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING, PR_APPLIED_PENDING_ARCHIVE | Reparo | - | [BLOCKED] | No state change | Explain: "Cannot start PR review until current task is completed. Use Accio first." |
| ER4 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_PLAN_MISSING, ERROR_COMMENTS_MISSING, ERROR_REVIEW_TASK_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING | Reverto | - | [BLOCKED] | No state change | Explain: "Reverto is only available in PR review states. Resolve the current error first with Accio or Finite." |
| ER5 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING | Finite | - | GATHER_EDITING | Update state to GATHER_EDITING | Resume plan editing |
| ER6 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Resolve the current error first with Accio or Finite." |
| ER7 | ERROR_PLAN_MISSING, PR_APPLIED_PENDING_ARCHIVE | Expecto | - | [BLOCKED] | No state change | Explain: "Cannot run Expecto in the current state. Resolve the current issue with Accio first." |
| ER8 | ERROR_REVIEW_TASK_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Resolve the current error first with Accio." |

#### Finite Transitions (Universal Return to Plan)

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| F1 | Any state except ACHIEVE_TASK_EXECUTED, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING, PR_APPLIED_PENDING_ARCHIVE, PR_CONFIRM_RESTART_COMMENTS, PR_CONFIRM_RESTART_TASK, PR_GATHERING_COMMENTS, PR_REVIEW_TASK_DRAFT | Finite | - | GATHER_EDITING | Update state to GATHER_EDITING | Resume plan editing |
| F2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_COMPLETE | Finite | - | GATHER_EDITING | Update state to GATHER_EDITING | Resume plan editing |

**Blocked Finite States (where Finite is not available):**
- ACHIEVE_TASK_EXECUTED: Must Accio first to integrate results before returning to planning
- ERROR_PLAN_MISSING: No plan to return to, must Accio to create one first
- ERROR_REVIEW_TASK_MISSING: Must Accio to create review task first
- ERROR_REVIEW_TASK_RESULTS_MISSING: Must Accio to recreate review task results first
- PR_APPLIED_PENDING_ARCHIVE: Must Accio to archive current review results first

#### Reverto Transitions (Exit PR Review)
| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| V1 | PR_GATHERING_COMMENTS, PR_REVIEW_TASK_DRAFT, PR_CONFIRM_RESTART_COMMENTS, PR_CONFIRM_RESTART_TASK | Reverto | - | Previous state | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state | Resume previous context |

#### PR Review Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| PB1 | PR_APPLIED_PENDING_ARCHIVE | Reverto | - | [BLOCKED] | No state change | Tell user they must first Accio to archive current review results |
| PB2 | PR_GATHERING_COMMENTS, PR_REVIEW_TASK_DRAFT | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Finite or Reverto to exit PR flow first." |
| PB3 | PR_GATHERING_COMMENTS, PR_REVIEW_TASK_DRAFT | Finite | - | [BLOCKED] | No state change | Tell user they must first complete the PR review flow with Accio or exit with Reverto |
| PB4 | PR_GATHERING_COMMENTS, PR_REVIEW_TASK_DRAFT | Reparo | - | [BLOCKED] | No state change | Tell user they must complete the current PR review process or use Reverto to cancel it |
| PB5 | PR_CONFIRM_RESTART_COMMENTS, PR_CONFIRM_RESTART_TASK | Finite | - | [BLOCKED] | No state change | Tell user they must first confirm or cancel the restart operation using Reparo or Reverto |
| PB6 | PR_CONFIRM_RESTART_COMMENTS, PR_CONFIRM_RESTART_TASK | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Reverto to cancel or Reparo to confirm, then Finite to return to plan editing." |


#### Universal Lumos Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| L1 | Any state | Lumos | - | Same state | (1) Read state.json; (2) Determine valid actions | Display current state and valid actions for the current state |

#### Universal Expecto Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Response |
|----|---------------|---------|-----------|------------|--------|----------|
| E1 | GATHER_NEEDS_PLAN | Expecto | Atlassian URLs found | GATHER_NEEDS_PLAN | (1) Extract Atlassian URLs from plan.md; (2) Fetch content via Atlassian MCP; (3) Save content to .ai/task/atlassian/<ID>.md; (4) Update plan.md with references | Enrich plan with Jira/Confluence content |
| E2 | GATHER_EDITING | Expecto | Atlassian URLs found | GATHER_EDITING | (1) Extract Atlassian URLs from plan.md; (2) Fetch content via Atlassian MCP; (3) Save content to .ai/task/atlassian/<ID>.md; (4) Update plan.md with references | Enrich plan with Jira/Confluence content |

### State Guards

1. **Expecto Guard**: Only allowed in GATHER states
2. **Reparo Guard**: Blocked if PR_APPLIED_PENDING_ARCHIVE (must Accio to finish current review)
3. **Reverto Guard**: Only allowed in PR states (except PR_APPLIED_PENDING_ARCHIVE where Accio must be used to complete the archive)

### State Persistence

All state is persisted in `.ai/task/state.json` with the following structure:

```json
{
  "current_state": "GATHER_EDITING",
  "context": {
    // Only populated for states that need previous state tracking
    "pr_return_state": "ACHIEVE_TASK_DRAFTING",  // Only present during PR review flow
    "error_original_state": "ACHIEVE_TASK_DRAFTING"  // Only present during error states
  },
  "history": [
    {
      "timestamp": "2025-08-20T15:30:00Z",
      "transition": "GATHER_NEEDS_PLAN → GATHER_EDITING",
      "trigger": "Accio"
    }
  ]
}
```

The existence of specific files serves as a secondary indicator of state, but the authoritative source is always the state file.
