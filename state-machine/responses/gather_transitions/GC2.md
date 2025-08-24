## Response to the AI

You have been provided with a list of Atlassian URLs from the `.ai/task/context.md` file that have not been processed yet:

[ATLASSIAN_URLS_PLACEHOLDER]

Read the `.ai/task/context.md` and `.ai/plan-guide.md` files. 

First, check if the Atlassian MCP is available using this approach:
1. Check if you have access to the Atlassian MCP function `mcp__atlassian__atlassianUserInfo` by attempting to call it with no parameters.
2. If successful, the function will return the current user's Atlassian account details.
3. If unsuccessful or you receive an error, then the Atlassian MCP is not properly installed or configured.

Based on Atlassian MCP availability:
- If Atlassian MCP is available:
  1. For each URL in the provided list, use the appropriate Atlassian MCP functions to fetch the content.
  2. Integrate the information from these Atlassian resources during plan generation.
  3. After successfully processing each URL, add it to the `.ai/task/.atlassian-refs` file (one URL per line).

- If Atlassian MCP is not available:
  1. Copy the URLs to a separate section in the generated plan.md for later processing.

Generate a structured `.ai/task/plan.md` file based on the context.md content using the guidelines in plan-guide.md. Focus on creating clear acceptance criteria and organizing the information logically.

## Response to the Developer

### Atlassian Integration Available Response:

### What Just Happened
We've generated a structured plan document based on your context information, planning guidelines, and enriched it with information from your Atlassian resources.

### Where We Are
We're now in the planning phase where we can refine our structured plan and prepare to create tasks.

### Available Spells
- **Accio**: Move to task creation after reviewing the generated plan
- **Expecto**: Enrich our plan with additional information from Atlassian resources
- **Reparo**: Begin a PR review process
- **Lumos**: Show current state and available actions

### Next Steps
Review the generated `.ai/task/plan.md` file to ensure it accurately reflects your requirements. The plan has been enriched with information from your Atlassian resources. Use **Accio** to start creating tasks when you're ready.

### Atlassian Integration Unavailable Response:

### What Just Happened
We've generated a structured plan document based on your context information and planning guidelines, but the Atlassian integration is not available or configured.

### Where We Are
We're now in the planning phase where we can refine our structured plan and prepare to create tasks.

### Available Spells
- **Accio**: Move to task creation after reviewing the generated plan
- **Expecto**: Enrich our plan with Atlassian resources (requires configuration)
- **Reparo**: Begin a PR review process
- **Lumos**: Show current state and available actions

### Next Steps
To enable Atlassian integration:
1. Ensure you have valid Atlassian credentials
2. Configure the Atlassian integration for this environment
3. Try the **Expecto** spell again once configured

Alternatively, you can continue without Atlassian integration by using **Accio** to start creating tasks from your current plan.