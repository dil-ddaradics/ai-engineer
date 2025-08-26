# AI Response Rewrite Progress

This file tracks the progress of updating "## Response to the AI" sections across all response files in `state-machine/responses/` folders.

## Folders to Process

- [x] achieve_blocked (3 files: AB1.md, AB2.md, AB3.md) - Already in correct format (no AI sections)
- [x] achieve_transitions (6 files: A1.md, A1b.md, A2.md, A2b.md, A3.md, A4.md) - Processed A1.md and A2.md
- [x] error_other (14 files: ER1.md through ER12.md) - Already in correct format (no AI sections)
- [x] error_recovery (9 files: R1.md through R9.md) - Processed R1.md, R2.md, R3.md, R5a.md, R5b.md, R6a.md, R8a.md
- [ ] finite_blocked (3 files: F3.md, F4.md, F5.md)
- [ ] finite_transitions (2 files: F1.md, F2.md)
- [ ] gather_blocked (5 files: GB1.md, GCB1.md, GCB2.md, GCB3.md, GCB4.md)
- [ ] gather_noop (6 files: GCN1.md, GCN2.md, GCN3.md, GN1.md, GN2.md, GN3.md)
- [ ] gather_transitions (9 files: G1.md through G5.md, GC1.md, GC2.md, GC2-no-urls.md, GC2b.md)
- [ ] lumos_transitions (24 files: L1.md through L24.md)
- [ ] pr_blocked (6 files: PB1.md through PB6.md)
- [ ] pr_confirm (5 files: C1.md, C2.md, C3a.md, C3b.md, C3c.md, C3d.md)
- [ ] pr_transitions (8 files: P1.md, P1b.md, P2.md, P2b.md, P3.md, P3b.md, P4a.md, P4b.md)
- [ ] reparo_transitions (6 files: A5a.md, A5b.md, PR1.md, PR2.md, PR3.md, PR4.md)
- [ ] reverto_transitions (3 files: V1.md, V2a.md, V2b.md)
- [ ] universal_expecto (6 files: E1b.md, E2.md, E3.md, E3b.md, E4.md, E4b.md)

## Transformation Goal

Transform sections from:

```markdown
## Response to the AI

[generic instruction text]
```

To:

```markdown
## MANDATORY ACTION FOR AI

**EXECUTE IMMEDIATELY:**

1. [specific numbered action]
2. [specific numbered action]
3. [specific deliverable]
```

## Total Progress: 4/16 folders completed
