## MANDATORY ACTION FOR AI

**EXECUTE IMMEDIATELY:**
1. Read the `.ai/task/context.md` and `.ai/plan-guide.md` files to understand requirements
2. Check if Atlassian MCP is available by calling `mcp__atlassian__atlassianUserInfo` with no parameters
3. Process the provided Atlassian URLs from context.md file based on MCP availability
4. If Atlassian MCP available: fetch content from each URL and add processed URLs to `.ai/task/.atlassian-refs` file
5. If Atlassian MCP unavailable: copy URLs to separate section in generated plan for later processing
6. Generate structured `.ai/task/plan.md` file using plan-guide.md guidelines with clear acceptance criteria
7. **DELIVERABLE**: Complete plan.md file with organized information and processed Atlassian content (if available)

Atlassian URLs to process:
[ATLASSIAN_URLS_PLACEHOLDER]

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
