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

6. **PR_GATHERING_COMMENTS_G**
    - *Description*: PR review comments have been collected (entered from GATHER phase)
    - *Indicators*: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist; state.json shows origin from GATHER
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

7. **PR_GATHERING_COMMENTS_A**
    - *Description*: PR review comments have been collected (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist; state.json shows origin from ACHIEVE
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

8. **PR_REVIEW_TASK_DRAFT_G**
    - *Description*: Review task is being created/refined (entered from GATHER phase)
    - *Indicators*: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist; state.json shows origin from GATHER
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

9. **PR_REVIEW_TASK_DRAFT_A**
    - *Description*: Review task is being created/refined (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist; state.json shows origin from ACHIEVE
    - *Valid Actions*: Accio, Finite, Reverto, Lumos

10. **PR_APPLIED_PENDING_ARCHIVE_G**
    - *Description*: Review task has been applied; results ready for archiving (entered from GATHER phase)
    - *Indicators*: `.ai/task/review-task-results.md` exists; state.json shows origin from GATHER
    - *Valid Actions*: Accio, Finite, Lumos

11. **PR_APPLIED_PENDING_ARCHIVE_A**
    - *Description*: Review task has been applied; results ready for archiving (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/review-task-results.md` exists; state.json shows origin from ACHIEVE
    - *Valid Actions*: Accio, Finite, Lumos

12. **PR_CONFIRM_RESTART_COMMENTS_G**
    - *Description*: User requested Reparo while comments.md exists (entered from GATHER phase)
    - *Indicators*: `.ai/task/comments.md` exists and state.json marks confirm needed; state.json shows origin from GATHER
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

13. **PR_CONFIRM_RESTART_COMMENTS_A**
    - *Description*: User requested Reparo while comments.md exists (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/comments.md` exists and state.json marks confirm needed; state.json shows origin from ACHIEVE
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

14. **PR_CONFIRM_RESTART_TASK_G**
    - *Description*: User requested Reparo while review-task.md exists (entered from GATHER phase)
    - *Indicators*: `.ai/task/review-task.md` exists and state.json marks confirm needed; state.json shows origin from GATHER
    - *Valid Actions*: Reparo (confirm), Lumos, Reverto (cancel)

15. **PR_CONFIRM_RESTART_TASK_A**
    - *Description*: User requested Reparo while review-task.md exists (entered from ACHIEVE phase)
    - *Indicators*: `.ai/task/review-task.md` exists and state.json marks confirm needed; state.json shows origin from ACHIEVE
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

14. **ERROR_COMMENTS_MISSING_G**
    - *Description*: In PR_GATHERING_COMMENTS_G state, but comments.md is missing
    - *Indicators*: state.json shows PR_GATHERING_COMMENTS_G but comments.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

14a. **ERROR_COMMENTS_MISSING_A**
    - *Description*: In PR_GATHERING_COMMENTS_A state, but comments.md is missing
    - *Indicators*: state.json shows PR_GATHERING_COMMENTS_A but comments.md doesn't exist
    - *Valid Actions*: Accio, Finite, Lumos

15. **ERROR_REVIEW_TASK_MISSING_G**
    - *Description*: In PR_REVIEW_TASK_DRAFT_G state, but review-task.md is missing
    - *Indicators*: state.json shows PR_REVIEW_TASK_DRAFT_G but review-task.md doesn't exist
    - *Valid Actions*: Accio, Lumos

15a. **ERROR_REVIEW_TASK_MISSING_A**
    - *Description*: In PR_REVIEW_TASK_DRAFT_A state, but review-task.md is missing
    - *Indicators*: state.json shows PR_REVIEW_TASK_DRAFT_A but review-task.md doesn't exist
    - *Valid Actions*: Accio, Lumos

16. **ERROR_REVIEW_TASK_RESULTS_MISSING_G**
    - *Description*: In PR_APPLIED_PENDING_ARCHIVE_G state, but review-task-results.md is missing
    - *Indicators*: state.json shows PR_APPLIED_PENDING_ARCHIVE_G but review-task-results.md doesn't exist
    - *Valid Actions*: Accio, Lumos

16a. **ERROR_REVIEW_TASK_RESULTS_MISSING_A**
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


#### Gather Acceptance Criteria Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| G1 | GATHER_NEEDS_PLAN | Accio | - | GATHER_EDITING | Create `.ai/task/plan.md` from template | Guide user in filling out sections, especially Acceptance Criteria | [G1.md](responses/gather_transitions/G1.md) |
| G2 | GATHER_EDITING | Accio | ≥1 AC in plan.md AND task.md doesn't exist AND plan.md exists | ACHIEVE_TASK_DRAFTING | Create `.ai/task/task.md` template with YAML frontmatter | Propose next smallest task toward remaining Acceptance Criteria | [G2.md](responses/gather_transitions/G2.md) |
| G2b | GATHER_EDITING, ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED | Accio | plan.md missing | ERROR_PLAN_MISSING | (1) Update state to ERROR_PLAN_MISSING | Explain: "Plan file is missing. Use Accio to reset and create a new plan." | [G2b.md](responses/gather_transitions/G2b.md) |
| G3 | GATHER_EDITING | Accio | No AC in plan.md AND plan.md exists | GATHER_EDITING | No state change | Prompt user to add at least one Acceptance Criterion to plan.md | [G3.md](responses/gather_transitions/G3.md) |
| G4 | GATHER_EDITING | Accio | task.md exists AND plan.md exists | ACHIEVE_TASK_DRAFTING | (1) Update state to ACHIEVE_TASK_DRAFTING; (2) Load task.md content into memory | (1) Summarize the task.md content; (2) Tell the user to continue drafting it | [G4.md](responses/gather_transitions/G4.md) |
| G5 | GATHER_NEEDS_PLAN, GATHER_EDITING | Reparo | No PR review in progress | PR_GATHERING_COMMENTS_G | (1) Create `.ai/task/comments.md` empty file; (2) Update state to PR_GATHERING_COMMENTS_G | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) If no PR exists for the current branch or no comments found, explicitly document this in comments.md; (5) Format and write comments to comments.md. 'No PR review in progress' means there isn't already a comments.md or review-task.md file present, allowing us to start a fresh PR review process. | [G5.md](responses/gather_transitions/G5.md) |

#### Gather Acceptance Criteria Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| GB1 | GATHER_NEEDS_PLAN, GATHER_EDITING | Reverto | - | [BLOCKED] | No state change | Explain: "Reverto is only available in PR states." | [GB1.md](responses/gather_blocked/GB1.md) |

#### Gather Acceptance Criteria Phase No-op Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| GN1 | GATHER_EDITING | Finite | - | Same state | No state change | Explain: "Already in plan editing state, no action needed." | [GN1.md](responses/gather_noop/GN1.md) |
| GN2 | GATHER_NEEDS_PLAN | Finite | - | Same state | No state change | Explain: "Cannot return to plan editing since we're already in initial state. Use Accio to create a plan." | [GN2.md](responses/gather_noop/GN2.md) |
| GN3 | GATHER_NEEDS_PLAN, GATHER_EDITING | Expecto | No Atlassian URLs found | Same state | No state change | Explain: "No Atlassian URLs found in plan.md. Add Jira/Confluence links to enrich." | [GN3.md](responses/gather_noop/GN3.md) |

#### Achieve Acceptance Criteria Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| A1 | ACHIEVE_TASK_DRAFTING | Accio | task.md exists AND plan.md exists | ACHIEVE_TASK_EXECUTED | Update state to ACHIEVE_TASK_EXECUTED | (1) Execute task in task.md; (2) Document results in task-results.md | [A1.md](responses/achieve_transitions/A1.md) |
| A1b | ACHIEVE_TASK_DRAFTING | Accio | task.md missing | ERROR_TASK_MISSING | (1) Update state to ERROR_TASK_MISSING | Explain: "Task file is missing. Use Accio to create a new task or Finite to return to plan editing." | [A1b.md](responses/achieve_transitions/A1b.md) |
| A2 | ACHIEVE_TASK_EXECUTED | Accio | task.md exists AND task-results.md exists AND plan.md exists | ACHIEVE_TASK_DRAFTING | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/`; (3) Load task-results.md content into memory; (4) Create new task.md template with YAML frontmatter | (1) Update plan.md with results and mark completed ACs; (2) Fill template with next task toward remaining ACs or note if all ACs appear complete | [A2.md](responses/achieve_transitions/A2.md) |
| A2b | ACHIEVE_TASK_EXECUTED | Accio | task-results.md missing | ERROR_TASK_RESULTS_MISSING | (1) Update state to ERROR_TASK_RESULTS_MISSING | Explain: "Task results file is missing. Please ask the AI to recreate task-results.md based on the current git diff." | [A2b.md](responses/achieve_transitions/A2b.md) |
| A3 | ACHIEVE_TASK_DRAFTING | Accio | No unchecked AC in plan.md AND plan.md exists | ACHIEVE_COMPLETE | (1) Check plan.md for remaining unchecked ACs; (2) Update state to ACHIEVE_COMPLETE | Inform user all ACs are complete and suggest Finite (to add more ACs) or Reparo (for PR reviews) | [A3.md](responses/achieve_transitions/A3.md) |
| A4 | ACHIEVE_COMPLETE | Accio | - | ACHIEVE_COMPLETE | No state change | Remind user that all ACs are complete and suggest Finite (to add more ACs) or Reparo (for PR reviews) | [A4.md](responses/achieve_transitions/A4.md) |

#### Achieve Acceptance Criteria Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| AB1 | ACHIEVE_TASK_EXECUTED | Finite | - | [BLOCKED] | No state change | Explain: "You must complete task integration with Accio first before returning to gathering. Your work is pending integration with the plan. Running Accio will properly process these results before continuing." | [AB1.md](responses/achieve_blocked/AB1.md) |
| AB2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reverto | - | [BLOCKED] | No state change | Explain: "Reverto is only available in PR states. It's used specifically to exit the PR review flow, but you're currently not responding to PR comments or in a PR review process." | [AB2.md](responses/achieve_blocked/AB2.md) |
| AB3 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states because it enriches planning information from external resources. Use Finite to return to plan editing first, then you can use Expecto to enhance your plan with Atlassian resources." | [AB3.md](responses/achieve_blocked/AB3.md) |


#### PR Review Phase Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| P1 | PR_GATHERING_COMMENTS_[G/A] | Accio | comments.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | (1) Update state to PR_REVIEW_TASK_DRAFT_[G/A]; (2) Create `.ai/task/review-task.md` with structured template including sections for task summary, specific tasks, and acceptance criteria | Propose review tasks covering all comments | [P1.md](responses/pr_transitions/P1.md) |
| P1b | PR_GATHERING_COMMENTS_[G/A] | Accio | comments.md missing | ERROR_COMMENTS_MISSING_[G/A] | (1) Update state to ERROR_COMMENTS_MISSING_[G/A] | Explain: "Comments file is missing. Use Accio to recreate it and gather comments." | [P1b.md](responses/pr_transitions/P1b.md) |
| P2 | PR_REVIEW_TASK_DRAFT_[G/A] | Accio | review-task.md exists | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Update state to PR_APPLIED_PENDING_ARCHIVE_[G/A] | (1) Apply review tasks from review-task.md; (2) Document results in review-task-results.md | [P2.md](responses/pr_transitions/P2.md) |
| P2b | PR_REVIEW_TASK_DRAFT_[G/A] | Accio | review-task.md missing | ERROR_REVIEW_TASK_MISSING_[G/A] | (1) Update state to ERROR_REVIEW_TASK_MISSING_[G/A] | Explain: "Review task file is missing. Use Accio to create a new review task based on the PR comments. Alternatively, if you want to restart the PR review process from the beginning, use Reverto to cancel the current review." | [P2b.md](responses/pr_transitions/P2b.md) |
| P3 | PR_APPLIED_PENDING_ARCHIVE_G | Accio | review-task-results.md exists | GATHER_EDITING | (1) Load review-task-results.md content into memory; (2) Archive review files to pr-reviews/pr-review-<date>/; (3) Update state to GATHER_EDITING | (1) Update plan.md with a summary of changes made based on review-task-results.md; (2) Resume plan editing | [P3.md](responses/pr_transitions/P3.md) |
| P3b | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Accio | review-task-results.md missing | ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | (1) Update state to ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Explain: "Review task results file is missing. Please ask the AI to execute the review task again. The review-task-results.md file can also be recreated by asking the AI to summarize the changes it sees in the git diff if it only contains changes based on PR comments." | [P3b.md](responses/pr_transitions/P3b.md) |
| P4a | PR_APPLIED_PENDING_ARCHIVE_A | Accio | review-task-results.md exists AND task.md exists | ACHIEVE_TASK_DRAFTING | (1) Load review-task-results.md content into memory; (2) Archive review files to pr-reviews/pr-review-<date>/; (3) Update state to ACHIEVE_TASK_DRAFTING | (1) Update plan.md with a summary of changes made based on review-task-results.md; (2) Summarize existing task.md for the user to continue working on it | [P4a.md](responses/pr_transitions/P4a.md) |
| P4b | PR_APPLIED_PENDING_ARCHIVE_A | Accio | review-task-results.md exists AND task.md doesn't exist | ACHIEVE_TASK_DRAFTING | (1) Load review-task-results.md content into memory; (2) Archive review files to pr-reviews/pr-review-<date>/; (3) Create new task.md template; (4) Update state to ACHIEVE_TASK_DRAFTING | (1) Update plan.md with a summary of changes made based on review-task-results.md; (2) Create a new task.md focused on the next acceptance criterion: (a) Review plan.md to identify the next acceptance criterion to work on; (b) Create a clearly defined task that can be completed in one session; (c) Focus on the smallest complete unit of work that delivers value | [P4b.md](responses/pr_transitions/P4b.md) |


#### Starting PR Review (Reparo) Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| A5a | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE, ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING | Reparo | No PR review in progress | PR_GATHERING_COMMENTS_A | (1) Create `.ai/task/comments.md` empty file; (2) Update state to PR_GATHERING_COMMENTS_A | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) If no PR exists for the current branch or no comments found, explicitly document this in comments.md; (5) Format and write comments to comments.md. 'No PR review in progress' means there are no existing PR review files (comments.md or review-task.md) in the workspace, allowing us to start a fresh PR review. | [A5a.md](responses/reparo_transitions/A5a.md) |
| A5b | ERROR_COMMENTS_MISSING_[G/A], ERROR_REVIEW_TASK_MISSING_[G/A] | Reparo | No PR review in progress | PR_GATHERING_COMMENTS_[G/A] | (1) Create `.ai/task/comments.md` empty file; (2) Update state to PR_GATHERING_COMMENTS_[G/A] | (1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch; (4) If no PR exists for the current branch or no comments found, explicitly document this in comments.md; (5) Format and write comments to comments.md. 'No PR review in progress' means there are no existing PR review files (comments.md or review-task.md) in the workspace, allowing us to start a fresh PR review. | [A5b.md](responses/reparo_transitions/A5b.md) |
| PR1 | GATHER_NEEDS_PLAN, GATHER_EDITING | Reparo | PR review in progress (comments.md exists) | PR_CONFIRM_RESTART_COMMENTS_G | (1) Update state to PR_CONFIRM_RESTART_COMMENTS_G | Ask user to confirm reset. This will potentially overwrite the existing comments.md file which contains PR comments that are being reviewed. Confirm only if you want to restart the PR review process with fresh comments. | [PR1.md](responses/reparo_transitions/PR1.md) |
| PR2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reparo | PR review in progress (comments.md exists) | PR_CONFIRM_RESTART_COMMENTS_A | (1) Update state to PR_CONFIRM_RESTART_COMMENTS_A | Ask user to confirm reset. This will potentially overwrite the existing comments.md file which contains PR comments that are being reviewed. Confirm only if you want to restart the PR review process with fresh comments. | [PR2.md](responses/reparo_transitions/PR2.md) |
| PR3 | GATHER_NEEDS_PLAN, GATHER_EDITING | Reparo | PR review task in progress (review-task.md exists) | PR_CONFIRM_RESTART_TASK_G | (1) Update state to PR_CONFIRM_RESTART_TASK_G | Ask user to confirm reset. This will potentially discard the current review-task.md file which contains the specific tasks to be performed to address PR comments. Confirm only if you want to restart the review process from gathering comments. | [PR3.md](responses/reparo_transitions/PR3.md) |
| PR4 | ACHIEVE_TASK_DRAFTING, ACHIEVE_TASK_EXECUTED, ACHIEVE_COMPLETE | Reparo | PR review task in progress (review-task.md exists) | PR_CONFIRM_RESTART_TASK_A | (1) Update state to PR_CONFIRM_RESTART_TASK_A | Ask user to confirm reset. This will potentially discard the current review-task.md file which contains the specific tasks to be performed to address PR comments. Confirm only if you want to restart the review process from gathering comments. | [PR4.md](responses/reparo_transitions/PR4.md) |

#### PR Review Confirmation Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| C1 | PR_CONFIRM_RESTART_COMMENTS_[G/A] | Reparo | - | PR_GATHERING_COMMENTS_[G/A] | (1) Delete existing comments.md; (2) Create new comments.md; (3) Update state to PR_GATHERING_COMMENTS_[G/A] | Gather PR comments from GitHub | [C1.md](responses/pr_confirm/C1.md) |
| C2 | PR_CONFIRM_RESTART_TASK_[G/A] | Reparo | - | PR_GATHERING_COMMENTS_[G/A] | (1) Delete existing review files; (2) Create new comments.md; (3) Update state to PR_GATHERING_COMMENTS_[G/A] | Gather PR comments from GitHub | [C2.md](responses/pr_confirm/C2.md) |
| C3a | PR_CONFIRM_RESTART_COMMENTS_[G/A] | Accio | comments.md exists | PR_GATHERING_COMMENTS_[G/A] | Update state to PR_GATHERING_COMMENTS_[G/A] | Continue using existing comments file without resetting. This cancels the restart operation and continues the PR review with the existing comments file. | [C3a.md](responses/pr_confirm/C3a.md) |
| C3b | PR_CONFIRM_RESTART_COMMENTS_[G/A] | Accio | comments.md missing | ERROR_COMMENTS_MISSING_[G/A] | Update state to ERROR_COMMENTS_MISSING_[G/A] | Explain: "Comments file is missing. Use Accio to recreate it and gather comments." | [C3b.md](responses/pr_confirm/C3b.md) |
| C3c | PR_CONFIRM_RESTART_TASK_[G/A] | Accio | review-task.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | Update state to PR_REVIEW_TASK_DRAFT_[G/A] | Continue using existing review task without resetting. This cancels the restart operation and continues the PR review with the existing review task file. | [C3c.md](responses/pr_confirm/C3c.md) |
| C3d | PR_CONFIRM_RESTART_TASK_[G/A] | Accio | review-task.md missing | ERROR_REVIEW_TASK_MISSING_[G/A] | Update state to ERROR_REVIEW_TASK_MISSING_[G/A] | Explain: "Review task file is missing. Use Accio to create a new review task based on the PR comments. Alternatively, if you want to restart the PR review process from the beginning, use Reverto to cancel the current review." | [C3d.md](responses/pr_confirm/C3d.md) |


#### Error State Recovery Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| R1 | ERROR_TASK_MISSING | Accio | - | ACHIEVE_TASK_DRAFTING | (1) Create new task.md template; (2) Update state to ACHIEVE_TASK_DRAFTING | Propose a task based on plan.md | [R1.md](responses/error_recovery/R1.md) |
| R2 | ERROR_TASK_RESULTS_MISSING | Accio | task-results.md exists | ACHIEVE_TASK_DRAFTING | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/` folder (passed to AI as [ARCHIVE_PATH_PLACEHOLDER]); (3) Load task-results.md content; (4) Create new task.md template; (5) Update state to ACHIEVE_TASK_DRAFTING | (1) Update plan.md with results and mark completed ACs; (2) Fill template with next task | [R2.md](responses/error_recovery/R2.md) |
| R3 | ERROR_TASK_RESULTS_MISSING | Accio | task-results.md missing | ACHIEVE_TASK_DRAFTING | (1) Archive task.md to `.ai/task/incomplete-task/` folder (passed to AI as [INCOMPLETE_ARCHIVE_PATH_PLACEHOLDER]); (2) Create new task.md template; (3) Load plan.md content; (4) Update state to ACHIEVE_TASK_DRAFTING | (1) Review plan, identify uncompleted ACs, fill out template; (2) Explain to user that incomplete task was archived | [R3.md](responses/error_recovery/R3.md) |
| R4 | ERROR_PLAN_MISSING | Accio | - | GATHER_NEEDS_PLAN | (1) Create new plan.md template; (2) Update state to GATHER_NEEDS_PLAN | Guide user through creating a new plan | [R4.md](responses/error_recovery/R4.md) |
| R5a | ERROR_COMMENTS_MISSING_G | Accio | - | PR_GATHERING_COMMENTS_G | (1) Create empty comments.md; (2) Update state to PR_GATHERING_COMMENTS_G | Gather comments using GitHub MCP | [R5a.md](responses/error_recovery/R5a.md) |
| R5b | ERROR_COMMENTS_MISSING_A | Accio | - | PR_GATHERING_COMMENTS_A | (1) Create empty comments.md; (2) Update state to PR_GATHERING_COMMENTS_A | Gather comments using GitHub MCP | [R5b.md](responses/error_recovery/R5b.md) |
| R6a | ERROR_REVIEW_TASK_MISSING_[G/A] | Accio | comments.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | (1) Create new review-task.md template; (2) Update state to PR_REVIEW_TASK_DRAFT_[G/A] | Fill out review task template based on comments.md | [R6a.md](responses/error_recovery/R6a.md) |
| R7a | ERROR_REVIEW_TASK_MISSING_[G/A] | Accio | comments.md missing | ERROR_COMMENTS_MISSING_[G/A] | (1) Update state to ERROR_COMMENTS_MISSING_[G/A] | Explain: "Cannot create review task because comments.md is also missing. Use Accio to recreate comments.md first." | [R7a.md](responses/error_recovery/R7a.md) |
| R8a | ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Accio | review-task.md exists | PR_REVIEW_TASK_DRAFT_[G/A] | (1) Update state to PR_REVIEW_TASK_DRAFT_[G/A] | Re-execute the review task from review-task.md | [R8a.md](responses/error_recovery/R8a.md) |

#### Error State Other Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| ER1 | ERROR_PLAN_MISSING | Finite | - | [BLOCKED] | No state change | Explain: "No plan to return to, must Accio to create one first." | |
| ER2 | ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Finite | - | [BLOCKED] | No state change | Explain: "Use Accio to recreate the review task first." | |
| ER3 | ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A], PR_APPLIED_PENDING_ARCHIVE_[G/A] | Reparo | - | [BLOCKED] | No state change | Explain: "Cannot start PR review until current task is completed. Use Accio first." | |
| ER4 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_PLAN_MISSING, ERROR_COMMENTS_MISSING_[G/A], ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Reverto | - | [BLOCKED] | No state change | Explain: "Reverto is only available in PR review states. Resolve the current error first with Accio or Finite." | |
| ER5 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING_[G/A] | Finite | - | [BLOCKED] | No state change | Explain: "You should not return to plan editing until the current error is resolved. Use Accio to fix the missing file issue first." | |
| ER6 | ERROR_TASK_MISSING, ERROR_TASK_RESULTS_MISSING, ERROR_COMMENTS_MISSING_[G/A] | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Resolve the current error first with Accio or Finite." | |
| ER7 | ERROR_PLAN_MISSING, PR_APPLIED_PENDING_ARCHIVE | Expecto | - | [BLOCKED] | No state change | Explain: "Cannot run Expecto in the current state. Resolve the current issue with Accio first." | |
| ER8 | ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A] | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Resolve the current error first with Accio." | |

#### Finite Transitions (Universal Return to Plan)

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| F1 | Any state except ACHIEVE_TASK_EXECUTED, ACHIEVE_TASK_DRAFTING, ACHIEVE_COMPLETE, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING_[G/A], ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A], PR_APPLIED_PENDING_ARCHIVE_[G/A], PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A], PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] | Finite | - | GATHER_EDITING | Update state to GATHER_EDITING | Resume plan editing | |
| F2 | ACHIEVE_TASK_DRAFTING, ACHIEVE_COMPLETE | Finite | - | GATHER_EDITING | Update state to GATHER_EDITING | Resume plan editing with relevant context: for ACHIEVE_TASK_DRAFTING, the drafted task will be preserved; for ACHIEVE_COMPLETE, you will return to plan editing with all acceptance criteria completed. | |

#### Blocked Finite Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| F3 | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Finite | - | [BLOCKED] | No state change | Explain: "Must Accio to archive current review results first." | |

#### Reverto Transitions (Exit PR Review)
| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| V1 | PR_GATHERING_COMMENTS_G, PR_REVIEW_TASK_DRAFT_G, PR_CONFIRM_RESTART_COMMENTS_G, PR_CONFIRM_RESTART_TASK_G | Reverto | - | GATHER_EDITING | Update state to GATHER_EDITING | Return to plan editing | |
| V2 | PR_GATHERING_COMMENTS_A, PR_REVIEW_TASK_DRAFT_A, PR_CONFIRM_RESTART_COMMENTS_A, PR_CONFIRM_RESTART_TASK_A | Reverto | - | ACHIEVE_TASK_DRAFTING | Update state to ACHIEVE_TASK_DRAFTING | Return to task drafting | |

#### PR Review Phase Blocked Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| PB1 | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Reverto | - | [BLOCKED] | No state change | Tell user they must first Accio to archive current review results | |
| PB2 | PR_GATHERING_COMMENTS_[G/A] | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Reverto to exit PR flow first." | |
| PB2b | PR_REVIEW_TASK_DRAFT_[G/A] | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Reverto to exit PR flow first." | |
| PB2d | PR_APPLIED_PENDING_ARCHIVE_[G/A] | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Accio to archive current review results first." | |
| PB3 | PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] | Finite | - | [BLOCKED] | No state change | Tell user they must first complete the PR review flow with Accio or exit with Reverto | |
| PB4 | PR_GATHERING_COMMENTS_[G/A], PR_REVIEW_TASK_DRAFT_[G/A] | Reparo | - | [BLOCKED] | No state change | Tell user they must complete the current PR review process or use Reverto to cancel it | |
| PB5 | PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] | Finite | - | [BLOCKED] | No state change | Tell user they must first confirm or cancel the restart operation using Reparo or Reverto | |
| PB6 | PR_CONFIRM_RESTART_COMMENTS_[G/A], PR_CONFIRM_RESTART_TASK_[G/A] | Expecto | - | [BLOCKED] | No state change | Explain: "Expecto is only allowed in GATHER states. Use Reverto to cancel or Reparo to confirm, then Finite to return to plan editing." | |


#### Universal Lumos Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| L1 | Any state | Lumos | - | Same state | (1) Read state.json; (2) Determine valid actions | Display current state and valid actions for the current state | |

#### Universal Expecto Transitions

| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |
|----|---------------|---------|-----------|------------|--------|-------------|----------|
| E1 | GATHER_NEEDS_PLAN | Expecto | Atlassian URLs found | GATHER_NEEDS_PLAN | (1) Extract Atlassian URLs from plan.md; (2) Fetch content via Atlassian MCP; (3) Save content to .ai/task/atlassian/<ID>.md; (4) Update plan.md with references | Enrich plan with Jira/Confluence content | |
| E2 | GATHER_EDITING | Expecto | Atlassian URLs found | GATHER_EDITING | (1) Extract Atlassian URLs from plan.md; (2) Fetch content via Atlassian MCP; (3) Save content to .ai/task/atlassian/<ID>.md; (4) Update plan.md with references | Enrich plan with Jira/Confluence content | |


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

### State Persistence

All state is persisted in `.ai/task/state.json` with the following structure: 

```json
{
  "current_state": "GATHER_EDITING",
  "context": {

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
Context is only populated for states that need additional info.