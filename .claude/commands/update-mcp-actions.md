# Update State Machine Tables with MCP Actions Column

You are tasked with updating the transition tables in `state-machine/state-machine.md` to properly separate MCP (Model Context Protocol) actions from AI actions. This is critical for implementation clarity.

## Your Task

Work through the transition tables **one table at a time** and add a new "MCP Actions" column beside the existing "Action" column. After updating each table, **STOP** and wait for user review before proceeding to the next table.

## Key Sources for Decision Making

1. **Current Action Column**: Provides context about what operations are happening
2. **Response Files**: Located in `state-machine/responses/` - these are vetted and describe what happens AFTER the MCP has completed its work
3. **Transition IDs**: Match response files (e.g., GC1 → `responses/gather_transitions/GC1.md`)

## Understanding AI vs MCP Responsibilities

### What the MCP Does (Include in MCP Actions column):
- **File Operations**: Creating, reading, writing, deleting, archiving files
- **Directory Operations**: Creating directories, checking file existence  
- **Template Management**: Copying templates, creating template files from resources
- **File I/O**: Writing AI-generated content to files, reading file contents
- **State Checks**: Verifying file existence for condition evaluation

### What the AI Does (DO NOT include in MCP Actions):
- **Intelligent Content Generation**: Creating text content, processing information
- **External Service Integration**: Gathering GitHub comments, fetching data
- **User Communication**: All interactions described in response files
- **Decision Making**: Choosing what to do based on conditions
- **Content Processing**: Analyzing content, extracting information

### Key Insight: Response Files Show Post-MCP Activities
The response files are vetted and describe what the AI does AFTER the MCP has completed its file operations. If something is described in the response file, it's likely an AI responsibility, not an MCP action.

## Process for Each Table

1. **Examine Current Action Column**: Understand what operations are described
2. **Read Corresponding Response Files**: For each transition ID, check the response file to see what the AI handles vs what requires file operations
3. **Add MCP Actions Column**: Insert new column beside existing Action column
4. **Populate MCP Actions**: Include only the file system operations and mechanical tasks
5. **Use "-" for No MCP Actions**: When only state changes or AI communication occurs

## Table Format

Transform tables from:
```
| ID | Current State | Trigger | Condition | Next State | Action | Response |
```

To:
```  
| ID | Current State | Trigger | Condition | Next State | Action | MCP Actions | Response |
```

## Formatting Guidelines - IMPORTANT

- **Keep or Add Numbering**: MCP actions are algorithmic and happen in sequence
- If the original Action column has numbers (1), (2), etc., preserve that numbering in MCP Actions
- If no numbering exists but multiple MCP actions occur, add numbering: (1), (2), (3)
- Use present tense verbs (e.g., "Creates", "Reads", "Archives")
- Be specific about file paths
- Don't mention state updates or response returns (implicit)

## Example Transformations

**With existing numbering:**
- **Action**: "(1) Create `.ai/task/context.md` from template; (2) Copy `.ai/plan-guide.md` from MCP resources if it doesn't exist"
- **MCP Actions**: "(1) Creates `.ai/task/context.md` with template; (2) Copies `.ai/plan-guide.md` from MCP resources if missing"

**Adding numbering for multiple actions:**
- **Action**: "Create `.ai/task/comments.md` empty file; Update state to PR_GATHERING_COMMENTS_G"
- **MCP Actions**: "(1) Creates `.ai/task/comments.md` file"

**Single action (no numbering needed):**
- **Action**: "Load review-task-results.md content into memory"
- **MCP Actions**: "Reads `.ai/task/review-task-results.md` content"

**No MCP actions:**
- **Action**: "No state change"  
- **MCP Actions**: "-"

## Start Here

Begin with the **Context Gathering Phase Transitions** table (around line 207). Add the MCP Actions column to that table, then **STOP** and wait for user review.

Remember: Only update ONE table at a time, then stop for user review.