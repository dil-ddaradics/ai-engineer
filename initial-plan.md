# MCP Workflow Orchestrator — Product Plan (v0.1)

> A files-first MCP that **teaches and enforces good AI engineering** by guiding a developer through a strict, step-by-step workflow; it orchestrates other agents/tools, persists everything locally, and keeps humans in the loop.

---

## Vision

### Elevator Pitch

A **files-first MCP orchestrator** that turns good AI engineering into a **guided, repeatable workflow**. It exposes **spell-named tools**—`accio`, `expecto`, `reparo`, `finite`, `lumos`—so chat spells map 1:1 to MCP tools. `accio` \*\*reveals only the next step\*\*, tells the Coding Agent exactly what to do now, and tells the user what to expect or provide—keeping focus tight and progress safe.

### The Workflow It Facilitates

**1) Gather Acceptance Criteria**

- Start a plain-language **plan** in `.ai/task/plan.md` and guide the user to write crisp, testable acceptance criteria.
- If the plan references Jira/Confluence, ask the AI to fetch and summarize those via the Atlassian MCP and append learnings to the plan.
- Iterate with the user; when ready, the user types **“Accio”** to advance.

**2)** **Achieve Acceptance Criteria**

- **On entry, check remaining Acceptance Criteria:** The MCP instructs the AI to inspect `plan.md` and determine whether any criteria remain achievable now. If **none remain**, tell the user the task set is complete and suggest either **“Finite”** (return to Gather Acceptance Criteria to add more) or **“Reparo”** (gather PR comments). If criteria remain, continue below.
- Propose the **next smallest, single-focus task** that clearly moves toward the remaining criteria.
- Create `.ai/task/task.md` describing intent, steps, and how we’ll validate the result.
- **Iterate the task description with the user**; when the user types **“Accio”**, the MCP instructs the Coding Agent to perform exactly what’s in `task.md`.
- The Coding Agent applies the changes and writes `.ai/task/task-results.md` capturing: what was **achieved**, what was **learned**, and any **errors it could not solve**. It also enumerates **which Acceptance Criteria appear satisfied** by this task.
- The developer can continue the discussion with the AI Agent, and the AI Agent may append clarifications or notes into `task-results.md` when appropriate.
- When the user types **“Accio”** again, the MCP **archives** `.ai/task/task.md` and `.ai/task/task-results.md` under `.ai/task/tasks/task-<task_name>-<DATE>/`, **marks** the corresponding items in `plan.md` as done based on `task-results.md`, and then **offers the next task** (loop). If no criteria remain after marking, inform the user that the workstream is complete and propose **“Finite”** or **“Reparo”** as next actions.

**3) Handle PR Reviews**

- At any time, the user can type **“Reparo”** to start or resume a PR review. The MCP collects PR comments into `.ai/task/comments.md`.
- The agent and user iterate in chat. On **Accio**, the MCP proposes a `review-task.md` that addresses all comments; on the next **Accio**, the agent applies it and writes `review-task-results.md`. Another **Accio** returns to the previous state and **archives** `comments.md`, `review-task.md`, and `review-task-results.md` into `.ai/task/pr-reviews/pr-review-(<DATE>)/` for auditing.
- If comments imply a scope change, the user can type **“Finite”** to route back to **Gather Acceptance Criteria** to refine the plan.

### How It Keeps the Agent Focused

- **One step at a time:** `accio` returns only the **next action**, not a checklist of future work.
- **Explicit triggers ("Accio", "Reparo", "Finite", "Lumos"):** Typing `Accio` is the **only** way to advance the workflow; the AI must treat it as _call the MCP ****\*\*****\*\*\*\*****\*\*****\`\`****\*\*****\*\*\*\*****\*\***** tool now_. Typing `Reparo` tells the AI to gather PR comments via the MCP. Typing `Finite` routes the workflow back to **Gather Acceptance Criteria** (from either **Achieve Acceptance Criteria** or **Handle PR Reviews**). Optionally allow `Accio: <note>` / `Reparo: <note>` / `Finite: <note>` to pass a brief reason to the tool.
- **Dual outputs every time:** a concise **message to the user** and a concrete **instruction set for the Coding Agent**.
- **Files as truth:** the current plan/task/todos in `.ai/task/` are the **single source of truth** the agent follows.
- **No leap-frogging:** Progress occurs only after the current artifact is complete **and** the user triggers `Accio`. Free-form words like “continue” inside conversation or documents **never** change workflow state.

---

## Roles & Interaction Script (Swimlane-style)

**Legend** — Spells:

- **Accio**: advance one step via MCP (`accio`).
- **Expecto**: enrich the plan from Jira/Confluence (only during **Gather Acceptance Criteria**) (MCP `expecto`).
- **Reparo**: gather PR comments (MCP `reparo`).
- **Reverto**: exit PR review and return to previous state (MCP `reverto`).
- **Finite**: return to **Gather Acceptance Criteria** (MCP `finite`).
- **Lumos**: show current state (MCP `lumos`).

**Actors**

- **Developer** (human)
- **AI Agent** (coding assistant)
- **MCP Orchestrator** (this MCP)

## State Machine

This workflow is implemented as a strict state machine where transitions occur only in response to specific triggers ("spells"). The system maintains its state in `.ai/task/state.json` and uses file presence/absence as supporting indicators of the current state.

### States

1. **GATHER_NEEDS_PLAN**
   - _Description_: Initial state; no plan exists yet
   - _Indicators_: `.ai/task/plan.md` does not exist
   - _Valid Actions_: Accio, Expecto, Lumos

2. **GATHER_EDITING**
   - _Description_: Plan file exists and is being edited
   - _Indicators_: `.ai/task/plan.md` exists
   - _Valid Actions_: Accio, Expecto, Lumos, Reparo, Finite (no-op)

3. **ACHIEVE_TASK_DRAFTING**
   - _Description_: Task is being created/refined but not yet executed
   - _Indicators_: `.ai/task/task.md` exists; `.ai/task/task-results.md` doesn't exist
   - _Valid Actions_: Accio, Finite, Reparo, Lumos

4. **ACHIEVE_TASK_EXECUTED**
   - _Description_: Task has been executed; results ready for review
   - _Indicators_: `.ai/task/task-results.md` exists
   - _Valid Actions_: Accio, Reparo, Lumos

5. **ACHIEVE_COMPLETE**
   - _Description_: All acceptance criteria have been met
   - _Indicators_: No unchecked acceptance criteria in `.ai/task/plan.md`
   - _Valid Actions_: Finite, Reparo, Lumos

6. **PR_GATHERING_COMMENTS**
   - _Description_: PR review comments have been collected
   - _Indicators_: `.ai/task/comments.md` exists; `.ai/task/review-task.md` doesn't exist
   - _Valid Actions_: Accio, Finite, Reverto, Lumos

7. **PR_REVIEW_TASK_DRAFT**
   - _Description_: Review task is being created/refined
   - _Indicators_: `.ai/task/review-task.md` exists; `.ai/task/review-task-results.md` doesn't exist
   - _Valid Actions_: Accio, Finite, Reverto, Lumos

8. **PR_APPLIED_PENDING_ARCHIVE**
   - _Description_: Review task has been applied; results ready for archiving
   - _Indicators_: `.ai/task/review-task-results.md` exists
   - _Valid Actions_: Accio, Finite, Lumos

9. **PR_CONFIRM_RESTART_COMMENTS**

- _Description_: User requested Reparo while comments.md exists
- _Indicators_: `.ai/task/comments.md` exists and state.json marks confirm needed
- _Valid Actions_: Reparo (confirm), Lumos, Accio (cancel), Reverto

11. **PR_CONFIRM_RESTART_TASK**

- _Description_: User requested Reparo while review-task.md exists
- _Indicators_: `.ai/task/review-task.md` exists and state.json marks confirm needed
- _Valid Actions_: Reparo (confirm), Lumos, Accio (cancel), Reverto

12. **ERROR_TASK_MISSING**

- _Description_: In ACHIEVE_TASK_DRAFTING state, but task.md is missing
- _Indicators_: state.json shows ACHIEVE_TASK_DRAFTING but task.md doesn't exist
- _Valid Actions_: Accio, Finite, Lumos

13. **ERROR_TASK_RESULTS_MISSING**

- _Description_: In ACHIEVE_TASK_EXECUTED state, but task-results.md is missing
- _Indicators_: state.json shows ACHIEVE_TASK_EXECUTED but task-results.md doesn't exist
- _Valid Actions_: Accio, Finite, Lumos

14. **ERROR_PLAN_MISSING**

- _Description_: Any state except GATHER_NEEDS_PLAN requires plan.md but it's missing
- _Indicators_: Any state except GATHER_NEEDS_PLAN but plan.md doesn't exist
- _Valid Actions_: Accio, Lumos

15. **ERROR_COMMENTS_MISSING**

- _Description_: In PR_GATHERING_COMMENTS state, but comments.md is missing
- _Indicators_: state.json shows PR_GATHERING_COMMENTS but comments.md doesn't exist
- _Valid Actions_: Accio, Finite, Lumos

16. **ERROR_REVIEW_TASK_MISSING**

- _Description_: In PR_REVIEW_TASK_DRAFT state, but review-task.md is missing
- _Indicators_: state.json shows PR_REVIEW_TASK_DRAFT but review-task.md doesn't exist
- _Valid Actions_: Accio, Lumos

### Transition Rules

#### Gather Acceptance Criteria Phase Transitions

| ID  | Current State     | Trigger | Condition                                                     | Next State            | Actions                                                                                                                                                                                                                                     |
| --- | ----------------- | ------- | ------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | GATHER_NEEDS_PLAN | Accio   | -                                                             | GATHER_EDITING        | (1) Create `.ai/task/plan.md` from template; (2) Instruct AI to guide user in filling out sections, especially ACs                                                                                                                          |
| G2  | GATHER_EDITING    | Accio   | ≥1 AC in plan.md AND task.md doesn't exist AND plan.md exists | ACHIEVE_TASK_DRAFTING | (1) Create `.ai/task/task.md` template with YAML frontmatter; (2) Instruct AI to propose next smallest task toward ACs                                                                                                                      |
| G2b | GATHER_EDITING    | Accio   | plan.md missing                                               | ERROR_PLAN_MISSING    | (1) Update state to ERROR_PLAN_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Plan file is missing. Use Accio to reset and create a new plan."                                             |
| G3  | GATHER_EDITING    | Accio   | No AC in plan.md AND plan.md exists                           | GATHER_EDITING        | Instruct AI to prompt user to add at least one Acceptance Criterion to plan.md                                                                                                                                                              |
| G4  | GATHER_EDITING    | Accio   | task.md exists AND plan.md exists                             | ACHIEVE_TASK_DRAFTING | (1) Update state to ACHIEVE_TASK_DRAFTING; (2) Load task.md content into memory; (3) Include full task.md content in the instructions to the AI; (4) Instruct AI to summarize the task.md content and tell the user to continue drafting it |

#### Achieve Acceptance Criteria Phase Transitions

| ID  | Current State         | Trigger | Condition                                                    | Next State                 | Actions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | --------------------- | ------- | ------------------------------------------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | ACHIEVE_TASK_DRAFTING | Accio   | task.md exists AND plan.md exists                            | ACHIEVE_TASK_EXECUTED      | (1) Instruct AI to execute task in task.md; (2) Instruct AI to document results in task-results.md                                                                                                                                                                                                                                                                                                                                                                                                  |
| A1b | ACHIEVE_TASK_DRAFTING | Accio   | task.md missing                                              | ERROR_TASK_MISSING         | (1) Update state to ERROR_TASK_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain error: "Task file is missing. Use Accio to create a new task or Finite to return to plan editing."                                                                                                                                                                                                                                                                     |
| A1c | ACHIEVE_TASK_DRAFTING | Accio   | plan.md missing                                              | ERROR_PLAN_MISSING         | (1) Update state to ERROR_PLAN_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Plan file is missing. Use Accio to reset and create a new plan."                                                                                                                                                                                                                                                                                                     |
| A2  | ACHIEVE_TASK_EXECUTED | Accio   | task.md exists AND task-results.md exists AND plan.md exists | ACHIEVE_TASK_DRAFTING      | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to `.ai/task/tasks/task-${task_name}-${date}/`; (3) Load task-results.md content into memory; (4) Include full task-results.md content in the instructions to the AI; (5) Instruct AI to update plan.md with results and mark completed ACs; (6) Create new task.md template with YAML frontmatter; (7) Instruct AI to fill template with next task toward remaining ACs or note if all ACs appear complete |
| A2b | ACHIEVE_TASK_EXECUTED | Accio   | task-results.md missing                                      | ERROR_TASK_RESULTS_MISSING | (1) Update state to ERROR_TASK_RESULTS_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Task results file is missing. Please ask the AI to recreate task-results.md based on the current git diff."                                                                                                                                                                                                                                                  |
| A2c | ACHIEVE_TASK_EXECUTED | Accio   | plan.md missing                                              | ERROR_PLAN_MISSING         | (1) Update state to ERROR_PLAN_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Plan file is missing. Use Accio to reset and create a new plan."                                                                                                                                                                                                                                                                                                     |
| A3  | ACHIEVE_TASK_DRAFTING | Accio   | No unchecked AC in plan.md AND plan.md exists                | ACHIEVE_COMPLETE           | (1) Check plan.md for remaining unchecked ACs; (2) Update state to ACHIEVE_COMPLETE; (3) Instruct AI to inform user all ACs are complete and suggest Finite (to add more ACs) or Reparo (for PR reviews)                                                                                                                                                                                                                                                                                            |
| A3b | ACHIEVE_TASK_DRAFTING | Accio   | plan.md missing                                              | ERROR_PLAN_MISSING         | (1) Update state to ERROR_PLAN_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Plan file is missing. Use Accio to reset and create a new plan."                                                                                                                                                                                                                                                                                                     |
| A6  | ACHIEVE_TASK_EXECUTED | Finite  | -                                                            | [BLOCKED]                  | Block transition, instruct AI to tell user they must complete task integration with Accio first                                                                                                                                                                                                                                                                                                                                                                                                     |

#### PR Review Phase Transitions

| ID  | Current State              | Trigger | Condition                                   | Next State                 | Actions                                                                                                                                                                                                                    |
| --- | -------------------------- | ------- | ------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | PR_GATHERING_COMMENTS      | Accio   | comments.md exists                          | PR_REVIEW_TASK_DRAFT       | (1) Create `.ai/task/review-task.md` template; (2) Instruct AI to propose review tasks covering all comments                                                                                                               |
| P1b | PR_GATHERING_COMMENTS      | Accio   | comments.md missing                         | ERROR_COMMENTS_MISSING     | (1) Update state to ERROR_COMMENTS_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Comments file is missing. Use Accio to recreate it and gather comments."                |
| P2  | PR_REVIEW_TASK_DRAFT       | Accio   | review-task.md exists                       | PR_APPLIED_PENDING_ARCHIVE | (1) Instruct AI to apply review tasks from review-task.md; (2) Instruct AI to document results in review-task-results.md                                                                                                   |
| P2b | PR_REVIEW_TASK_DRAFT       | Accio   | review-task.md missing                      | ERROR_REVIEW_TASK_MISSING  | (1) Update state to ERROR_REVIEW_TASK_MISSING; (2) Store original state in context.error_original_state; (3) Instruct AI to explain: "Review task file is missing. Use Accio to create a new review task."                 |
| P3  | PR_APPLIED_PENDING_ARCHIVE | Accio   | context.pr_return_state starts with GATHER  | GATHER_EDITING             | (1) Archive review files to pr-reviews/pr-review-<date>/; (2) Update state to GATHER_EDITING; (3) Clear context.pr_return_state; (4) Instruct AI to resume plan editing                                                    |
| P4  | PR_APPLIED_PENDING_ARCHIVE | Accio   | context.pr_return_state starts with ACHIEVE | ACHIEVE_TASK_DRAFTING      | (1) Archive review files to pr-reviews/pr-review-<date>/; (2) Update state to ACHIEVE_TASK_DRAFTING; (3) Clear context.pr_return_state; (4) If task.md exists, instruct AI to resume with it, otherwise create new task.md |

#### Starting PR Review (Reparo) Transitions

| ID  | Current State                                                                                                     | Trigger | Condition                                          | Next State                  | Actions                                                                                                                                                                                                                                                                                                                            |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | Any state except ACHIEVE_TASK_EXECUTED, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING, PR_APPLIED_PENDING_ARCHIVE | Reparo  | No PR review in progress                           | PR_GATHERING_COMMENTS       | (1) Create `.ai/task/comments.md` empty file; (2) Store current state in context.pr_return_state; (3) Instruct AI to: (a) Check if GitHub MCP is available; (b) If not available, guide user through setup; (c) If available, use GitHub MCP to fetch PR comments for current branch; (d) Format and write comments to comments.md |
| R2  | Any                                                                                                               | Reparo  | PR review in progress (comments.md exists)         | PR_CONFIRM_RESTART_COMMENTS | (1) Update state to PR_CONFIRM_RESTART_COMMENTS; (2) Store current state in context.pr_return_state; (3) Instruct AI to ask user to confirm reset                                                                                                                                                                                  |
| R3  | Any                                                                                                               | Reparo  | PR review task in progress (review-task.md exists) | PR_CONFIRM_RESTART_TASK     | (1) Update state to PR_CONFIRM_RESTART_TASK; (2) Store current state in context.pr_return_state; (3) Instruct AI to ask user to confirm reset                                                                                                                                                                                      |
| R4  | PR_APPLIED_PENDING_ARCHIVE                                                                                        | Reparo  | -                                                  | [BLOCKED]                   | Block transition, instruct AI to tell user they must first Accio to archive current review results                                                                                                                                                                                                                                 |

#### PR Review Confirmation Transitions

| ID  | Current State               | Trigger | Condition | Next State            | Actions                                                                                                                                                            |
| --- | --------------------------- | ------- | --------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | PR_CONFIRM_RESTART_COMMENTS | Reparo  | -         | PR_GATHERING_COMMENTS | (1) Delete existing comments.md; (2) Create new comments.md; (3) Update state to PR_GATHERING_COMMENTS; (4) Instruct AI to gather PR comments from GitHub          |
| C2  | PR_CONFIRM_RESTART_COMMENTS | Accio   | -         | Previous state        | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state; (4) Instruct AI to resume previous context |
| C3  | PR_CONFIRM_RESTART_TASK     | Reparo  | -         | PR_GATHERING_COMMENTS | (1) Delete existing review files; (2) Create new comments.md; (3) Update state to PR_GATHERING_COMMENTS; (4) Instruct AI to gather PR comments from GitHub         |
| C4  | PR_CONFIRM_RESTART_TASK     | Accio   | -         | Previous state        | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state; (4) Instruct AI to resume previous context |

#### Error State Recovery Transitions

| ID  | Current State              | Trigger | Condition               | Next State             | Actions                                                                                                                                                                                                                                                                                               |
| --- | -------------------------- | ------- | ----------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | ERROR_TASK_MISSING         | Accio   | -                       | ACHIEVE_TASK_DRAFTING  | (1) Create new task.md template; (2) Instruct AI to propose a task based on plan.md; (3) Transition back to ACHIEVE_TASK_DRAFTING                                                                                                                                                                     |
| R2  | ERROR_TASK_RESULTS_MISSING | Accio   | task-results.md exists  | ACHIEVE_TASK_DRAFTING  | (1) Extract task_name from task.md frontmatter; (2) Archive task.md and task-results.md to proper location; (3) Load task-results.md content; (4) Instruct AI to update plan.md with results and mark completed ACs; (5) Create new task.md template; (6) Instruct AI to fill template with next task |
| R3  | ERROR_TASK_RESULTS_MISSING | Accio   | task-results.md missing | ACHIEVE_TASK_DRAFTING  | (1) Archive task.md to incomplete-task folder; (2) Create new task.md; (3) Load plan.md content; (4) Instruct AI to review plan, identify uncompleted ACs, propose next task; (5) Explain to user that incomplete task was archived                                                                   |
| R4  | ERROR_PLAN_MISSING         | Accio   | -                       | GATHER_NEEDS_PLAN      | (1) Create new plan.md template; (2) Reset to GATHER_NEEDS_PLAN state; (3) Instruct AI to guide user through creating a new plan                                                                                                                                                                      |
| R5  | ERROR_COMMENTS_MISSING     | Accio   | -                       | PR_GATHERING_COMMENTS  | (1) Create empty comments.md; (2) Instruct AI to gather comments using GitHub MCP; (3) Transition back to PR_GATHERING_COMMENTS                                                                                                                                                                       |
| R6  | ERROR_REVIEW_TASK_MISSING  | Accio   | comments.md exists      | PR_REVIEW_TASK_DRAFT   | (1) Create new review-task.md template; (2) Instruct AI to recreate review task based on comments.md; (3) Transition back to PR_REVIEW_TASK_DRAFT                                                                                                                                                     |
| R7  | ERROR_REVIEW_TASK_MISSING  | Accio   | comments.md missing     | ERROR_COMMENTS_MISSING | (1) Update state to ERROR_COMMENTS_MISSING; (2) Instruct AI to explain: "Cannot create review task because comments.md is also missing. Use Accio to recreate comments.md first."                                                                                                                     |

#### Finite Transitions (Universal Return to Plan)

| ID  | Current State                                                                                                     | Trigger | Condition | Next State     | Actions                                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------- | ------- | --------- | -------------- | -------------------------------------------------------------------------- |
| F1  | Any state except ACHIEVE_TASK_EXECUTED, ERROR_PLAN_MISSING, ERROR_REVIEW_TASK_MISSING, PR_APPLIED_PENDING_ARCHIVE | Finite  | -         | GATHER_EDITING | (1) Update state to GATHER_EDITING; (2) Instruct AI to resume plan editing |

**Blocked Finite States (where Finite is not available):**

- ACHIEVE_TASK_EXECUTED: Must Accio first to integrate results before returning to planning
- ERROR_PLAN_MISSING: No plan to return to, must Accio to create one first
- ERROR_REVIEW_TASK_MISSING: Must Accio to create review task first
- PR_APPLIED_PENDING_ARCHIVE: Must Accio to archive current review results first

#### Reverto Transitions (Exit PR Review)

| ID  | Current State               | Trigger | Condition | Next State     | Actions                                                                                                                                                            |
| --- | --------------------------- | ------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| V1  | PR_GATHERING_COMMENTS       | Reverto | -         | Previous state | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state; (4) Instruct AI to resume previous context |
| V2  | PR_REVIEW_TASK_DRAFT        | Reverto | -         | Previous state | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state; (4) Instruct AI to resume previous context |
| V3  | PR_CONFIRM_RESTART_COMMENTS | Reverto | -         | Previous state | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state; (4) Instruct AI to resume previous context |
| V4  | PR_CONFIRM_RESTART_TASK     | Reverto | -         | Previous state | (1) Read context.pr_return_state; (2) Update state to context.pr_return_state value; (3) Clear context.pr_return_state; (4) Instruct AI to resume previous context |
| V5  | PR_APPLIED_PENDING_ARCHIVE  | Reverto | -         | [BLOCKED]      | Block transition, instruct AI to tell user they must first Accio to archive current review results                                                                 |

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
    "pr_return_state": "ACHIEVE_TASK_DRAFTING", // Only present during PR review flow
    "error_original_state": "ACHIEVE_TASK_DRAFTING" // Only present during error states
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

### Sequence: Gather Acceptance Criteria

1. **Developer**: Types **Accio** to ask for the next step.

2. **AI Agent → MCP**: Calls the `accio` tool (optional note: `Accio: <note>`).

3. **MCP**: Branches based on the presence of a plan file.
   - **Option A — No plan yet**: Create `.ai/task/plan.md` from a template (prefilled sections: _Context_, _Goals / Non-Goals_, _Acceptance Criteria_, _Constraints & Risks_, _References_). Return both:
     - **message_to_user:** "Fill out the plan. You can iterate in chat while the AI co-writes, or edit the file directly. When done, type **Accio** to move to _Achieve Acceptance Criteria_."
     - **instructions_to_coding_agent:** "Guide the user to write crisp ACs, help structure the sections, and keep edits scoped to `plan.md`. Do not make unrelated changes."

   - **Option B — Plan already exists**: Do **not** create anything. Return instructions for the AI to ask the user to expand/clarify `plan.md` where necessary. When ready, the user types **Accio** to proceed to _Achieve Acceptance Criteria_.

4. **AI Agent**: Follows the MCP’s instructions—co-writes in chat or reviews direct edits. When the user types **Accio**, **call the ******\*\*\*\*********\*\*********\*\*\*\*********`accio`********\*\*********\*\*\*\*********\*\********* tool** to transition from _Gather Acceptance Criteria_ to _Achieve Acceptance Criteria_ and run the phase-entry check (verify remaining criteria). Follows the MCP’s instructions—co-writes in chat or reviews direct edits. When the user types **Accio**, \*\*call the \`accio\` tool to transition from \***Gather Acceptance Criteria**\* to \*\*\***Achieve Acceptance Criteria\*\*\* and run the phase-entry check (verify remaining criteria).

### Sequence: Expecto (Atlassian enrichment during Gather Acceptance Criteria only)

**Purpose & Phase Constraint:** Expecto expands the plan by reading Jira/Confluence references and integrating their learnings into `plan.md`. Because it _modifies and extends the plan_, Expecto is **only allowed during Gather Acceptance Criteria**. If you’re in another phase and need to enrich the plan, type **Finite** to return to Gathering, then run **Expecto**.

0. **MCP (Stage Guard, on Expecto)**: Check the current workflow stage. If it is **not** _Gather Acceptance Criteria_, instruct the AI Agent to tell the user:

- "We are currently in **\<CURRENT_STATE>**, which is used to **\<STATE_PURPOSE>**."
- "Because **Expecto** expands the plan and is only allowed during **Gather Acceptance Criteria**, type **Finite** to switch back to the Gathering phase, then re-run **Expecto**." Then **stop**—do not proceed with enrichment until the user types **Finite** and re-invokes **Expecto** within _Gather Acceptance Criteria_.

1. **Developer**: Types **Expecto**.
2. **AI Agent → MCP**: Calls the `expecto` tool.
3. **MCP — deterministic parsing & outputs (no LLM):**
   - **Read plan:** Open `.ai/task/plan.md`. Extract Atlassian URLs via string/regex (no AI) from both the **References** section and anywhere else in the document. Treat them as a flat list of URLs.
   - **Idempotency filter:** Ensure `.ai/task/atlassian/refs` exists (newline-delimited). Compute `NEW_URLS = extracted - existing(refs)`. If `NEW_URLS` is empty, **return**:
     - **message_to_user:** "No new Atlassian links found in `plan.md`. Add Jira/Confluence URLs under _References_ or inline, then run **Expecto** again."
     - **instructions_to_coding_agent:** "Tell the user the above summary and remain in _Gather Acceptance Criteria_."
     - **Stop here.**

   - **Prepare the one-shot instruction for the AI Agent** (include the concrete list of `NEW_URLS`):

     ```text
     1) Check Atlassian MCP availability by calling mcp__atlassian__atlassianUserInfo() with no params.
        - If the function is missing ⇒ Atlassian MCP not installed/configured. Relay install/setup guidance (see Appendix) and stop.
        - If it returns an auth error ⇒ ask the user to authenticate per client instructions and stop.
        - If it returns user details ⇒ proceed.

     2) For each NEW URL provided below:
        - Fetch raw content via the Atlassian MCP.
        - Save the content to **.ai/task/atlassian/<SAFE_ID>.md** where `<SAFE_ID>` is a filesystem-safe slug or short hash derived from the URL.
        - Append the **URL** (exactly as given) as a new line to **.ai/task/atlassian/refs**.

     3) Update plan.md:
        - Ensure a **References** section exists; create it if missing.
        - Under **References**, append a bullet for each fetched item with a markdown link to the saved file:
          - `- [<SAFE_ID>](/.ai/task/atlassian/<SAFE_ID>.md)`
        - If new Acceptance Criteria are implied, append checklist items under **Acceptance Criteria** using `- [ ] ... (source: <SAFE_ID>)`.

     4) Summarize and stay in phase:
        - Tell the user how many links were processed.
        - Remain in **Gather Acceptance Criteria** awaiting further plan edits or the **Accio** trigger.

     NEW LINKS:
     - (The MCP will insert a concrete list here: one URL per line)
     ```

   - **Outputs from MCP:**
     - **message_to_user:** "Found **N** new Atlassian links. I’ve handed them to the Agent to fetch and link into `plan.md` (References section)."
     - **instructions_to_coding_agent:** the one‑shot block above (with the concrete `NEW_URLS` list embedded).

4. **AI Agent**: Executes the instructions (or relays install/auth steps), then summarizes to the user **what changed** (e.g., "added 2 learnings, proposed 1 new AC"), and asks them to **review** `plan.md`. Executes the instructions (or relays install steps), then summarizes to the user **what changed** (e.g., “added 2 learnings, proposed 1 new AC”), and asks them to \*\*review \*\*\`\`.
5. **Constraint**: If **Expecto** is invoked outside **Gather Acceptance Criteria**, the MCP responds that this spell is only available in that phase and advises typing **Finite** to return, or proceeding with **Accio** in the current phase.

### Sequence: Achieve Acceptance Criteria

1. **AI Agent → MCP**: Calls `accio` to enter this phase; **MCP** checks if any AC remain achievable now.
   - If **none** remain: **MCP** tells the Developer the workstream is complete; suggests **Finite** (add more ACs) or **Reparo** (PR comments).

2. **MCP**: If `.ai/task/task.md` already exists, **treat it as the current task** and proceed directly to iteration (step 3). Otherwise, propose the **next smallest, single-focus task** and create `.ai/task/task.md` (intent, steps, validation). **Add YAML frontmatter at the top with a kebab-case task name**, e.g.:

   ```yaml
   ---
   task_name: implement-sum-function
   # optional: created_at: 2025-08-20T11:30:00Z
   ---
   ```

3. **AI Agent ⇄ Developer**: **Iterate the task description** until clear.
4. **Developer**: Types **Accio** to authorize execution.
5. **AI Agent**: Performs the steps in `task.md`, making minimal, safe changes. Writes `.ai/task/task-results.md` capturing **achieved**, **learned**, **errors not solved**, and **which AC were satisfied**.
6. **Developer ⇄ AI Agent**: Continue clarifications in chat; the AI Agent may append relevant notes into `task-results.md` to ensure context is preserved.
7. **Developer → Accio (calls ********\*\***********\*\*\*\***********\*\***********``**)**: MCP **archives the task artifacts** by moving `.ai/task/task.md` and `.ai/task/task-results.md` into `.ai/task/tasks/task-<task_name>-<DATE>/` (e.g., `task-implement-sum-function-2025-08-20-1130/`), then **marks matching items in **``**********\*\***********\*\***********\*\*********** as done** (linking to the archived `task-results.md` where helpful) and **offers the next task**. If no AC remain, MCP declares completion and proposes **Reparo** or **Finite\*\*.

### Sequence: Handle PR Reviews (anytime)

0. **Preflight & Continuation Rules**
   - If `.ai/task/review-task-results.md` exists (review application completed but not finalized), **block Reparo**: instruct the user to **finish the current review by typing Accio**. After finishing, they may start a new Reparo round.
   - If `.ai/task/comments.md` exists and `.ai/task/review-task.md` does **not**:
     - Ask whether to **continue the existing review** or **reset**. If the user types **Reparo** again, \*\*delete \*\*\`\` and start fresh; otherwise continue from the gathered comments.

   - If `.ai/task/review-task.md` exists (regardless of `comments.md`): remind the user that a review task is already in progress. If they want a clean slate, **Reparo** again will \*\*delete ` and \*\*` and restart; otherwise continue iterating the existing `review-task.md`.

1. **Developer**: Types **Reparo**.

2. **AI Agent → MCP**: Calls the `reparo` tool.

3. **MCP — one‑shot instructions to the AI Agent (GitHub PR comment gathering):**

   ```text
   Do the following as a single operation. Either perform the action or stop with a clear message; do not ask the user additional questions unless authentication is required.

   1) Check GitHub MCP availability:
      - Discover available GitHub tools/functions.
      - Perform a trivial call (e.g., list the authenticated user or repositories).
      - If tools are missing ⇒ GitHub MCP is not installed/configured. Relay install/auth guidance (see Appendix) and stop.
      - If the call returns an authentication error ⇒ ask the user to authenticate per client instructions and stop.
      - If it succeeds ⇒ proceed.

   2) Gather review comments for the current branch/PR:
      - Determine the repository and current branch/PR context from the client. If the PR context is ambiguous, stop and inform the user to provide the PR URL, then re‑run Reparo.
      - Fetch all open review comments (include unresolved threads) via GitHub MCP.
      - Write them to `.ai/task/comments.md` in this structure:
        - Header with PR identifier, branch, and timestamp.
        - Group by thread; for each comment include author, file:line (or path+position), permalink, status (open/resolved if available), and the comment body (quoted).

   3) Outputs:
      - message_to_user: "Pulled C comments across T threads from <PR>. Review them in `.ai/task/comments.md`."

   ```

4. **Iterate by chat**: Developer and AI discuss/clarify what needs to be done.

5. **Developer → Accio**: MCP proposes and writes `.ai/task/review-task.md` covering all actionable items from `comments.md`.

6. **Iterate review task**: Refine `review-task.md` with the user until clear.

7. **Developer → Accio (AI Agent calls ****\*\*******\*\*******\*\*******`accio`****\*\*\*\*****\*\*\*\*****\*\*\*\*****) — MCP one‑shot instructions to the AI Agent (apply review task):\*\*

   ```text
   Do the following as a single operation. Either perform the action or stop with a clear message; do not ask the user additional questions.

   1) Apply exactly the steps described in `.ai/task/review-task.md`.
   2) Create`.ai/task/review-task-results.md` capturing:
      - Achieved (mapped to comment/thread where possible)
      - Remaining/unaddressed items with reasons
      - Errors encountered and suggested follow-ups
      - Files changed (paths) and a brief diff summary if available
   3) Outputs:
      - message_to_user: "Applied the review task. Wrote results to `.ai/task/review-task-results.md`."

   ```

8. **Developer → Accio (AI Agent calls \*\***`accio`\***\*) — MCP finalizes review (MCP performs archiving) and returns outputs:**

   ```text
   The MCP performs these actions itself (no file operations required from the AI Agent):

   1) Archive the review artifacts by moving:
      - `.ai/task/comments.md`
      - `.ai/task/review-task.md`
      - `.ai/task/review-task-results.md`
      into `.ai/task/pr-reviews/pr-review-<YYYY-MM-DD-HHMM>/`.

   2) Determine the phase to return to (the phase active before Reparo) and construct guidance:
      - If **Gather Acceptance Criteria**: remain in Gathering. Guidance: the user may refine `plan.md` (especially Acceptance Criteria) or type **Accio** to move to Achieve. If `.ai/task/task.md` exists, note it will be resumed when Achieve restarts.
      - If **Achieve Acceptance Criteria**: resume Achieve. If `.ai/task/task.md` exists, treat it as the current task; otherwise, on the next **Accio**, propose the next smallest, single‑focus task toward remaining Acceptance Criteria.

   3) Outputs returned to the AI Agent (to relay to the user):
      - `message_to_user`: "PR review finished. Archived to `<dir>`. We’re back in **<PHASE>** — <short guidance for what to do next>."
      - `instructions_to_coding_agent`: "Communicate the archive location and the active phase (Gather or Achieve) with the next‑step guidance above. Do not perform file operations; just relay and switch context accordingly."
   ```

### Sequence: Lumos (Current State — Anytime)

1. **Developer**: Types **Lumos**.
2. **AI Agent → MCP**: Calls the `lumos` tool.
3. **MCP — read state & return one‑shot outputs (no LLM, no writes):**
   - **Source of truth:** Read `.ai/task/state.json` for `current_phase`, optional `substate`, and `previous_phase`. Do **not** modify files.

   - **Output format (always):**

     ```text
     message_to_user: <human-friendly status + next required action>
     instructions_to_coding_agent: <what to say + which spell calls are valid; no file ops>
     options: <list of allowed spells right now>
     ```

   - **State → Guidance Map:**

     **GATHER_NEEDS_PLAN**
     - Explain: "We’re at the very start; no `plan.md` yet."
     - Next (user): Type **Accio** to scaffold a plan template, or paste initial context and AC ideas.
     - Options: Accio, Expecto, Lumos.

     **GATHER_EDITING**
     - Explain: "We’re drafting `plan.md`. At least one Acceptance Criterion is required to proceed."
     - Next (user): Add ≥1 unchecked AC (`- [ ] ...`). You may run **Expecto** to fetch references and link them under **References**.
     - Options: Accio (will only move once ≥1 AC exists), Expecto, Lumos, Reparo (allowed anytime but starts PR flow), Finite (no‑op; already in Gather).

     **GATHER_READY**
     - Explain: "`plan.md` has Acceptance Criteria; we can start executing."
     - Next (user): Type **Accio** to enter **Achieve**.
     - Options: Accio, Expecto, Lumos, Finite (no‑op).

     **ACHIEVE_TASK_DRAFTING**
     - Explain: "We’re in **Achieve**. `task.md` exists and is being refined."
     - Next (user): Finalize the task intent/steps/Testing and type **Accio** to execute.
     - Options: Accio, Finite (return to Gather), Reparo (switch to PR flow), Lumos.

     \*\*ACHIEVE_TASK_EXECUTED\*\*
     - Explain: "Execution finished; `task-results.md` is ready."
     - Next (user): Type **Accio** and the MCP will archive the task and mark matching ACs in `plan.md`.
     - Options: Accio, Reparo, Lumos.
     - Finite is not available until the task results are integrated into the plan to avoid corrupting the plan.

     **ACHIEVE_COMPLETE**
     - Explain: "No remaining Acceptance Criteria."
     - Next (user): Choose **Finite** to add more ACs, or **Reparo** to address PR feedback.
     - Options: Finite, Reparo, Lumos.

     **PR_GATHERING_COMMENTS**
     - Explain: "PR review flow active; comments have been collected to `comments.md`."
     - Next (user): Type **Accio** to generate `review-task.md` covering all actionable items.
     - Options: Accio, Finite (escape to Gather), Lumos.

     **PR_REVIEW_TASK_DRAFT**
     - Explain: "`review-task.md` exists and is being refined."
     - Next (user): Finalize the review task and type **Accio** to apply it.
     - Options: Accio, Finite, Lumos.

     **PR_APPLIED_PENDING_ARCHIVE**
     - Explain: "Review task applied; `review-task-results.md` is ready."
     - Next (user): Type **Accio** and the MCP will archive the review and return to the previous phase.
     - Options: Accio, Finite, Lumos.

   - **Notes:** The MCP should keep the `options` list tight—only spells that make sense in the current state.

### Sequence: Finite (Return to Gather Acceptance Criteria) (Return to Gather Acceptance Criteria)

1. **Developer**: Types **Finite**.
2. **AI Agent → MCP**: Calls the `finite` tool.
3. **MCP (stage-aware handling):**
   - **If in Achieve Acceptance Criteria and integration is in progress** (i.e., `task-results.md` exists and results are being integrated back into `plan.md` but ACs aren’t marked yet):
     - **Block Finite**. Instruct the AI Agent to tell the user: \*“We’re integrating task results back into the plan. To avoid corrupting progress, please finish integration and type \***\*Accio\*\*** to advance. Finite is unavailable at

## Appendix: Reusable Prompts

### Atlassian MCP availability check

> To verify if the Atlassian Model Context Protocol (MCP) integration is available and functioning correctly, please:
>
> 1. First, check if you have access to any Atlassian MCP functions by attempting to call the basic user information function `mcp__atlassian__atlassianUserInfo` with no parameters.
> 2. If successful, the function will return the current user's Atlassian account details including account ID, email, name, and other profile information.
> 3. If unsuccessful or if you receive an error about the function not being available, then the Atlassian MCP is not properly installed or configured.

### GitHub MCP availability check

> To verify if the GitHub Model Context Protocol (MCP) integration is available and functioning correctly, please:
>
> 1. **Discover tools**: Check your available tools/functions for GitHub-related capabilities (look for functions containing terms like "github", "gh", or "git" in their names or descriptions).
> 2. **Test a basic operation**: Try a minimal call such as a simple repository search using a generic term like "test" **or** list the repositories the authenticated user can access.
> 3. **Analyze the response**:
>    - If you receive GitHub data (repositories, issues, etc.), the GitHub integration is working and authenticated.
>    - If you receive an authentication error, the GitHub integration exists but requires authentication.
>    - If no GitHub tools/functions are available, the integration is not installed.
