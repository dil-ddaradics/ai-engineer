# AI Engineer State Machine Implementation Tasks

## Overview

Implementation plan for the complete AI Engineering state machine system with spell-based workflow management.

## Key Reference Files

**Before starting implementation, review these files for complete context:**

- `state-machine/state-machine.md` - Contains all state definitions and transition tables
- `state-machine/implementation-plan.md` - Contains detailed architecture and implementation guidance
- Current MCP server at `src/` will be extended with new spell-based tools/resources

## Prerequisites

- [ ] Configure jest for TypeScript tests in package.json (update testMatch pattern to include .ts files)
- [ ] Configure ts-jest for proper TypeScript test execution
- [ ] Create sample test file `src/sample.test.ts` to verify ts-jest configuration works
- [ ] Run sample test: `npm run test`
- [ ] Run linting verification: `npm run lint`
- [ ] Remove sample test file after verification

## Step 1: MCP Layout with Spell Tools

### 1.1 Create Spell Infrastructure

- [ ] Create `src/resources/spells.ts` with Lumos resource (making it extendable for future spells)
- [ ] Create `src/tools/spells.ts` with spell tools (Accio, Expecto, Reparo, Reverto, Finite)
- [ ] Tools/resources will have placeholder implementations initially
- [ ] Update `src/tools/index.ts` to register spell tools
- [ ] Update `src/resources/index.ts` to register spell resources

### 1.2 TypeScript Testing (Following mcp.test.js pattern)

- [ ] Create `src/tools/spells.test.ts` using MCP Inspector pattern from mcp.test.js
- [ ] Create `src/resources/spells.test.ts` using MCP Inspector pattern
- [ ] Test tool/resource registration and basic functionality with placeholder responses
- [ ] **Testing command**: `npm run test`
- [ ] **Linting command**: `npm run lint`

## Step 2: Base State Machine Infrastructure

### 2.1 Core Types and Interfaces

- [ ] Create `src/state-machine/types.ts` with:
  - StateName union type (all 33 states)
  - Spell union type
  - StateContext interface
  - TransitionResult interface
  - Transition interface
  - FileSystem interface
  - StateRepository interface
  - StateMachine interface

### 2.2 Core State Machine (Internal Infrastructure)

- [ ] Create `src/state-machine/fileSystem.ts`
  - NodeFileSystem class implementation
  - File operations: exists, read, write, delete, archive
  - Path resolution and directory creation
  - Add `src/state-machine/fileSystem.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

- [ ] Create `src/state-machine/stateRepository.ts`
  - JsonFileStateRepository class
  - State persistence to `.ai/task/state.json`
  - Load, save, initialize methods
  - Add `src/state-machine/stateRepository.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

- [ ] Create `src/state-machine/stateMachine.ts`
  - StateMachineImpl class with single `executeSpell(spell: Spell)` function
  - Spell execution logic
  - Transition finding and execution
  - State history management
  - State machine is NOT exposed as MCP tool/resource - it's internal infrastructure
  - Add `src/state-machine/stateMachine.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

### 2.3 Utility Modules

- [ ] Create `src/state-machine/utils/responseUtils.ts`
  - getResponse() function
  - processResponse() function with placeholder replacement
  - Add `src/state-machine/utils/responseUtils.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

- [ ] Create `src/state-machine/utils/templateUtils.ts`
  - getTemplate() function
  - processTemplate() function
  - writeTemplate() function
  - Add `src/state-machine/utils/templateUtils.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

- [ ] Create `src/state-machine/utils/planUtils.ts`
  - hasAcceptanceCriteria() function
  - extractFirstAcceptanceCriteria() function
  - Add `src/state-machine/utils/planUtils.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

- [ ] Create `src/state-machine/utils/fileUtils.ts`
  - extractAtlassianUrls() function
  - Other file operation helpers
  - Add `src/state-machine/utils/fileUtils.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

### 2.4 Build System Testing

- [ ] Add tests for existing build scripts (build-responses.ts, build-templates.ts, prebuild.ts)
- [ ] Verify script functionality and generated output
- [ ] Test prebuild system generates proper constants
- [ ] **Testing command**: `npm run test`
- [ ] **Linting command**: `npm run lint`

### 2.5 Entry Pointst

- [ ] Create `src/state-machine/index.ts`
  - Export factory function for state machine creation
  - Export core types
  - Integration point for MCP server (internal use only)
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

### 2.6 Integration Layer

- [ ] Bind state machine's `executeSpell()` function to all spell tools/resources
- [ ] Each spell tool calls `stateMachine.executeSpell('Accio')` etc.
- [ ] Lumos resource calls `stateMachine.executeSpell('Lumos')`
- [ ] Update spell tools/resources from Step 1 to use state machine
- [ ] Test integration between MCP tools/resources and state machine
- [ ] **Testing command**: `npm run test`
- [ ] **Linting command**: `npm run lint`

## Step 3: Transition Implementation System

### 3.1 Implementation Command

- [ ] Create `.claude/commands/implement-next-transition.md` with:
  - Logic to read `state-machine/implementation-plan.md`
  - Logic to read `state-machine/state-machine.md`
  - Parser to find transition tables
  - Logic to identify unimplemented transitions
  - Code generation for transition implementations
  - Stop mechanism for manual review

### 3.2 Transition Module Structure

- [ ] Create transition module files:
  - `src/state-machine/transitions/gatherTransitions.ts`
  - `src/state-machine/transitions/achieveTransitions.ts`
  - `src/state-machine/transitions/prTransitions.ts`
  - `src/state-machine/transitions/errorTransitions.ts`
  - `src/state-machine/transitions/universalTransitions.ts`
  - `src/state-machine/transitions/index.ts` (exports all)
  - State machine handles all transition logic internally
  - Spell tools/resources remain simple wrappers around executeSpell()

### 3.3 Transition Testing

- [ ] Add test files for each transition module:
  - `src/state-machine/transitions/gatherTransitions.test.ts`
  - `src/state-machine/transitions/achieveTransitions.test.ts`
  - `src/state-machine/transitions/prTransitions.test.ts`
  - `src/state-machine/transitions/errorTransitions.test.ts`
  - `src/state-machine/transitions/universalTransitions.test.ts`
  - **Testing command**: `npm run test`
  - **Linting command**: `npm run lint`

## Step 4: Remove POC Implementation

### 4.1 Clean Up Legacy Code

- [ ] Remove existing orchestrator tools (advance, reset, append_log) from `src/tools/orchestrator.ts`
- [ ] Remove orchestrator tool registrations from `src/tools/index.ts`
- [ ] Remove orchestrator tests from `test/orchestrator.test.js`
- [ ] Clean up any POC-related code that's no longer needed
- [ ] Verify MCP server works with only the new spell-based tools/resources
- [ ] **Testing command**: `npm run test`
- [ ] **Linting command**: `npm run lint`

## Key Architecture Notes

- State machine is internal infrastructure that exposes single `executeSpell(spell)` function
- MCP spell tools/resources are simple wrappers that call the state machine
- No state machine components are directly exposed as MCP tools/resources
- All tests use `npm run test` command
- Follow mcp.test.js pattern for MCP integration testing
- All tests should be co-located with implementation files
- Use TypeScript with strict typing throughout
- Follow immutable state transition patterns
- Implement comprehensive error handling
- Generate TypeScript constants from markdown files
- Maintain existing project conventions
