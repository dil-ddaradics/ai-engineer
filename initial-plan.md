This is an mcp that is designed to model good AI engineering and teach it to a developer by working together.
The core idea is that we have a set workflow that the AI guides by using this mcp.

The MCP exposes a tool for advancing the workflow step by step and only tells the agent the next step to keep it focused.

This is our process:

1. Gather acceptance criterias
2. Achieve acceptance criterias
3. Handle PR Reviews

# Gather acceptance criterias

If the plan file already exists we skip to <ITERATE>.

In this step we create a plan file which is a template with some comments that guide the user
in how to fill it out, e.g. by mentioning that they can paste in Jira tickets, or confluence pages.
Or any other useful information.
Then the user asks us to review the plan file and the mcp collects every jira task id and confluence page id and ask the AI agent to read them using the atlassian MCP and copy their content into the plan file and refactor the plan file to make it more structured.

<ITERATE>:
Then we ask the user to review the plan file and give us info on what need to be added or removed to it.
Basically this is where iteration happens, the user say something, we add it to the plan.
If the user says something like: We are finished please continue, we go to the next step.

# Achieve acceptance criterias

In this step we look at the plan file and give the user the next task that is not too complex and is a step in the right direction to achieve all acceptance criterias.
If the user says we are done we archive the plan.md file and continue to the next step.
Otherwise we write the next task into a task.md file.
Then we iterate this task.md file with the user by asking them for input and incorporating it into the task.md file.
If the user says something like: We are finished please continue, we go to the next step: Executing the task.
When the task is done, we ask the user if they want to expand on the acceptance criterias based on some new findings.
If they say yes we go back to the "Gather acceptance criterias" phase and do that again.
If they say no we go back to the beginning and offer a new task towards achieving the acceptance criterias.

# Handle PR Reviews

We ask the user if they want to answer PR comments. If yes:
We ask the AI to use the Github MCP to collect comments on the PR connected to the current branch.
We write all of those into a todos.md file line by line and ask the user to write their answer to each comment or delete those they don't want to answer.
When they say they are ready we solve all of those comments and answer comments where possible.

If no: We are finished.

This mcp is meant to guide a developer through a task from creation to implementation until finishing it.

It should have the following characteristics:
It persists the current state of the process.
It implements a state machine that only lets us progress with strict rules.
It should remedy the problem of an AI forgetting a complex workflow by exposing a single resource that the AI can ask for the next step.
The solution should ask the user for input through chat and write everything into files so the user can review those files.
The user can't directly modify files.
The MCP can only instruct the AI to do things, or ask the AI to relay things to the user.

# Implementation Details

## Storage and State Management
"I want to store everything in a folder called .ai/task. Lets use JSON, that can be parsed and validated with js and zod easily. I think a simpler approach with using classes that encapsulate state changes would work for now. We will cover everything with unit tests so we should be able to refactor later."

## File Management
"Use the .ai/task folder and everything should have a simple lower case file name, like plan.md, task.md, comments.md, etc."

## Atlassian Integration
"The mcp will gather the jira and confluence links, and asks the AI to use the Atlassian MCP server to gather the content of each link and save them to files link by link under ./ai/task/atlassian. Then also include a summary of what the AI learned from the content in the file we are working on. The general approach of this mcp is to 'know' what needs to be done and ask the AI Agent to do it. It will always need to tell the AI to communicate edge cases as well, for example if it does not have Atlassian MCP installed or can't reach jira or confluence links, tell the user to fix the Atlassian MCP. The MCP should provide some info on where the user can find guides on how to add the atlassian mcp."

## Plan Template Structure
"We will need to have a template that the AI and the user can understand yes. I am open to suggestions but we need an initial one."

## Task Selection Criteria
"It should be committed without breaking anything that already exists but small enough so its easy to review and reason about. Additionally it should have a single focus. For example a task setting up the project structure should not start implementing features. We might will need a separate doc just about guidance on how to select a next viable task. Essentially the MCP will do a lot of this: Tell the AI to do something and read some docs on how to do it properly. For example: Read the context.md and task-selection.md to figure out the next best task in order to get closer to our acceptance criterias."
