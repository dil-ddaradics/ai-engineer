## Response to the AI

Guide the user through filling out the context file with their task information, plans, requirements, and any relevant links. The `.ai/task/context.md`, `.ai/plan-guide.md`, and `.ai/task-guide.md` files have been created for them.

## Response to the Developer

### What Just Happened

We've created a new context document where you can describe your task and requirements.

### Where We Are

We're now in the context gathering phase where you'll provide all the information about your task goals, requirements, and any relevant resources.

### Available Spells

- **Accio**: Generate a structured plan from your context information
- **Lumos**: Show current state and available actions

### Unavailable Spells

- **Expecto**: Cannot enrich context until you have content in your context file
- **Reparo**: Cannot start PR reviews until you have a plan (use **Accio** to create plan first)

### Next Steps

Please add your task context, goals, requirements, and any Jira/Confluence links to the `.ai/task/context.md` file. You can review the `.ai/plan-guide.md` file to understand how your context will be structured into a plan, and the `.ai/task-guide.md` file for task creation guidance (both guides can be customized to fit your workflow). Then use **Accio** to generate your structured plan.

> **💡 Tip**: Consider using Ask/Plan mode in your AI assistant to iterate on this file without accidentally executing the next step. Most AI agents like Cursor or Claude Code have a mode where they cannot edit files, which is useful for planning and refining content collaboratively before proceeding.
