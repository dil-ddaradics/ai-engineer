## MANDATORY ACTION FOR AI

**EXECUTE IMMEDIATELY:**

1. Check if Atlassian MCP is available by calling `mcp__atlassian__atlassianUserInfo` with no parameters
2. Process the provided list of Atlassian URLs from the `.ai/task/context.md` file
3. If Atlassian MCP available: fetch content from each URL using appropriate MCP functions
4. If Atlassian MCP available: enrich `.ai/task/context.md` file with relevant information from these resources
5. If Atlassian MCP available: add processed URLs to `.ai/task/.atlassian-refs` file (one URL per line)
6. If Atlassian MCP unavailable: add note to context.md explaining integration unavailability
7. **DELIVERABLE**: Enhanced context.md file with Atlassian information or documentation of integration unavailability

Atlassian URLs to process:
[ATLASSIAN_URLS_PLACEHOLDER]

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
