# Task: Reformat State Machine Responses Using Standard Templates

## Introduction

You are working with an AI Engineer workflow orchestration system defined in a state machine document. This document (`state-machine.md`) has been modified to preserve the original responses in an "Old Response" column, and now you need to reformat those responses using standardized templates.

## File Location

The state machine is defined in the file located at:
`/Users/ddaradics/IdeaProjects/ai-engineer/state-machine/state-machine.md`

## Background

The state machine document defines:
- States that the system can be in
- Spells (commands) that users can cast to transition between states
- Transition rules that determine what happens for each state-spell combination
- Response messages that should be shown to users

A new section called "Response Format Templates" has been added to the document, defining standardized formats for different types of transitions. Your task is to apply these templates to all responses in the transition tables.

## Your Task

Reformat all responses in the transition tables using the standardized templates defined in the "Response Format Templates" section of the document.

## Step-by-Step Instructions

1. Read the entire `state-machine.md` file, paying special attention to:
   - The "States" section to understand each possible state
   - The "Transition Rules" section to understand how states change
   - The "Response Format Templates" section which defines the required response structure

2. For each row in every transition table:

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

3. For each reformatted response, ensure it includes all sections from the appropriate template:

   - **Response to the AI**:
     * Technical instructions for the AI system on how to implement the transition
     * Include all technical details from the "Action" column
     * Include any file operations, state changes, or system operations

   - **Response to the Developer** (with all required subsections):
     * What Just Happened
     * Where We Are
     * Available Spells (or Available Choices for confirmation transitions)
     * Next Steps

## Transformation Guidelines

1. Avoid using internal state names (like GATHER_EDITING, PR_REVIEW_TASK_DRAFT_G) in the "Response to the Developer" section.

2. Use human-friendly language to describe:
   - What happened during the transition
   - The current workflow phase
   - What each available spell does

3. For the "Available Spells" section, ONLY include spells that:
   - Have a meaningful effect in the current state
   - Are actually available/permitted in the state
   - Would move the workflow forward in some way

4. DO NOT include spells that:
   - Have no effect (like no-op transitions)
   - Are blocked or forbidden in the current state
   - Would not help the user make progress

5. Focus on providing clear guidance to users about what they can do next.

6. Preserve ALL information from the original response - don't lose any details.

## Examples

Here are examples of how to transform responses for different transition types:

### Example 1: Standard Transition

Original Response: `Guide user in filling out sections, especially Acceptance Criteria`

Reformatted Response:
```markdown
## Response to the AI

Create `.ai/task/plan.md` from template and guide the user through filling out the plan sections.

## Response to the Developer

### What Just Happened
I've created a new plan document for your project.

### Where We Are
You're now in the planning phase where you'll define what you want to accomplish.

### Available Spells
- **Accio**: Move to task creation after adding at least one acceptance criterion
- **Expecto**: Enrich your plan with information from Atlassian resources
- **Reparo**: Begin a PR review process

### Next Steps
Add at least one acceptance criterion to the plan.md file, then use Accio to start creating tasks.
```
Note: Finite was omitted because it has no effect in this state.

### Example 2: Blocked Transition

Original Response: `Explain: "Reverto is only available in PR states."`

Reformatted Response:
```markdown
## Response to the AI

Inform the user that Reverto cannot be used in the current state because it's only available in PR review states.

## Response to the Developer

### What Just Happened
You attempted to cast **Reverto** which cannot be used right now because you're not in a PR review process.

### Where We Are
You're currently in the planning phase, working with your project plan.

### Available Spells
- **Accio**: Progress to the next step in the workflow
- **Expecto**: Enrich your plan with information from Atlassian resources
- **Reparo**: Begin a PR review process

### Next Steps
Use **Reparo** if you want to start reviewing PR comments, or continue working on your plan.
```
Note: Reverto was omitted from Available Spells because it's blocked in this state.

## Final Notes

- Process ALL transitions in ALL tables throughout the document
- Follow the templates precisely while adapting the content to each specific transition
- Only list spells that are truly useful in the current state
- Focus on clarity and helpfulness in the "Response to the Developer" section
- Don't forget any transitions - every row in every table needs a reformatted response

This task will standardize all responses across the state machine, making the system more consistent and user-friendly.