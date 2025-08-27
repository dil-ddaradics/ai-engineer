# AI Engineer

A Model Context Protocol (MCP) server that provides intelligent workflow orchestration for AI-assisted software development. AI Engineer helps developers collaborate effectively with AI assistants through a guided, state-driven workflow that includes context gathering, planning, task execution, and PR review processes.

## ✨ Key Features

- **🧙‍♂️ Spell-based Workflow**: Six intuitive commands (Accio, Expecto, Reparo, Reverto, Finite, Lumos) guide you through development phases
- **📋 Smart State Management**: Maintains workflow state across sessions using file-based persistence
- **🔄 Demo System**: 11 pre-configured demo states let you explore the complete workflow
- **🎯 Context-Aware**: Integrates with Atlassian (Jira/Confluence) for enhanced context gathering
- **📝 Structured Planning**: Breaks down complex tasks into manageable acceptance criteria
- **🔍 PR Review Workflow**: Systematic approach to handling pull request feedback
- **🧪 CLI Management**: Powerful command-line interface for workflow management

## 🚀 Quick Start

### Installation

Install the AI Engineer MCP server:

```bash
npm install -g @dil-ddaradics/ai-engineer
```

### Configure Your AI Assistant

#### Claude Code

Add to your Claude Code settings:

```json
{
  "mcpServers": {
    "ai-engineer": {
      "command": "npx",
      "args": ["@dil-ddaradics/ai-engineer"],
      "env": {}
    }
  }
}
```

Or use the Claude Code CLI:

```bash
claude mcp install ai-engineer npx @dil-ddaradics/ai-engineer
```

#### Cursor

Add to your Cursor settings.json:

```json
{
  "mcp": {
    "servers": {
      "ai-engineer": {
        "command": "npx",
        "args": ["@dil-ddaradics/ai-engineer"]
      }
    }
  }
}
```

### Basic Usage

1. **Start a workflow**: Ask your AI assistant to cast "Accio" to begin
2. **Check current state**: Use "Lumos" to see where you are and what's available
3. **Navigate the workflow**: Use the available spells to progress through phases
4. **Get help**: Run `npx ai-engineer help` for detailed CLI usage

## 📖 Usage Guide

### CLI Commands

The AI Engineer CLI provides powerful workflow management:

```bash
# List all available demo states
npx ai-engineer list

# Set up a specific demo state
npx ai-engineer set 05-plan-ready

# Check current workflow state
npx ai-engineer current

# Reset workflow (clear all state)
npx ai-engineer reset

# Create backup of current state
npx ai-engineer backup

# Restore from backup
npx ai-engineer restore

# Show help information
npx ai-engineer help
```

### MCP Tools (Spells)

These tools are available in your AI assistant once the MCP server is configured:

- **🪄 Accio**: Advance workflow to the next step
- **⚡ Expecto**: Enrich plan with Atlassian resources (Jira/Confluence)
- **🔧 Reparo**: Initiate or continue PR review process
- **↩️ Reverto**: Exit PR review flow and return to previous state
- **🏁 Finite**: Return to plan editing phase
- **💡 Lumos**: Show current state and available actions

### Workflow Example

1. **Start**: Cast "Accio" to create initial context
2. **Plan**: Edit `.ai/task/context.md` and `.ai/task/plan.md`
3. **Execute**: Cast "Accio" to create and execute tasks
4. **Review**: Use "Reparo" to handle PR feedback
5. **Complete**: Continue until all acceptance criteria are met

## 🎭 Demo States

The AI Engineer includes 11 carefully crafted demo states that showcase the complete workflow progression. Each state represents a different phase of a software development project.

### Available Demo States

| State | Name | Description |
|-------|------|-------------|
| `01-empty` | **Empty Start** | Fresh directory - starting point for new projects |
| `02-context-gathering` | **Context Gathering** | Working on understanding project requirements |
| `03-context-complete` | **Context Complete** | Project context established, ready for planning |
| `04-planning` | **Planning** | Creating detailed project plan with acceptance criteria |
| `05-plan-ready` | **Plan Ready** | Complete plan ready for implementation |
| `06-setup-drafting` | **Setup Drafting** | Project setup in progress (TypeScript + Jest) |
| `07-setup-executed` | **Setup Executed** | TypeScript + Jest environment ready |
| `08-calculator-drafting` | **Calculator Drafting** | Implementation in progress |
| `09-calculator-executed` | **Calculator Executed** | Full implementation complete |
| `10-pr-review` | **PR Review** | Handling review feedback phase |
| `11-final-complete` | **Final Complete** | Production-ready state |

### Using Demo States

Demo states let you jump into any part of the workflow to explore and learn:

```bash
# Start from the beginning
npx ai-engineer set 01-empty

# Jump to planning phase
npx ai-engineer set 05-plan-ready

# Explore PR review workflow
npx ai-engineer set 10-pr-review

# See the final result
npx ai-engineer set 11-final-complete
```

Each demo state includes:
- Pre-configured files (context, plans, tasks, etc.)
- Appropriate workflow state
- Realistic project progression
- Learning opportunities for that phase

### Demo Project: Calculator

The demo states follow the development of a TypeScript calculator project, including:
- **Requirements gathering** and context establishment
- **Planning** with acceptance criteria
- **Environment setup** (TypeScript, Jest, project structure)
- **Implementation** of calculator functionality
- **Testing** and validation
- **PR review** cycle with feedback handling
- **Production readiness** checklist

## 🔄 State Machine Documentation

AI Engineer uses a sophisticated state machine to guide the development workflow through four main phases.

### Workflow Phases

#### 1. Context Gathering Phase
- **Purpose**: Understand what needs to be built
- **Key Files**: `.ai/task/context.md`
- **Activities**: Requirements analysis, stakeholder input, project scope
- **Outcome**: Clear understanding of project goals

#### 2. Planning Phase  
- **Purpose**: Break down work into manageable pieces
- **Key Files**: `.ai/task/plan.md`
- **Activities**: Define acceptance criteria, create task breakdown
- **Outcome**: Structured plan with measurable goals

#### 3. Achievement Phase
- **Purpose**: Execute planned work
- **Key Files**: `.ai/task/task.md`, `.ai/task/task-results.md`
- **Activities**: Implementation, testing, validation
- **Outcome**: Working software that meets acceptance criteria

#### 4. PR Review Phase
- **Purpose**: Handle feedback and improve code quality
- **Key Files**: `.ai/task/comments.md`, `.ai/task/review-task.md`
- **Activities**: Address review comments, refine implementation
- **Outcome**: Code ready for production

### State Management

The system maintains state through:

- **`.ai/task/state.json`**: Authoritative state record with history
- **File presence**: Secondary indicators (context.md, plan.md, task.md, etc.)
- **State validation**: Automatic error detection and recovery
- **Persistence**: State survives across sessions and AI context resets

### Spell Behavior by Phase

| Spell | Context Gathering | Planning | Achievement | PR Review |
|-------|------------------|----------|-------------|-----------|
| **Accio** | Create context → Create plan → Execute task | Continue tasks → Complete | Archive review → Return |
| **Expecto** | Enhance context with Atlassian data | Enhance plan with Atlassian data | ❌ Blocked | ❌ Blocked |
| **Reparo** | ❌ Blocked (no code yet) | Start PR review | Start PR review | ❌ Blocked (already in review) |
| **Reverto** | ❌ Blocked (not in review) | ❌ Blocked (not in review) | ❌ Blocked (not in review) | Exit review → Return to previous |
| **Finite** | ❌ Blocked (must complete context) | No-op (already editing) | Return to planning | ❌ Blocked (must complete review) |
| **Lumos** | Show current state and next steps | Show current state and next steps | Show current state and next steps | Show current state and next steps |

### Error Handling & Recovery

The state machine includes comprehensive error detection:

- **Missing Files**: Detects when expected files are absent
- **State Corruption**: Handles inconsistent state conditions  
- **Recovery Actions**: Provides clear paths to fix errors
- **Graceful Degradation**: Continues working even with partial failures

### Transition Validation

Every state transition includes:
- **Pre-conditions**: File existence and content validation
- **Actions**: File creation, archiving, and content processing
- **Post-conditions**: State consistency verification
- **User Feedback**: Clear explanation of what happened and next steps

## 🏗️ Implementation Details

### Architecture Overview

AI Engineer is built as a Model Context Protocol (MCP) server with three main components:

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Assistant  │───▶│   MCP Server     │───▶│  File System    │
│ (Claude/Cursor) │    │                  │    │   (.ai/task/)   │
└─────────────────┘    │  ┌─────────────┐ │    └─────────────────┘
                       │  │ State       │ │
                       │  │ Machine     │ │    ┌─────────────────┐
                       │  └─────────────┘ │───▶│   Templates     │
                       │  ┌─────────────┐ │    │ & Responses     │
                       │  │ Tools       │ │    └─────────────────┘
                       │  │ (Spells)    │ │
                       │  └─────────────┘ │    ┌─────────────────┐
                       │  ┌─────────────┐ │───▶│   CLI System    │
                       │  │ Resources   │ │    │                 │
                       │  └─────────────┘ │    └─────────────────┘
                       └──────────────────┘
```

### MCP Server Components

#### Tools (Spells)
- **TypeScript Implementation**: `/src/tools/spells.ts`
- **Stateless Design**: Each tool delegates to the state machine
- **Error Handling**: Comprehensive error catching and user-friendly messages
- **Validation**: Input validation and pre-condition checking

#### Resources
- **Template System**: Provides markdown templates for workflow files
- **Dynamic Content**: Context-aware resource generation
- **Atlassian Integration**: URL extraction and reference management

#### State Machine
- **Core Engine**: `/src/state-machine/stateMachine.ts`
- **96 Transitions**: Complete coverage of all state-spell combinations
- **File Operations**: Atomic file creation, archiving, and management
- **History Tracking**: Maintains transition history for debugging

### File Structure

```
ai-engineer/
├── src/
│   ├── index.ts                 # MCP server entry point
│   ├── cli/                     # CLI implementation
│   │   ├── cli.ts              # Command handlers
│   │   └── index.ts            # CLI management
│   ├── state-machine/          # Core state machine
│   │   ├── stateMachine.ts     # Main state machine logic
│   │   ├── stateRepository.ts  # State persistence
│   │   ├── fileSystem.ts       # File operations
│   │   ├── transitions/        # State transition handlers
│   │   └── utils/              # Helper utilities
│   ├── tools/                  # MCP tools (spells)
│   │   └── spells.ts          # Tool implementations
│   └── resources/              # MCP resources
│       └── spells.ts          # Resource implementations
├── demos/                      # Demo state configurations
│   ├── 01-empty/              # Starting point
│   ├── 05-plan-ready/         # Planning complete
│   ├── 09-calculator-executed/ # Implementation complete
│   └── 11-final-complete/     # Production ready
├── state-machine/             # State machine documentation
│   ├── state-machine.md       # Complete specification
│   ├── responses/             # Response templates
│   └── templates/             # File templates
└── docs/                      # Additional documentation
    ├── how-to-build-an-mcp-server.md
    └── how-to-test-an-mcp-server.md
```

### State Persistence

The system uses a hybrid approach for state management:

#### Primary State (`.ai/task/state.json`)
```json
{
  "current_state": "GATHER_EDITING_CONTEXT",
  "context": {
    "origin_phase": "GATHER",
    "confirmation_needed": false
  },
  "history": [
    {
      "timestamp": "2025-08-27T10:30:00Z",
      "transition": "GATHER_NEEDS_CONTEXT → GATHER_EDITING_CONTEXT",
      "trigger": "Accio"
    }
  ]
}
```

#### Secondary Indicators
- **Context Phase**: `.ai/task/context.md` existence
- **Planning Phase**: `.ai/task/plan.md` existence and content
- **Achievement Phase**: `.ai/task/task.md` and `.ai/task/task-results.md`
- **PR Review Phase**: `.ai/task/comments.md` and `.ai/task/review-task.md`

#### File Archiving
Completed work is automatically archived to maintain history:
- **Tasks**: `.ai/task/tasks/task-{name}-{date}/`
- **PR Reviews**: `.ai/task/pr-reviews/pr-review-{date}/`

This architecture ensures the system is robust, maintainable, and provides a great developer experience while working with AI assistants.