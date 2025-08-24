## Response to the AI

You have been provided with a list of Atlassian URLs from the `.ai/task/context.md` file that have not been processed yet:

[ATLASSIAN_URLS_PLACEHOLDER]

First, check if the Atlassian MCP is available using this approach:
1. Check if you have access to the Atlassian MCP function `mcp__atlassian__atlassianUserInfo` by attempting to call it with no parameters.
2. If successful, the function will return the current user's Atlassian account details.
3. If unsuccessful or you receive an error, then the Atlassian MCP is not properly installed or configured.

Based on Atlassian MCP availability:
- If Atlassian MCP is available:
  1. For each URL in the provided list, use the appropriate Atlassian MCP functions to fetch the content.
  2. Enrich the `.ai/task/context.md` file with relevant information from these Atlassian resources.
  3. After successfully processing each URL, add it to the `.ai/task/.atlassian-refs` file (one URL per line).
  4. Use the "Atlassian Integration Available" response to the developer.

- If Atlassian MCP is not available:
  1. Add a note to the `.ai/task/context.md` file explaining that Atlassian integration is not available.
  2. Use the "Atlassian Integration Unavailable" response to the developer.

## Response to the Developer

### Atlassian Integration Available Response:

### What Just Happened
I've enriched your context with information from the Atlassian resources you referenced.

### Where We Are
We're in the context editing phase, where we're building up information about your project from various sources including Jira and/or Confluence.

### Available Spells
- **Accio**: Generate a structured plan from your enriched context
- **Expecto**: Further enrich the context with additional Atlassian resources (if more are referenced)
- **Reparo**: Begin a PR review process
- **Lumos**: Show current state and available actions

### Next Steps
Review the enriched information I've added to your `.ai/task/context.md` file from your Atlassian resources. Then use **Accio** to generate your structured plan when you're ready.

### Atlassian Integration Unavailable Response:

### What Just Happened
I attempted to enrich the context with information from Atlassian resources, but the Atlassian integration is not available or configured.

### Where We Are
We're in the context editing phase, but without access to the Atlassian integration to pull in additional information.

### Available Spells
- **Accio**: Generate a structured plan from your current context
- **Expecto**: Attempt to enrich the context with Atlassian resources (requires configuration)
- **Reparo**: Begin a PR review process
- **Lumos**: Show current state and available actions

### Next Steps
To enable Atlassian integration:
1. Ensure you have valid Atlassian credentials
2. Configure the Atlassian integration for this environment
3. Try the **Expecto** spell again once configured

Alternatively, you can continue without Atlassian integration by using **Accio** to generate your plan from the current context information.