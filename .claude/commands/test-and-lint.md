# Test and Lint Command

## Purpose

This command instructs Claude to run the complete test suite AND linting after any implementation work, and importantly - **fix any issues found, not just report them**.

## Instructions for Claude

When this command is invoked:

### 1. Run Full Test Suite

- Execute `npm test` (full suite, not partial patterns)
- **If tests fail:**
  - Identify ALL failing tests with specific error details
  - **Automatically analyze and fix the failing tests**
  - Do not just report - actually implement the fixes
  - Re-run tests to verify fixes work
  - Continue until all tests pass

### 2. Run Linting

- Execute `npm run lint` to check for code quality issues
- **If linting fails:**
  - Run `npm run lint -- --fix` to automatically fix formatting issues
  - If auto-fix doesn't resolve all issues, manually fix remaining problems
  - Do not just report - actually implement the fixes
  - Re-run linting to verify all issues are resolved
  - Continue until linting passes with 0 errors

### 3. Provide Clear Status

- Report final status: ✅ All tests passing (X/X) ✅ Linting clean (0 errors)
- If either still fails after attempted fixes, explain what requires manual intervention

## Key Principle

**Don't just identify errors - fix them!**

This command exists because Claude sometimes runs partial tests or reports issues without fixing them. The goal is to ensure the codebase is always in a clean, working state after any changes.

## Usage

Invoke this command after:

- Implementing new features
- Fixing bugs
- Refactoring code
- Adding new transitions or tests
- Any significant code changes

## Expected Outcome

- 100% test pass rate
- 0 linting errors
- Clean, consistent codebase ready for commits
