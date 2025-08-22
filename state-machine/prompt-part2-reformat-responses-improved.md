# Task: Reformat Next State Machine Transition Table Using Standard Templates

## Introduction

You are working with an AI Engineer workflow orchestration system defined in a state machine document. This document (`state-machine.md`) has been modified to preserve the original responses in an "Old Response" column, and now you need to reformat those responses using standardized templates.

This task works **table by table** - you will find the next transition table where the Response column is empty and work only on that specific table, allowing for incremental progress and review.

## File Location

The state machine is defined in the file located at:
`/Users/ddaradics/IdeaProjects/ai-engineer/state-machine/state-machine.md`

## Background

The state machine document defines:
- States that the system can be in
- Spells (commands) that users can cast to transition between states
- Transition rules that determine what happens for each state-spell combination
- Response messages that should be shown to users

A new section called "Response Format Templates" has been added to the document, defining standardized formats for different types of transitions. Your task is to apply these templates to responses in the next incomplete transition table.

## Understanding Role Separation: MCP vs AI

It's critical to understand the clear separation between the Model Context Protocol (MCP) and AI in the state machine workflow:

1. **MCP Responsibilities** (Reflected in the "Action" column):
   - State changes and updates
   - File creation, modification, and management
   - Loading content into memory
   - Any system-level operations described in the Action column
   - These happen BEFORE the AI response is generated

2. **AI Responsibilities** (Should be in "Response to the AI" section):
   - Reading files that the MCP has already created/modified
   - Processing information based on file content
   - Guiding the user through workflow steps
   - Generating appropriate responses
   - These happen AFTER the MCP actions are completed

### Key Rules:

- DO NOT include MCP actions in the "Response to the AI" section
- DO NOT instruct the AI to perform state changes or create files that the MCP handles
- ASSUME that the MCP has ALREADY performed all actions in the Action column
- FOCUS the AI response on what the AI needs to do with the files/state that MCP has prepared

For example:
- INCORRECT: "Create `.ai/task/plan.md` from template and guide the user..."
- CORRECT: "Read the ./ai/task/plan.md file to understand the plan. Guide the user..."

This separation ensures that the AI knows exactly what it needs to do without attempting to perform actions that the system has already handled.

## Your Task

Find the first transition table in the document where the Response column entries are empty, then reformat all responses in ONLY that table using the standardized templates defined in the "Response Format Templates" section of the document.

## Step-by-Step Instructions

### Phase 1: Table Discovery

1. Read the entire `state-machine.md` file, paying special attention to:
   - The "States" section to understand each possible state
   - The "Transition Rules" section to understand how states change
   - The "Response Format Templates" section which defines the required response structure

2. Scan through the document sequentially to find the **first** transition table where:
   - The table has the standard format: `| ID | Current State | Trigger | Condition | Next State | Action | Old Response | Response |`
   - The "Response" column (last column) contains empty entries (just `|` characters)

3. Once you find the first incomplete table:
   - Note the section name (e.g., "#### Gather Acceptance Criteria Phase Transitions")
   - Identify the line range where this table appears
   - **Work ONLY on this table** - ignore all other tables

### Phase 2: Table Processing

4. For each row in the identified incomplete transition table:

   a) Identify the transition type:
      - Standard transition (normal state changes)
      - Blocked transition (rows with [BLOCKED] in the Next State column)
      - No-op transition (rows where Next State is "Same state" or "No state change")
      - Confirmation transition (rows involving confirmation states like PR_CONFIRM_*)

   b) Select the appropriate template from the "Response Format Templates" section
   
   c) Fill in the template using information from:
      - The "Old Response" column (which contains the original response text)
      - The "Action" column (which describes what happens during the transition)
      - Other relevant columns (Current State, Next State, etc.)
   
   d) Place the reformatted response in the "Response" column

### Phase 3: Response Organization

5. Create an appropriate directory structure to store responses:

   ```
   responses/
   ├── gather_transitions/  (For "Gather Acceptance Criteria Phase Transitions")
   │   ├── G1.md
   │   ├── G2.md
   │   └── ...
   ├── gather_blocked/      (For "Gather Acceptance Criteria Phase Blocked Transitions")
   │   └── ...
   └── ...
   ```

6. Name each response file using the transition ID (G1.md, G2.md, etc.)

7. Update the state-machine.md file to reference these files using relative paths:
   ```
   [G1.md](responses/gather_transitions/G1.md)
   ```

### Phase 4: Quality Assurance

8. For each reformatted response in the table, ensure it follows these guidelines:

#### Response to the AI Guidelines

1. **BE DIRECTIVE with specific instructions**:
   - Use clear file paths: "Read the ./ai/task/plan.md file"
   - Specify exactly what the AI should do with the files
   - Focus on actionable instructions, not explanations of the system

2. **DO NOT include**:
   - State machine implementation details
   - MCP operations like creating files or updating state
   - References to how the system works internally
   
3. **DO include**:
   - Placeholders for dynamic content when needed:
     ```
     Task Content:
     [TASK_CONTENT_PLACEHOLDER]
     ```
   - Specific guidance on what to look for in files
   - Instructions on what to generate for the user

4. **For conditional scenarios**:
   - Clearly specify different actions based on conditions
   - Provide distinct response templates for different outcomes
   - Explain how to determine which condition applies

#### Language Guidelines

1. **Collaborative Language**:
   - Use "we" instead of "you" to emphasize collaboration
   - Use "our" instead of "your" when referring to shared artifacts
   - AVOID using "together" as it can sound awkward

2. **Timeline Consistency**:
   - Use past tense when referring to actions the AI has already taken
     - CORRECT: "I've gathered PR comments"
     - INCORRECT: "I'll gather PR comments"
   - Use present tense for current state descriptions

#### Available Spells Rules

1. **ALWAYS Include**:
   - **Lumos** in every response's Available Spells section
   - Only spells that have meaningful effects in the current state

2. **NEVER Include**:
   - Spells that have no effect in the current state
   - Spells that are blocked in the current state
   - Options that don't make sense for the current context

3. **Conditional Spell Availability**:
   - Different conditions may have different available spells
   - Only include spells that make sense for that specific condition

### Phase 5: Completion

9. After completing all responses in the identified transition table:
   - Verify that every row in the table now has a properly formatted response
   - **STOP HERE** - Do not continue to other tables
   - Report which table was completed and what comes next

## Improved Examples

### Example 1: Standard Transition (Initial Plan Creation)

Original Response: `Guide user in filling out sections, especially Acceptance Criteria`

INCORRECT Reformatted Response:
```markdown
## Response to the AI

Create `.ai/task/plan.md` from template and guide the user through filling out the plan sections.
```

CORRECT Reformatted Response:
```markdown
## Response to the AI

Read the ./ai/task/plan.md file to understand the plan. Guide the user through filling out the plan sections, especially the Acceptance Criteria section.

## Response to the Developer

### What Just Happened
We've created a new plan document for our project.

### Where We Are
We're now in the planning phase where we'll define what we want to accomplish.

### Available Spells
- **Accio**: Move to task creation after adding at least one acceptance criterion
- **Expecto**: Enrich our plan with information from Atlassian resources
- **Reparo**: Begin a PR review process
- **Lumos**: Show current state and available actions

### Next Steps
Let's add at least one acceptance criterion to the plan.md file, then use Accio to start creating tasks.
```

### Example 2: Working with Existing Task Content

Original Response: `(1) Summarize the task.md content; (2) Tell the user to continue drafting it`

INCORRECT Reformatted Response:
```markdown
## Response to the AI

Summarize the content of the task.md (which the MCP has loaded into memory) for the user and prompt them to continue refining it together.
```

CORRECT Reformatted Response:
```markdown
## Response to the AI

Read the task.md file, summarize its content, and help the user continue refining it.

Task Content:
[TASK_CONTENT_PLACEHOLDER]

## Response to the Developer

### What Just Happened
We've found an existing task document that we were working on previously.

### Where We Are
We're now in the task drafting phase with our previously created task.

### Available Spells
- **Accio**: Execute the defined task and document results
- **Finite**: Return to plan editing if we need to modify our plan
- **Reparo**: Begin a PR review process
- **Lumos**: Show current state and available actions

### Next Steps
Let's continue refining this task, then use Accio to execute it when we're ready.
```

### Example 3: Conditional Response Scenario

Original Response: `(1) Check if GitHub MCP is available; (2) If not available, guide user through setup; (3) If available, use GitHub MCP to fetch PR comments for current branch...`

CORRECT Reformatted Response:
```markdown
## Response to the AI

Read the empty `.ai/task/comments.md` file, and then:

1. Check if GitHub MCP is available using this approach:
   - Check your available tools/functions for GitHub-related capabilities
   - Try a minimal call such as a simple repository search
   - Analyze the response to determine if the integration is working

2. Based on GitHub MCP availability:
   - If GitHub MCP is available: Fetch PR comments for the current branch
   - If GitHub MCP is not available: Guide the user through setting it up

3. If there are PR comments:
   - Format and write comments to comments.md
   - Provide a summary of the feedback
   - Use the "Comments Found" response to the developer

4. If no PR exists or no comments found:
   - Explicitly document this in comments.md
   - Explain to the user that no comments were found
   - Use the "No Comments Found" response to the developer

## Response to the Developer

### Comments Found Response:

### What Just Happened
I've gathered PR comments for your current branch and saved them to comments.md.

### Where We Are
We're now in the PR review flow where we need to address the feedback in these comments.

### Available Spells
- **Accio**: Process these PR comments and create tasks to address them
- **Reverto**: Cancel the PR review process and return to previous state
- **Lumos**: Show current state and available actions

### Next Steps
Review the comments I've gathered, then use Accio to create tasks that address this feedback.

### No Comments Found Response:

### What Just Happened
I've checked for PR comments but couldn't find any for your current branch.

### Where We Are
We're in the PR review flow, but no comments were found to process.

### Available Spells
- **Reverto**: Cancel the PR review process and return to previous state
- **Lumos**: Show current state and available actions

### Next Steps
Since no PR comments were found, use Reverto to exit the PR review process and return to your previous workflow.
```

## Handling Conditional Responses

Some transitions require different responses based on runtime conditions (like API availability or success/failure outcomes). These require special handling:

### Structure for Conditional Responses

1. **Clear AI Instructions**:
   - Provide detailed instructions for the AI to determine which condition applies
   - Explain exactly how to check for conditions (e.g., API availability)
   - Specify which developer response to use for each condition

2. **Separate Response Templates**:
   - Create separate, complete response templates for each condition
   - Each should have all required sections (What Just Happened, Where We Are, etc.)
   - Each should have appropriate Available Spells for that specific condition

3. **Important Considerations**:
   - Each condition may require different available spells
   - Give explicit instructions on how to determine conditions
   - Each conditional response must be complete and standalone

## Timeline Guidelines for Developer Responses

A critical aspect of creating effective responses is proper timeline handling. Responses to the developer should always reflect the correct sequence of events:

1. **Response Sequence**:
   - MCP actions happen first (as defined in the Action column)
   - AI executes its instructions second (as defined in "Response to the AI")
   - Developer sees the final response last (the "Response to the Developer")

2. **Use Past Tense for Completed Actions**:
   - By the time the developer sees the response, the AI has already executed its instructions
   - CORRECT: "I've gathered PR comments for your current branch"
   - INCORRECT: "I'll gather PR comments for your current branch"

3. **Present Tense for Current State**:
   - Use present tense to describe the current situation:
   - CORRECT: "We're now in the PR review flow"

4. **Future Tense for Next Steps Only**:
   - Only use future-oriented language in the Next Steps section

## Final Notes

- Process ONLY the first incomplete transition table you find - do not work on multiple tables
- Follow the templates precisely while adapting the content to each specific transition
- Only list spells that are truly useful in the current state
- Focus on clarity and helpfulness in the "Response to the Developer" section
- Complete every row in the identified table before stopping
- Report which table was completed so the user knows the progress

## Progress Tracking and Next Steps

After completing the single transition table:

1. **Report Completion**: Clearly state which table section was just completed (e.g., "Completed: Gather Acceptance Criteria Phase Transitions")

2. **Identify Next Steps**: Inform the user what the next incomplete table is, or if this was the last one

3. **Optional Verification**: If desired, run the state machine verification script to ensure changes haven't broken anything:
   ```bash
   python verify-state-machine.py
   ```

4. **Review Pause**: This is a natural stopping point for the user to review the completed table before continuing to the next one

## When All Tables Are Eventually Complete

Once all tables have been processed through multiple iterations:

1. The verification script should report that the state machine is COMPLETE and VALID with 100% coverage
2. Some duplicate transitions and condition-based transitions might be reported, but these are expected and not considered errors
3. All transition tables will have standardized, user-friendly responses following the defined templates