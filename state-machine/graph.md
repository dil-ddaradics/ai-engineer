# AI Engineer State Machine Diagram

This diagram shows all states in the AI Engineer workflow state machine and their primary transitions.

```mermaid
stateDiagram-v2
    %% Define the main workflow states
    state "Context Gathering" as contextPhase {
        GATHER_NEEDS_CONTEXT --> GATHER_EDITING_CONTEXT : Accio
        GATHER_EDITING_CONTEXT --> GATHER_EDITING : Accio
        GATHER_EDITING --> ACHIEVE_TASK_DRAFTING : Accio
    }
    
    state "Task Achievement" as achievePhase {
        ACHIEVE_TASK_DRAFTING --> ACHIEVE_TASK_EXECUTED : Accio
        ACHIEVE_TASK_EXECUTED --> ACHIEVE_TASK_DRAFTING : Accio (continue)
        ACHIEVE_TASK_DRAFTING --> ACHIEVE_COMPLETE : Accio (all done)
        ACHIEVE_COMPLETE --> ACHIEVE_COMPLETE : Accio
    }
    
    %% Define PR Review states with G/A variants
    state "PR Review (from Gather)" as prGatherPhase {
        state "PR_GATHERING_COMMENTS_G" as PG_COMMENTS_G
        state "PR_REVIEW_TASK_DRAFT_G" as PG_DRAFT_G
        state "PR_APPLIED_PENDING_ARCHIVE_G" as PG_ARCHIVE_G
        state "PR_CONFIRM_RESTART_COMMENTS_G" as PG_CONFIRM_C_G
        state "PR_CONFIRM_RESTART_TASK_G" as PG_CONFIRM_T_G
        
        PG_COMMENTS_G --> PG_DRAFT_G : Accio
        PG_DRAFT_G --> PG_ARCHIVE_G : Accio
        PG_ARCHIVE_G --> GATHER_EDITING : Accio
        
        %% Confirmation states
        PG_CONFIRM_C_G --> PG_COMMENTS_G : Reparo
        PG_CONFIRM_T_G --> PG_COMMENTS_G : Reparo
        PG_CONFIRM_C_G --> GATHER_EDITING : Reverto
        PG_CONFIRM_T_G --> GATHER_EDITING : Reverto
    }
    
    state "PR Review (from Achieve)" as prAchievePhase {
        state "PR_GATHERING_COMMENTS_A" as PA_COMMENTS_A
        state "PR_REVIEW_TASK_DRAFT_A" as PA_DRAFT_A
        state "PR_APPLIED_PENDING_ARCHIVE_A" as PA_ARCHIVE_A
        state "PR_CONFIRM_RESTART_COMMENTS_A" as PA_CONFIRM_C_A
        state "PR_CONFIRM_RESTART_TASK_A" as PA_CONFIRM_T_A
        
        PA_COMMENTS_A --> PA_DRAFT_A : Accio
        PA_DRAFT_A --> PA_ARCHIVE_A : Accio
        PA_ARCHIVE_A --> ACHIEVE_TASK_DRAFTING : Accio
        
        %% Confirmation states
        PA_CONFIRM_C_A --> PA_COMMENTS_A : Reparo
        PA_CONFIRM_T_A --> PA_COMMENTS_A : Reparo
        PA_CONFIRM_C_A --> ACHIEVE_TASK_DRAFTING : Reverto
        PA_CONFIRM_T_A --> ACHIEVE_TASK_EXECUTED : Reverto
    }
    
    %% Define Error States
    state "Error States" as errorStates {
        state "File Missing Errors" as fileMissingErrors {
            ERROR_TASK_MISSING
            ERROR_TASK_RESULTS_MISSING
            ERROR_PLAN_MISSING
            ERROR_CONTEXT_MISSING
            ERROR_COMMENTS_MISSING_G
            ERROR_COMMENTS_MISSING_A
            ERROR_REVIEW_TASK_MISSING_G
            ERROR_REVIEW_TASK_MISSING_A
            ERROR_REVIEW_TASK_RESULTS_MISSING_G
            ERROR_REVIEW_TASK_RESULTS_MISSING_A
        }
    }
    
    %% Main workflow transitions between phases
    contextPhase --> achievePhase
    
    %% PR Review entry points (Reparo)
    GATHER_EDITING --> PG_COMMENTS_G : Reparo
    GATHER_EDITING --> PG_CONFIRM_C_G : Reparo (existing comments)
    GATHER_EDITING --> PG_CONFIRM_T_G : Reparo (existing task)
    
    ACHIEVE_TASK_DRAFTING --> PA_COMMENTS_A : Reparo
    ACHIEVE_TASK_EXECUTED --> PA_COMMENTS_A : Reparo
    ACHIEVE_COMPLETE --> PA_COMMENTS_A : Reparo
    
    ACHIEVE_TASK_DRAFTING --> PA_CONFIRM_C_A : Reparo (existing comments)
    ACHIEVE_TASK_EXECUTED --> PA_CONFIRM_C_A : Reparo (existing comments)
    ACHIEVE_COMPLETE --> PA_CONFIRM_C_A : Reparo (existing comments)
    
    ACHIEVE_TASK_DRAFTING --> PA_CONFIRM_T_A : Reparo (existing task)
    ACHIEVE_TASK_EXECUTED --> PA_CONFIRM_T_A : Reparo (existing task)
    ACHIEVE_COMPLETE --> PA_CONFIRM_T_A : Reparo (existing task)
    
    %% PR Review exit points (Reverto)
    PG_COMMENTS_G --> GATHER_EDITING : Reverto
    PG_DRAFT_G --> GATHER_EDITING : Reverto
    
    PA_COMMENTS_A --> ACHIEVE_TASK_DRAFTING : Reverto
    PA_DRAFT_A --> ACHIEVE_TASK_DRAFTING : Reverto
    PA_COMMENTS_A --> ACHIEVE_TASK_EXECUTED : Reverto (with results)
    PA_DRAFT_A --> ACHIEVE_TASK_EXECUTED : Reverto (with results)
    
    %% Error state transitions (Accio for recovery)
    ERROR_TASK_MISSING --> ACHIEVE_TASK_DRAFTING : Accio
    ERROR_TASK_RESULTS_MISSING --> ACHIEVE_TASK_DRAFTING : Accio
    ERROR_PLAN_MISSING --> GATHER_NEEDS_CONTEXT : Accio
    ERROR_CONTEXT_MISSING --> GATHER_EDITING_CONTEXT : Accio
    ERROR_COMMENTS_MISSING_G --> PG_COMMENTS_G : Accio
    ERROR_COMMENTS_MISSING_A --> PA_COMMENTS_A : Accio
    ERROR_REVIEW_TASK_MISSING_G --> PG_DRAFT_G : Accio
    ERROR_REVIEW_TASK_MISSING_A --> PA_DRAFT_A : Accio
    ERROR_REVIEW_TASK_RESULTS_MISSING_G --> PG_DRAFT_G : Accio
    ERROR_REVIEW_TASK_RESULTS_MISSING_A --> PA_DRAFT_A : Accio
    
    %% Universal Finite transitions (return to plan editing)
    ACHIEVE_TASK_DRAFTING --> GATHER_EDITING : Finite
    ACHIEVE_COMPLETE --> GATHER_EDITING : Finite
    ERROR_TASK_MISSING --> GATHER_EDITING : Finite
    ERROR_TASK_RESULTS_MISSING --> GATHER_EDITING : Finite
    
    %% Error state connections from main states (when conditions fail)
    ACHIEVE_TASK_DRAFTING --> ERROR_TASK_MISSING : missing task.md
    ACHIEVE_TASK_EXECUTED --> ERROR_TASK_RESULTS_MISSING : missing results
    GATHER_EDITING --> ERROR_PLAN_MISSING : missing plan.md
    GATHER_EDITING_CONTEXT --> ERROR_CONTEXT_MISSING : missing context.md
    PG_COMMENTS_G --> ERROR_COMMENTS_MISSING_G : missing comments
    PA_COMMENTS_A --> ERROR_COMMENTS_MISSING_A : missing comments
    PG_DRAFT_G --> ERROR_REVIEW_TASK_MISSING_G : missing review task
    PA_DRAFT_A --> ERROR_REVIEW_TASK_MISSING_A : missing review task
    PG_ARCHIVE_G --> ERROR_REVIEW_TASK_RESULTS_MISSING_G : missing results
    PA_ARCHIVE_A --> ERROR_REVIEW_TASK_RESULTS_MISSING_A : missing results
    
    %% Add notes for special spells
    note1 as "Lumos: Shows current state (available in all states)"
    note2 as "Expecto: Enriches from Atlassian (only in GATHER states)"
    
    %% Style different types of states
    classDef gatherState fill:#e1f5fe
    classDef achieveState fill:#f3e5f5
    classDef prState fill:#fff3e0
    classDef errorState fill:#ffebee
    classDef confirmState fill:#f1f8e9
    
    class GATHER_NEEDS_CONTEXT,GATHER_EDITING_CONTEXT,GATHER_EDITING gatherState
    class ACHIEVE_TASK_DRAFTING,ACHIEVE_TASK_EXECUTED,ACHIEVE_COMPLETE achieveState
    class PG_COMMENTS_G,PG_DRAFT_G,PG_ARCHIVE_G,PA_COMMENTS_A,PA_DRAFT_A,PA_ARCHIVE_A prState
    class PG_CONFIRM_C_G,PG_CONFIRM_T_G,PA_CONFIRM_C_A,PA_CONFIRM_T_A confirmState
    class ERROR_TASK_MISSING,ERROR_TASK_RESULTS_MISSING,ERROR_PLAN_MISSING,ERROR_CONTEXT_MISSING,ERROR_COMMENTS_MISSING_G,ERROR_COMMENTS_MISSING_A,ERROR_REVIEW_TASK_MISSING_G,ERROR_REVIEW_TASK_MISSING_A,ERROR_REVIEW_TASK_RESULTS_MISSING_G,ERROR_REVIEW_TASK_RESULTS_MISSING_A errorState
```

## State Categories

### Main Workflow States (Blue)
- **GATHER_NEEDS_CONTEXT**: Initial state, no context exists
- **GATHER_EDITING_CONTEXT**: Context file exists, being edited
- **GATHER_EDITING**: Plan file exists, being refined
- **ACHIEVE_TASK_DRAFTING**: Task being created/refined
- **ACHIEVE_TASK_EXECUTED**: Task executed, results ready
- **ACHIEVE_COMPLETE**: All acceptance criteria met

### PR Review States (Orange)
**From Gather Phase (G variants):**
- **PR_GATHERING_COMMENTS_G**: Collecting PR comments
- **PR_REVIEW_TASK_DRAFT_G**: Creating review task
- **PR_APPLIED_PENDING_ARCHIVE_G**: Review applied, ready to archive

**From Achieve Phase (A variants):**
- **PR_GATHERING_COMMENTS_A**: Collecting PR comments
- **PR_REVIEW_TASK_DRAFT_A**: Creating review task  
- **PR_APPLIED_PENDING_ARCHIVE_A**: Review applied, ready to archive

### Confirmation States (Green)
- **PR_CONFIRM_RESTART_COMMENTS_[G/A]**: Confirm overwriting existing comments
- **PR_CONFIRM_RESTART_TASK_[G/A]**: Confirm overwriting existing review task

### Error States (Red)
- **ERROR_TASK_MISSING**: task.md missing when expected
- **ERROR_TASK_RESULTS_MISSING**: task-results.md missing when expected
- **ERROR_PLAN_MISSING**: plan.md missing when expected
- **ERROR_CONTEXT_MISSING**: context.md missing when expected
- **ERROR_COMMENTS_MISSING_[G/A]**: comments.md missing when expected
- **ERROR_REVIEW_TASK_MISSING_[G/A]**: review-task.md missing when expected
- **ERROR_REVIEW_TASK_RESULTS_MISSING_[G/A]**: review-task-results.md missing when expected

## Key Spells

- **Accio**: Advances workflow to next step
- **Expecto**: Enriches plan from Atlassian resources (GATHER states only)
- **Reparo**: Initiates or continues PR review process
- **Reverto**: Exits PR review flow (PR states only)
- **Finite**: Returns to plan editing (GATHER_EDITING)
- **Lumos**: Shows current state and available actions (all states)