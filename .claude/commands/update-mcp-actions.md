# Update State Machine Tables with MCP Condition and MCP Actions Columns

You are tasked with updating the transition tables in `state-machine/state-machine.md` to properly separate MCP (Model Context Protocol) operations from AI actions. This includes both condition evaluation and post-activation actions. This is critical for implementation clarity.

## Your Task

Work through the transition tables **one table at a time** and add both "MCP Condition" and "MCP Actions" columns. After updating each table, **STOP** and wait for user review before proceeding to the next table.

## Key Sources for Decision Making

1. **Current Condition Column**: Critical source of MCP operations needed to evaluate logical conditions
2. **Current Action Column**: Provides context about what operations are happening after condition is met
3. **Response Files**: Located in `state-machine/responses/` - these are vetted and describe what happens AFTER the MCP has completed its work
4. **Transition IDs**: Match response files (e.g., GC1 → `responses/gather_transitions/GC1.md`)

## Understanding AI vs MCP Responsibilities

### What the MCP Does:

#### For MCP Condition Column:
- **File Existence Checks**: Verifying if files exist to evaluate conditions
- **Content Reading**: Reading file contents to extract information for condition evaluation
- **Data Extraction**: Extracting URLs, parsing content, checking for patterns needed by conditions
- **Validation**: Checking file structure, content format, etc. required by conditional logic

#### For MCP Actions Column:
- **File Operations**: Creating, reading, writing, deleting, archiving files
- **Directory Operations**: Creating directories, managing file structure
- **Template Management**: Copying templates, creating template files from resources
- **File I/O**: Writing AI-generated content to files, reading file contents

### What the AI Does (DO NOT include in MCP Actions):
- **Intelligent Content Generation**: Creating text content, processing information
- **External Service Integration**: Gathering GitHub comments, fetching data
- **User Communication**: All interactions described in response files
- **Decision Making**: Choosing what to do based on conditions
- **Content Processing**: Analyzing content, extracting information

### Key Insight: Response Files Show Post-MCP Activities
The response files are vetted and describe what the AI does AFTER the MCP has completed its file operations. If something is described in the response file, it's likely an AI responsibility, not an MCP action.

## Process for Each Table

1. **Examine Current Condition Column**: Identify what MCP operations are needed to evaluate each condition
2. **Examine Current Action Column**: Understand what operations are described after condition is met
3. **Read Corresponding Response Files**: For each transition ID, check the response file to see what the AI handles vs what requires file operations
4. **Add MCP Condition Column**: Insert new column beside existing Condition column
5. **Add MCP Actions Column**: Insert new column beside existing Action column  
6. **Populate MCP Condition**: Include only the mechanical operations needed for condition evaluation
7. **Populate MCP Actions**: Include only the file system operations and mechanical tasks after condition is met
8. **Use "-" for No MCP Operations**: When only logical conditions or state changes occur without file operations

## Table Format

Transform tables from:
```
| ID | Current State | Trigger | Condition | Next State | Action | Response |
```

To:
```  
| ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
```

## Formatting Guidelines - IMPORTANT

- **Keep or Add Numbering**: MCP actions are algorithmic and happen in sequence
- If the original Action column has numbers (1), (2), etc., preserve that numbering in MCP Actions
- If no numbering exists but multiple MCP actions occur, add numbering: (1), (2), (3)
- Use present tense verbs (e.g., "Creates", "Reads", "Archives")
- Be specific about file paths
- Don't mention state updates or response returns (implicit)

## Example Transformations

**Example 1: Simple file creation (no condition evaluation)**
- **Condition**: "-"
- **MCP Condition**: "-"
- **Action**: "(1) Create `.ai/task/context.md` from template; (2) Copy `.ai/plan-guide.md` from MCP resources if it doesn't exist"
- **MCP Actions**: "(1) Creates `.ai/task/context.md` with template; (2) Copies `.ai/plan-guide.md` from MCP resources if missing"

**Example 2: Condition requires file operations + post-activation actions**
- **Condition**: "context.md exists AND Atlassian URLs found" 
- **MCP Condition**: "Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds some)"
- **Action**: "Read context.md, extract Atlassian URLs, provide URLs to AI for processing"
- **MCP Actions**: "Creates `.ai/task/plan.md` file"

**Example 3: Condition requires file operations + different post-activation actions**
- **Condition**: "context.md exists AND no Atlassian URLs found"
- **MCP Condition**: "Reads `.ai/task/context.md` content; Extracts Atlassian URLs from content (finds none)" 
- **Action**: "Read context.md, provide content to AI for plan generation"
- **MCP Actions**: "Creates `.ai/task/plan.md` file"

**Example 4: Simple condition check**
- **Condition**: "context.md missing"
- **MCP Condition**: "Checks `.ai/task/context.md` exists (missing)"
- **Action**: "State updated to ERROR_CONTEXT_MISSING"
- **MCP Actions**: "-"

**Example 5: No MCP operations**
- **Condition**: "-"
- **MCP Condition**: "-"  
- **Action**: "No state change"
- **MCP Actions**: "-"

## Key Insights from Implementation Experience

### Multiple Condition Paths Can Lead to Same MCP Actions
Examples 2 and 3 above show how different condition evaluation results (URLs found vs not found) can both require the same MCP action (creating plan.md file). This is because both transitions lead to the same end state (GATHER_EDITING) which requires the same file structure.

### Condition Column Analysis Is Critical  
Many conditions like "Atlassian URLs found" require significant MCP work (reading files, extracting data) that was previously overlooked when only analyzing the Action column.

## Table Selection Process

Before starting, identify which table needs updating:

1. **Check for existing columns**: Look for tables that already have both MCP Condition and MCP Actions columns in this format:
   ```
   | ID | Current State | Trigger | Condition | MCP Condition | Next State | Action | MCP Actions | Response |
   ```

2. **Find tables needing updates**: Look for tables with the old format missing these columns:
   ```
   | ID | Current State | Trigger | Condition | Next State | Action | Response |
   ```

3. **Skip processed tables**: If a table already has MCP Condition and MCP Actions columns, it's been processed - move to the next one.

## Start Here

Find the first table that needs both MCP Condition and MCP Actions columns added, then **STOP** and wait for user review after updating it.

Remember: Only update ONE table at a time, then stop for user review.