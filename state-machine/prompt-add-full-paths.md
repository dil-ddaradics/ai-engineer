# Task: Add Full File Paths to State Machine Response Files

## Introduction and Purpose

This task focuses specifically on improving the usability and clarity of the state machine response files by ensuring all file references use full paths consistently. The goal is to systematically review all response files within the `/responses/` directory and update any file references to use complete, unambiguous paths.

### Why Full Paths Matter

1. **Clarity for Users**: Full paths make it immediately obvious where files are located, eliminating confusion about which file is being referenced.

2. **Reduced Cognitive Load**: When users see a file reference like `.ai/task/plan.md` instead of just `plan.md`, they don't need to guess the location.

3. **Consistency**: Using the same format for all file references creates a predictable pattern that users can rely on.

4. **Easier Navigation**: Full paths enable users to quickly locate files in their file system without having to search or infer locations.

### Expected Outcome

After completing this task, all response files will consistently:
- Use full paths starting with `.ai/task/` where appropriate
- Format file paths with backticks (e.g., `.ai/task/plan.md`)
- Use placeholders for dynamic paths (e.g., `[ARCHIVE_PATH_PLACEHOLDER]`)
- Provide clear guidance on file locations in both AI and Developer responses

## Key Guidelines for File References

### 1. File Path Formatting

- **Always use backticks**: Format all file paths using backticks for proper markdown code formatting: `` `.ai/task/plan.md` ``
- **Never use plain text**: Avoid referring to files without proper formatting: ~~plan.md~~ or ~~.ai/task/plan.md~~

### 2. Path Structure Requirements

- **Primary task files**: Always use the `.ai/task/` prefix for all primary workflow files:
  - `.ai/task/plan.md`
  - `.ai/task/task.md`
  - `.ai/task/task-results.md`
  - `.ai/task/comments.md`
  - `.ai/task/review-task.md`
  - `.ai/task/review-task-results.md`

- **Archive locations**: For archive references, use the appropriate placeholder:
  - `.ai/task/tasks/` → `[ARCHIVE_PATH_PLACEHOLDER]` 
  - `.ai/task/incomplete-task/` → `[INCOMPLETE_ARCHIVE_PATH_PLACEHOLDER]`
  - `.ai/task/pr-reviews/` → `[PR_ARCHIVE_PATH_PLACEHOLDER]`

### 3. Consistency Requirements

- **Apply full paths everywhere**: Both in "Response to the AI" and "Response to the Developer" sections
- **Be thorough**: Update all references including in "What Just Happened" and "Next Steps" sections
- **No abbreviations**: Don't abbreviate paths or use relative references, always use the full path

## Step-by-Step Methodology

### 1. Locate Response Files

1. **Identify the response files directory**: The responses are stored in `/Users/ddaradics/IdeaProjects/ai-engineer/state-machine/responses/` and organized in subdirectories by transition type.

2. **Review the directory structure**: Response files are grouped into subdirectories like:
   - `responses/gather_transitions/` - For standard Gather phase transitions
   - `responses/gather_blocked/` - For blocked Gather phase transitions
   - `responses/achieve_transitions/` - For standard Achieve phase transitions
   - `responses/error_recovery/` - For error recovery transitions
   - `responses/pr_transitions/` - For PR-related transitions
   
3. **Prioritize by importance**: Start with the most frequently referenced files in each category.

### 2. Processing Individual Files

For each response file (.md file in the responses subdirectories):

1. **Read the entire file**: Get familiar with the context and identify all file references.

2. **Update the "Response to the AI" section**:
   - Find all instructions that reference files
   - Replace relative paths with full paths
   - Add backticks around all file paths
   - Add placeholders for any archive paths

3. **Update the "Response to the Developer" section**:
   - Look for file mentions in the "What Just Happened" subsection
   - Update paths in the "Next Steps" section
   - Ensure all file references use full paths with proper formatting

4. **Save the updated file** after all references have been updated

### 3. Systematic Pattern Matching

Look for these common patterns that need updating:

1. **Simple file references**:
   - Before: "task.md", "plan.md", "comments.md"
   - After: "`.ai/task/task.md`", "`.ai/task/plan.md`", "`.ai/task/comments.md`"

2. **Partial paths**:
   - Before: "./task/plan.md"
   - After: "`.ai/task/plan.md`"

3. **Action descriptions**:
   - Before: "Review the task details"
   - After: "Review the task details in `.ai/task/task.md`"

4. **Archival references**:
   - Before: "archived to tasks folder"
   - After: "archived to `[ARCHIVE_PATH_PLACEHOLDER]`"

## Before and After Examples

### Example 1: Simple File Reference Update

**BEFORE:**
```markdown
## Response to the AI

Read the plan.md file to understand the project goals and acceptance criteria. Then create a new task based on the next uncompleted acceptance criterion in the plan.

## Response to the Developer

### What Just Happened
I've created a new task file since the previous one was missing.

### Where We Are
We're now back in the task drafting phase where we can define what work needs to be done next.

### Next Steps
Let's complete this task definition with clear steps, then use Accio to execute it when ready.
```

**AFTER:**
```markdown
## Response to the AI

Read the `.ai/task/plan.md` file to understand the project goals and acceptance criteria. Then create a new task based on the next uncompleted acceptance criterion in the plan.

## Response to the Developer

### What Just Happened
I've created a new task file at `.ai/task/task.md` since the previous one was missing.

### Where We Are
We're now back in the task drafting phase where we can define what work needs to be done next.

### Next Steps
Let's complete this task definition in `.ai/task/task.md` with clear steps, then use Accio to execute it when ready.
```

### Example 2: Archive Path Placeholders

**BEFORE:**
```markdown
## Response to the AI

Read the task-results.md file to understand what was completed in the previous task. Update plan.md to mark any completed acceptance criteria based on these results. Then create a new task.md focusing on the next uncompleted acceptance criterion. Note that the previous task.md and task-results.md have been archived to the tasks directory.

## Response to the Developer

### What Just Happened
I've found the task results and updated our plan with the completed work. The previous task has been archived and a new task has been created.
```

**AFTER:**
```markdown
## Response to the AI

Read the `.ai/task/task-results.md` file to understand what was completed in the previous task. Update `.ai/task/plan.md` to mark any completed acceptance criteria based on these results. Then create a new task in `.ai/task/task.md` focusing on the next uncompleted acceptance criterion. Note that the previous task.md and task-results.md have been archived to [ARCHIVE_PATH_PLACEHOLDER].

## Response to the Developer

### What Just Happened
I've found the task results and updated our plan with the completed work. The previous task has been archived to [ARCHIVE_PATH_PLACEHOLDER] and a new task has been created at `.ai/task/task.md`.
```

### Example 3: Adding Missing File References

**BEFORE:**
```markdown
## Response to the Developer

### What Just Happened
I've filled out the task template based on our project plan.

### Where We Are
We're now in the task drafting phase where we need to define the specific steps for this task.

### Next Steps
Let's review and make any necessary adjustments before using Accio to execute it.
```

**AFTER:**
```markdown
## Response to the Developer

### What Just Happened
I've filled out the task template at `.ai/task/task.md` based on our project plan in `.ai/task/plan.md`.

### Where We Are
We're now in the task drafting phase where we need to define the specific steps for this task.

### Next Steps
Let's review the task at `.ai/task/task.md` and make any necessary adjustments before using Accio to execute it.
```

## Handling Special Cases

### PR Review Files and Comments

PR review-related files have their own specific paths that need consistent handling:

1. **PR Comments**:
   - Always reference as `.ai/task/comments.md`
   - When instructing to check for PR comments: "Check if there are any comments in `.ai/task/comments.md`"

2. **Review Tasks**:
   - Always reference as `.ai/task/review-task.md` and `.ai/task/review-task-results.md`
   - Be explicit about where reviews are stored: "Review tasks are in `.ai/task/review-task.md`"

3. **PR Archives**:
   - Use the `[PR_ARCHIVE_PATH_PLACEHOLDER]` for archives
   - Example: "The PR review files have been archived to `[PR_ARCHIVE_PATH_PLACEHOLDER]`"

### Multiple File References in One Sentence

When referencing multiple files in a single sentence:

1. **List each file with its full path**:
   - Before: "Check the task.md and plan.md files"
   - After: "Check the `.ai/task/task.md` and `.ai/task/plan.md` files"

2. **Keep backticks separate for each file**:
   - Correct: "Both `.ai/task/task.md` and `.ai/task/plan.md` have been updated"
   - Incorrect: "Both `.ai/task/task.md and plan.md` have been updated"

### Conditional Instructions

For responses with conditional logic:

1. **Maintain full paths in all branches**:
   ```markdown
   If there are PR comments:
   - Format and write comments to `.ai/task/comments.md`
   
   If no PR exists or no comments found:
   - Explicitly document this in `.ai/task/comments.md`
   ```

2. **Ensure path consistency across different response sections**:
   - Use the same full path format in both the "Comments Found" and "No Comments Found" sections

## Verification Process

After updating file references in a response file, follow this verification checklist:

### 1. Completeness Check

Verify that you've updated ALL file references by searching for:
- Common file names: `plan.md`, `task.md`, `comments.md`, etc.
- Partial references: `/task/`, `./`
- Action verbs often used with files: "read", "check", "review", "update"

### 2. Format Consistency Check

Ensure consistent formatting by verifying:
- All file paths use backticks: `` `.ai/task/plan.md` ``
- All primary workflow files use the `.ai/task/` prefix
- All archive paths use the appropriate placeholder format

### 3. Content Integrity Check

Make sure your edits preserve the original meaning:
- Don't change any instructions or guidance, only the file path formatting
- Maintain the original context and flow of the instructions
- Don't add or remove actions, only clarify file locations

### 4. Final Review

Before saving your final changes:
- Re-read the entire file to ensure all file references have been updated
- Check that both "Response to the AI" and "Response to the Developer" sections have been updated
- Verify that the response still reads naturally with the updated paths

## Completion Reporting

After completing updates to a response file:

1. **Mark as completed** in your tracking list
2. **Report any patterns** you notice that could help with other response files
3. **Identify any challenges** encountered with particular file types or references

Finally, run a verification check on the updated files using grep or similar tools to ensure no file references were missed:

```bash
grep -r "plan\.md\|task\.md\|comments\.md" --include="*.md" responses/ | grep -v "\.ai/task/"
```

This helps catch any remaining references without the proper `.ai/task/` prefix.