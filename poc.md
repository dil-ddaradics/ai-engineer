# Micro POC: MCP Orchestrator (No State)

A **tiny proof of concept** that demonstrates MCP-driven orchestration without a state machine. It shows that:

* The user (via the AI agent) calls a single MCP tool: `advance`.
* On first call, MCP **creates** `.ai/task/task.md` and **instructs** both the Coding Agent and the user what to do next.
* On subsequent call(s), MCP **reads** `.ai/task/task.md` and **instructs** the Coding Agent to execute what’s written there, while also giving the user a brief heads-up of what will happen.

> Assumptions: You already have a working TypeScript “hello world” MCP server. This guide only adds the minimal functionality for the POC.

---

## What this proves (and nothing more)

* MCP can **orchestrate** by producing:

    * a short **message to the user**, and
    * a concrete **instruction list to the Coding Agent**.
* Persistence is **implicit**: the presence or absence of `.ai/task/task.md` toggles the flow.
* No Atlassian/GitHub integration, no complex transitions, and no state file.

---

## File effects (POC-only)

* Creates or reads: `.ai/task/task.md`
* Appends simple status lines to: `.ai/task/task.log`

Both files are committed like any other file if you use git.

---

## Tool: `advance`

### Input

```json
{
  "reason": "string (free text; why we’re advancing)",
  "idempotency_key": "string (optional)"
}
```

### Output (shape)

```json
{
  "mode": "draft|execute",
  "next_instruction": {
    "message_to_user": "string",
    "instructions_to_coding_agent": ["string", "string"],
    "files_readonly": [".ai/task/task.md"],
    "files_to_write": [".ai/task/task.log"]
  }
}
```

* `mode: "draft"` → MCP **created** a fresh `task.md` and asks the user + Coding Agent to collaborate on writing it.
* `mode: "execute"` → MCP **found** an existing `task.md`, summarized it, and asks the Coding Agent to carry it out.

---

## `task.md` template (auto-created on first call)

```md
# Task: <give this a short name>

## Goal
<!-- One sentence explaining the outcome. -->

## Steps
- <!-- Step 1: Keep it simple and safe. -->
- <!-- Step 2: Add one or two more steps. -->

## Validation
- <!-- How will we check it worked? -->
```

> Keep it tiny. This POC is about orchestration, not complex execution.

---

## Coding Agent contract (POC)

When `mode === "draft"`:

* Explain to the user how to fill `task.md`.
* Offer to write or refine the steps in collaboration.

When `mode === "execute"`:

* Open `.ai/task/task.md`.
* Execute each step **literally and safely**.
* After each step, append a status line to `.ai/task/task.log`:

    * `OK - <step short text>` or
    * `BLOCKED - <reason>` (and ask the user for clarification).
* Do **not** perform unrelated changes.

---

## Implementation (drop-in TypeScript)

> Add this to your existing MCP server. If your server already creates a `Server`, just copy the helper functions and the `server.tool("advance", ...)` block. Adjust imports/paths as needed.

```ts
import { Server } from "@modelcontextprotocol/sdk/server";
import fs from "node:fs";
import path from "node:path";

// --- tiny FS helpers ---------------------------------------------------------
const ROOT = path.join(process.cwd(), ".ai", "task");
const PATH_TASK = path.join(ROOT, "task.md");
const PATH_LOG  = path.join(ROOT, "task.log");

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeIfMissing(p: string, content: string) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, content);
}

function readOrEmpty(p: string) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

function appendLog(line: string) {
  ensureDir(ROOT);
  fs.appendFileSync(PATH_LOG, `${new Date().toISOString()} ${line}\n`);
}

// --- task template -----------------------------------------------------------
const TASK_TEMPLATE = `# Task: <give this a short name>

## Goal
<!-- One sentence explaining the outcome. -->

## Steps
- <!-- Step 1: Keep it simple and safe. -->
- <!-- Step 2: Add one or two more steps. -->

## Validation
- <!-- How will we check it worked? -->
`;

// --- tiny summarizer (best-effort) ------------------------------------------
function summarizeTask(md: string) {
  const titleMatch = md.match(/^#\s*Task:\s*(.*)$/m);
  const title = titleMatch?.[1]?.trim() || "(untitled task)";
  const stepsSection = md.split(/\n##\s*Steps\s*\n/i)[1] || "";
  const steps = stepsSection.split(/\n##\s*/)[0]
    .split(/\n/)
    .map(s => s.trim())
    .filter(s => s.startsWith("-") || /^\d+\)/.test(s));
  const firstStep = steps[0]?.replace(/^[-\d\)\s]+/, "").trim();
  return { title, firstStep, stepsCount: steps.length };
}

// --- add the tool ------------------------------------------------------------
export function registerOrchestratorPOC(server: Server) {
  server.tool("advance", {
    description: "POC: orchestrate by drafting or executing a task.md.",
    inputSchema: {
      type: "object",
      properties: {
        reason: { type: "string" },
        idempotency_key: { type: "string" }
      },
      required: ["reason"]
    }
  }, async ({ reason }) => {
    ensureDir(ROOT);

    // DRAFT MODE: create task.md if missing
    if (!fs.existsSync(PATH_TASK)) {
      writeIfMissing(PATH_TASK, TASK_TEMPLATE);
      appendLog("DRAFT: created task.md");

      return {
        mode: "draft",
        next_instruction: {
          message_to_user: "I created `.ai/task/task.md`. Please describe a tiny task under **## Steps** and say 'advance' when ready.",
          instructions_to_coding_agent: [
            "Open `.ai/task/task.md`.",
            "Explain to the user how to fill **Goal**, **Steps**, and **Validation**.",
            "Offer to draft or refine the steps collaboratively.",
            "Avoid making unrelated changes."
          ],
          files_readonly: [".ai/task/task.md"],
          files_to_write: [".ai/task/task.log"]
        }
      };
    }

    // EXECUTE MODE: task.md exists → summarize and instruct coding agent
    const md = readOrEmpty(PATH_TASK);
    const { title, firstStep, stepsCount } = summarizeTask(md);

    appendLog(`EXECUTE: detected task.md with ${stepsCount} step(s)`);

    return {
      mode: "execute",
      next_instruction: {
        message_to_user: `I\u2019ll execute the task \"${title}\". First step: ${firstStep || "(unspecified)"}. I\u2019ll keep a short log in .ai/task/task.log.`,
        instructions_to_coding_agent: [
          "Open `.ai/task/task.md`.",
          "Perform each step under **## Steps** literally and safely.",
          "After each step, append to `.ai/task/task.log`: `OK - <step>` or `BLOCKED - <reason>`.",
          "If a step is ambiguous, ask the user and continue once clarified.",
          "Do not make changes unrelated to the listed steps."
        ],
        files_readonly: [".ai/task/task.md"],
        files_to_write: [".ai/task/task.log"]
      }
    };
  });
}
```

> If your server is a single file that already calls `server.start()`, import and call `registerOrchestratorPOC(server)` right after creating the `Server`.

---

## How to wire it into your hello world server

1. **Import and register**

   ```ts
   import { Server } from "@modelcontextprotocol/sdk/server";
   import { registerOrchestratorPOC } from "./orchestrator-poc"; // path as needed

   const server = new Server({ name: "hello-world-with-orchestrator", version: "0.0.1" });
   registerOrchestratorPOC(server);
   server.start();
   ```

2. **Run your MCP server** (as usual for your hello world setup).

3. **From the AI chat**, say: "advance" → the agent calls the `advance` tool.

    * Response `mode: "draft"` → `task.md` is created and the agent tells the user how to fill it.

4. **Collaborate on `task.md`**

    * Either the AI edits the file per user guidance, or the user edits directly.

5. **Say: "advance" again**

    * Response `mode: "execute"` → the agent summarizes what will happen, executes steps, and appends to `task.log`.

6. **Review** `.ai/task/task.log` to confirm step-by-step execution notes.

---

## Minimal manual test script

1. Delete `.ai/task/` if it exists.
2. Call `advance` → expect:

    * `mode = draft`
    * `.ai/task/task.md` exists
3. Add 1–2 steps under `## Steps`.
4. Call `advance` → expect:

    * `mode = execute`
    * A friendly summary to the user
    * Clear instructions to the Coding Agent
5. Perform one step and write a log line manually to simulate the agent.
6. Repeat step 4 to verify it remains in execute mode and continues guiding.

---

## Notes / Extensibility ideas (optional later)

* Add a trivial `reset` tool that deletes `.ai/task/task.md` to restart the POC.
* Add a tiny `append_log` tool so the Coding Agent can report progress through MCP (instead of direct FS writes).
* Add a `validate_task` helper to check that `## Steps` is non-empty before switching to execute messaging.

---

## Hand-off summary (tell this to your AI agent)

* Call `advance`.
* If you see `mode: "draft"`, guide the user to fill `.ai/task/task.md`.
* Once the user is ready, call `advance` again.
* If you see `mode: "execute"`, briefly tell the user what will happen, then carry out each step in `task.md` and write progress lines to `.ai/task/task.log`.
* Ask for clarification whenever a step is ambiguous. Keep changes narrowly scoped to the listed steps.
