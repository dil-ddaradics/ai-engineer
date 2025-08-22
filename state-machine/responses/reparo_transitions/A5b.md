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
We've recovered from the error state and are now in the PR review flow where we need to address the feedback in these comments.

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
We've recovered from the error state but no PR comments were found to process.

### Available Spells
- **Reverto**: Cancel the PR review process and return to previous state
- **Lumos**: Show current state and available actions

### Next Steps
Since no PR comments were found, use Reverto to exit the PR review process and return to your previous workflow.