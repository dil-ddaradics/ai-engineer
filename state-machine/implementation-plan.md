# State Machine Implementation Plan

## Core Types and Interfaces

```typescript
// Core types for states and spells
type StateName = 
  | 'GATHER_NEEDS_PLAN' 
  | 'GATHER_EDITING'
  | 'ACHIEVE_TASK_DRAFTING'
  | 'ACHIEVE_TASK_EXECUTED'
  | 'ACHIEVE_COMPLETE'
  | 'PR_GATHERING_COMMENTS_G'
  | 'PR_GATHERING_COMMENTS_A'
  | 'PR_REVIEW_TASK_DRAFT_G'
  | 'PR_REVIEW_TASK_DRAFT_A'
  | 'PR_APPLIED_PENDING_ARCHIVE_G'
  | 'PR_APPLIED_PENDING_ARCHIVE_A'
  | 'PR_CONFIRM_RESTART_COMMENTS_G'
  | 'PR_CONFIRM_RESTART_COMMENTS_A'
  | 'PR_CONFIRM_RESTART_TASK_G'
  | 'PR_CONFIRM_RESTART_TASK_A'
  | 'ERROR_TASK_MISSING'
  | 'ERROR_TASK_RESULTS_MISSING'
  | 'ERROR_PLAN_MISSING'
  | 'ERROR_COMMENTS_MISSING_G'
  | 'ERROR_COMMENTS_MISSING_A'
  | 'ERROR_REVIEW_TASK_MISSING_G'
  | 'ERROR_REVIEW_TASK_MISSING_A'
  | 'ERROR_REVIEW_TASK_RESULTS_MISSING_G'
  | 'ERROR_REVIEW_TASK_RESULTS_MISSING_A';

type Spell = 'Accio' | 'Expecto' | 'Reparo' | 'Reverto' | 'Finite' | 'Lumos';

// State context - minimalist approach with just the current state
interface StateContext {
  currentState: StateName;
  // No cached file existence or other data
  // File system will be the source of truth
  // State transitions can store any needed information in state.json as needed
}

// Result returned by transition handlers
interface TransitionResult {
  nextState: StateName;
  response: string; // The final response string with any placeholders already replaced
  // File operations are handled by the handler function directly
}

// Core transition definition
interface Transition {
  id: string;
  sourceState: StateName;
  spell: Spell;
  // Condition is optional - if not provided, treated as always true
  condition?: (context: StateContext, fileSystem: FileSystem) => Promise<boolean>;
  handler: (context: StateContext, fileSystem: FileSystem) => Promise<TransitionResult>;
  description?: string;
}

// We don't need a separate State interface
// StateName enum already defines all possible states
// Any state metadata can be stored separately if needed

// Note: Blocked transitions are just regular transitions
// that return a specific response indicating the action is blocked

// File system abstraction
interface FileSystem {
  exists(path: string): Promise<boolean>;
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  delete(path: string): Promise<void>;
  archive(source: string, destination: string): Promise<void>;
}

// State repository for persistence
interface StateRepository {
  // Much simpler now that StateContext only contains currentState
  load(): Promise<StateContext>;
  save(state: StateContext): Promise<void>;
  initialize(): Promise<StateContext>;
}

// Main state machine interface
interface StateMachine {
  // Minimal interface - just execute spells
  executeSpell(spell: Spell): Promise<TransitionResult>;
}
```

## Implementation Principles

1. **TypeScript with Strict Typing**
   - Use string literal union types for states and spells
   - Leverage type system to catch errors at compile time
   - Enable strict null checks and no implicit any

2. **Immutability**
   - State transitions create new state objects
   - No direct mutation of state context
   - Use functional programming patterns where appropriate

3. **Testability**
   - Abstract file system operations for easier testing
   - Separate state logic from side effects
   - Make transitions pure functions where possible

4. **Modularity**
   - Group related transitions together
   - Separate response templates from transition logic
   - Use dependency injection for components

5. **Error Handling**
   - Robust error states and recovery paths
   - Graceful degradation when files are missing
   - Clear error messages in responses

## Architecture

### Components

1. **State Machine Core**
   - Central engine that processes state transitions
   - Maintains current state and context
   - Routes spells to appropriate transition handlers

2. **Transition Registry**
   - Holds all defined transitions
   - Provides lookup by source state and spell
   - Validates transition coverage (all state-spell combinations)

3. **File System Adapter**
   - Abstracts file operations
   - Handles file existence checks
   - Manages file creation, deletion, and archiving

4. **State Repository**
   - Persists state to disk
   - Loads state from disk
   - Handles initialization of new state

5. **Response Formatter**
   - Generates structured responses from templates
   - Provides consistent formatting
   - Supports different response formats

### Data Flow

1. User casts a spell (e.g., "Accio")
2. State machine looks up transitions for current state and spell
3. All matching transitions' conditions are checked using the FileSystem directly
4. The first transition with a passing condition is selected and its handler is executed
5. Handler performs file operations directly and returns new state and response
7. State is updated and persisted
8. Response is returned to user

## Testing Strategy

1. **Unit Testing**
   - Test each transition in isolation
   - Mock file system for deterministic tests
   - Verify state changes and responses

2. **Integration Testing**
   - Test complete workflows
   - Verify state persistence
   - Test error recovery paths

3. **Verification**
   - Validate all 96 state-spell combinations are covered
   - Check for consistent response formatting
   - Ensure all file operations are safe

## Example Implementation

```typescript
// Example of transition implementations
const gatherTransitions: Transition[] = [
  // G1: GATHER_NEEDS_PLAN + Accio -> GATHER_EDITING
  {
    id: "G1",
    sourceState: "GATHER_NEEDS_PLAN",
    spell: "Accio",
    // No condition specified - will always apply
    handler: async (context, fileSystem) => {
      // Directly perform file operations
      await fileSystem.write(".ai/task/plan.md", "# Plan\n\n## Acceptance Criteria\n\n- [ ] First criterion\n");
      
      // Load and process response
      const responseContent = await fileSystem.read("responses/gather_transitions/G1.md");
      
      return {
        nextState: "GATHER_EDITING",
        response: responseContent // Already processed with any needed replacements
      };
    }
  },
  
  // G2: GATHER_EDITING + Accio -> ACHIEVE_TASK_DRAFTING (when plan has ACs and task.md doesn't exist)
  {
    id: "G2",
    sourceState: "GATHER_EDITING",
    spell: "Accio",
    condition: async (context, fileSystem) => {
      // Check file existence directly from FileSystem
      const planExists = await fileSystem.exists(".ai/task/plan.md");
      const taskExists = await fileSystem.exists(".ai/task/task.md");
      
      // If plan exists, read it to check for acceptance criteria
      if (planExists) {
        const planContent = await fileSystem.read(".ai/task/plan.md");
        return hasAcceptanceCriteria(planContent) && !taskExists;
      }
      return false;
    },
    handler: async (context, fileSystem) => {
      // Read plan content to create task template
      const planContent = await fileSystem.read(".ai/task/plan.md");
      const taskTemplate = createTaskTemplate(planContent);
      
      // Directly write the file
      await fileSystem.write(".ai/task/task.md", taskTemplate);
      
      // Load response and replace any placeholders using helper function
      const responseContent = await loadResponse(
        fileSystem,
        "responses/gather_transitions/G2.md",
        {
          firstAcceptanceCriteria: extractFirstAcceptanceCriteria(planContent)
        }
      );
      
      return {
        nextState: "ACHIEVE_TASK_DRAFTING",
        response: responseContent
      };
    }
  },
  
  // G3: GATHER_EDITING + Accio -> GATHER_EDITING (when plan has no ACs)
  {
    id: "G3",
    sourceState: "GATHER_EDITING",
    spell: "Accio",
    condition: async (context, fileSystem) => {
      // Check if plan exists
      const planExists = await fileSystem.exists(".ai/task/plan.md");
      
      // If plan exists, read it to check for acceptance criteria
      if (planExists) {
        const planContent = await fileSystem.read(".ai/task/plan.md");
        return !hasAcceptanceCriteria(planContent);
      }
      return false;
    },
    handler: async (context, fileSystem) => {
      // Load response
      const responseContent = await fileSystem.read("responses/gather_noop/G3.md");
      
      return {
        nextState: "GATHER_EDITING", // No state change
        response: responseContent
      };
    }
  },
  
  // GB1: GATHER_NEEDS_PLAN + Reverto -> [BLOCKED] (Example of a blocked transition)
  {
    id: "GB1",
    sourceState: "GATHER_NEEDS_PLAN",
    spell: "Reverto",
    // No condition needed - will always apply
    handler: async (context, fileSystem) => {
      // Load blocked response
      const responseContent = await fileSystem.read("responses/gather_blocked/GB1.md");
      
      return {
        nextState: "GATHER_NEEDS_PLAN", // State doesn't change for blocked transitions
        response: responseContent // Special response for blocked transition
      };
    }
  }
];

// Helper function to check if plan content has acceptance criteria
function hasAcceptanceCriteria(planContent: string): boolean {
  // Look for checkbox markdown pattern: - [ ] or - [x]
  return /- \[[ x]\]/.test(planContent);
}

// Helper function to extract first acceptance criteria from plan content
function extractFirstAcceptanceCriteria(planContent: string): string {
  const match = planContent.match(/- \[[ x]\]\s*(.+)/);
  return match ? match[1] : "No acceptance criteria found";
}

// Helper function to load response and replace placeholders
async function loadResponse(fileSystem: FileSystem, responsePath: string, replacements?: Record<string, string>): Promise<string> {
  let responseContent = await fileSystem.read(responsePath);
  
  // Replace placeholders if provided
  if (replacements) {
    for (const [key, value] of Object.entries(replacements)) {
      responseContent = responseContent.replace(
        new RegExp(`{{${key}}}`, 'g'), 
        value
      );
    }
  }
  
  return responseContent;
}

// Example implementation of StateMachine
class StateMachineImpl implements StateMachine {
  private context: StateContext;
  private transitions: Transition[];
  private fileSystem: FileSystem;
  private stateRepository: StateRepository;
  
  constructor(fileSystem: FileSystem, stateRepository: StateRepository) {
    this.fileSystem = fileSystem;
    this.stateRepository = stateRepository;
    this.transitions = []; // Would be populated with all transitions
    this.context = { currentState: "GATHER_NEEDS_PLAN" };
  }
  
  async initialize(): Promise<void> {
    // Load state or initialize if not exists
    this.context = await this.stateRepository.load() || { currentState: "GATHER_NEEDS_PLAN" };
  }
  
  // Private method for finding valid transitions
  private async findValidTransition(spell: Spell): Promise<Transition | undefined> {
    // Find all transitions matching the current state and spell
    const matchingTransitions = this.transitions.filter(t => 
      t.sourceState === this.context.currentState && t.spell === spell
    );
    
    // Find the first transition whose condition passes (or has no condition)
    for (const transition of matchingTransitions) {
      // If no condition is specified, treat it as always true
      if (!transition.condition || await transition.condition(this.context, this.fileSystem)) {
        return transition;
      }
    }
    
    return undefined;
  }
  
  async executeSpell(spell: Spell): Promise<TransitionResult> {
    // Find a valid transition using the private method
    const transition = await this.findValidTransition(spell);
    
    if (!transition) {
      throw new Error(`No valid transition found for ${this.context.currentState} + ${spell}`);
    }
    
    // Execute the transition handler - file operations are performed inside the handler
    const result = await transition.handler(this.context, this.fileSystem);
    
    // Store the previous state for logging
    const oldState = this.context.currentState;
    
    // Update state
    this.context.currentState = result.nextState;
    
    // Save state
    await this.stateRepository.save(this.context);
    
    // Return the result (response is already processed inside handler)
    return result;
  }
}
```

## File Structure

```
/state-machine
  types.ts                # Core types and interfaces
  stateMachine.ts         # Main state machine implementation
  stateMachine.test.ts    # Tests for the state machine
  
  fileSystem.ts          # File system interface and implementation
  fileSystem.test.ts     # Tests for file system operations
  
  stateRepository.ts     # State persistence
  stateRepository.test.ts # Tests for state repository
  
  /transitions
    gatherTransitions.ts   # Transitions for GATHER phase
    achieveTransitions.ts  # Transitions for ACHIEVE phase
    prTransitions.ts       # Transitions for PR review phases
    errorTransitions.ts    # Error state transitions
    universalTransitions.ts # Transitions available from multiple states
    transitions.test.ts    # Tests for all transitions
  
  /utils
    responseUtils.ts       # Helper functions for response processing
    fileUtils.ts           # Helper functions for file operations
    planUtils.ts           # Helper functions for plan.md parsing
    utils.test.ts          # Tests for utilities
  
  index.ts                # Main entry point
  e2e.test.ts             # End-to-end tests
```

### Key Files and Their Purpose

1. **types.ts**
   - Defines core types like `StateName` and `Spell`
   - Contains interfaces for `StateContext`, `TransitionResult`, and `Transition`

2. **stateMachine.ts**
   - Implements the `StateMachine` interface
   - Handles finding and executing transitions
   - Manages state persistence

3. **fileSystem.ts**
   - Implementation of the `FileSystem` interface
   - Handles file operations with proper error handling

4. **stateRepository.ts**
   - Manages loading and saving state
   - Handles state initialization

5. **Transition Files**
   - Organized by workflow phase
   - Each file contains related transitions with their conditions and handlers
   - Clear separation of concerns between different parts of the workflow

6. **Utility Files**
   - Helper functions for common operations
   - Response processing and placeholder replacement
   - File operations and plan parsing

7. **Test Files**
   - Co-located with the implementation files they test
   - End-to-end tests for complete workflow scenarios

## Implementation Roadmap

1. **Core Framework**
   - Set up project structure
   - Implement core types and interfaces
   - Create state machine engine

2. **State and Transition Definitions**
   - Define all 16 states
   - Implement transition rules from spec
   - Create state guards

3. **File Operations**
   - Implement file system adapter
   - Create file templates
   - Handle file existence checks

4. **Response Templates**
   - Implement response formatter
   - Create templates for all response types
   - Add context-specific response generation

5. **Testing**
   - Create test framework
   - Write unit tests for all transitions
   - Implement integration tests

6. **Documentation**
   - Add JSDoc comments
   - Create usage examples
   - Document state machine behavior