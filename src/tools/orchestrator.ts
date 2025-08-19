import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

// --- tiny FS helpers ---------------------------------------------------------
const ROOT = path.join(process.cwd(), ".ai", "task");
const PATH_TASK = path.join(ROOT, "task.md");
const PATH_LOG = path.join(ROOT, "task.log");

/**
 * Ensures a directory exists, creating it if necessary
 */
function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

/**
 * Writes content to a file if it doesn't already exist
 */
function writeIfMissing(p: string, content: string) {
  if (!fs.existsSync(p)) fs.writeFileSync(p, content);
}

/**
 * Reads file content or returns empty string if file doesn't exist
 */
function readOrEmpty(p: string) {
  return fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "";
}

/**
 * Appends a log entry with timestamp to the task log
 */
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
/**
 * Extracts summary information from a markdown task file
 */
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

/**
 * Interface for advance tool input parameters
 */
export interface AdvanceParams {
  reason: string;
}

/**
 * Tool implementation for the advance orchestrator
 */
export async function advanceTool({ reason }: AdvanceParams) {
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
        ]
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
      message_to_user: `I\u2019ll execute the task "${title}". First step: ${firstStep || "(unspecified)"}. I\u2019ll keep a short log in .ai/task/task.log.`,
      instructions_to_coding_agent: [
        "Open `.ai/task/task.md`.",
        "Perform each step under **## Steps** literally and safely.",
        "After each step, append to `.ai/task/task.log`: `OK - <step>` or `BLOCKED - <reason>`.",
        "If a step is ambiguous, ask the user and continue once clarified.",
        "Do not make changes unrelated to the listed steps."
      ]
    }
  };
}

/**
 * Schema for the advance tool input
 */
export const advanceSchema = {
  type: "object",
  properties: {
    reason: { type: "string" }
  },
  required: ["reason"]
};

/**
 * Schema for advance tool input using zod
 */
export const advanceInputSchema = {
  reason: z.string().describe("Free text; why we're advancing")
};

/**
 * Resets the orchestrator by deleting task.md
 */
export async function resetTool() {
  if (fs.existsSync(PATH_TASK)) {
    fs.unlinkSync(PATH_TASK);
    appendLog("RESET: deleted task.md");
  }
  
  return {
    message: "Reset complete. Task file has been deleted. Say 'advance' to start a new task."
  };
}

/**
 * Schema for the reset tool (no input required)
 */
export const resetSchema = {
  type: "object",
  properties: {},
  required: []
};

/**
 * Appends a log entry through the MCP tool
 */
export async function appendLogTool({ message }: { message: string }) {
  appendLog(message);
  
  return {
    message: `Log entry added: ${message}`
  };
}

/**
 * Schema for the append_log tool input
 */
export const appendLogSchema = {
  type: "object",
  properties: {
    message: { type: "string" }
  },
  required: ["message"]
};

/**
 * Schema for append_log tool input using zod
 */
export const appendLogInputSchema = {
  message: z.string().describe("Message to append to the log")
};