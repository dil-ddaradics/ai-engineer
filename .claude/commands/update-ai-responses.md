# Update AI Response Sections

This command processes one folder at a time from `state-machine/responses/`, updating the "## Response to the AI" sections to use clearer, more actionable formatting that prevents AI assistants from missing critical instructions.

## Problem We're Solving

Currently, AI response sections contain generic instructions that can be easily overlooked:

```markdown
## Response to the AI

Read the `.ai/task/plan.md` and the `.ai/task/task.md` file. Your goal is to propose the next smallest task that will help fulfill the remaining Acceptance Criteria in the `.ai/task/plan.md` file and put it into the `.ai/task/task.md` file following its template. Use the `.ai/task-guide.md` file for task creation guidance.
```

## What We Want Instead

Transform these into impossible-to-miss mandatory actions:

```markdown
## MANDATORY ACTION FOR AI

**EXECUTE IMMEDIATELY:**

1. Read `.ai/task/plan.md` and `.ai/task/task.md` files
2. Identify the next smallest uncompleted acceptance criteria from the plan
3. Update `.ai/task/task.md` with a specific task proposal following the template structure
4. Use `.ai/task-guide.md` for task creation guidance
5. **DELIVERABLE**: Completed task.md file with specific, actionable task definition
```

## Transformation Rules

1. **Header Change**: "## Response to the AI" → "## MANDATORY ACTION FOR AI"
2. **Add Emphasis**: Start with "**EXECUTE IMMEDIATELY:**"
3. **Break Into Steps**: Convert paragraph instructions into numbered action items
4. **Make Specific**: Change vague language ("Your goal is to...") to direct commands ("Update X with Y")
5. **Add Deliverables**: End with clear, specific outputs expected
6. **Preserve Intent**: Keep the same functional requirements, just make them clearer

## Command Behavior

1. **Check Progress**: Read `rewrite-process.md` to find the next uncompleted folder
2. **Process Folder**: Transform all `.md` files in that folder using the rules above
3. **Update Tracking**: Mark the folder as completed with ✅
4. **Report Progress**: Show what was processed and overall completion status
5. **One Folder Per Run**: Process exactly one folder per execution for control

## File Processing Logic

For each `.md` file in the target folder:

- Locate the "## Response to the AI" section
- Extract the instruction content
- Parse instructions into logical action steps
- Apply transformation rules to create numbered list
- Replace the section while preserving all other content
- Maintain original file formatting and structure

## Intent

The goal is to make AI instructions so clear and action-oriented that no AI assistant can miss or misinterpret what they need to do. This prevents situations where AIs read instructions but don't act on them.
