[] The Action column should only contain what the MCP does, sometimes all it does is changing the state or returning the response but we should not mix things. If there are nothing done, just put - in the action column, otherwise only things that the MCP will do. We can rename the action column to MCP actions.

[] Add task-guide.md handling
I want to have a task-guide.md also. I want this to be handled the same way the plan-guide.md, meaning created at the same time but only give instructiosn to the user before the first task creation, when they accio after having their plan file to create tasks, or every time before a new task is created. The AI should mention that the task-guide.md exists and is used to create tasks and they can modify it.

[] Create templates in the state-machine/templates folder for:
context.md
plan.md
plan-guide.md
task.md
task-guide.md
task-results.md
comments.md
review-task.md
Have I missed any files?

[] Add beginning all lumos with System explanation by concatenating as a feature when we start implementing.