/**
 * Demo Template Processing System
 *
 * Processes demo state templates and generates realistic .ai folder content
 * for different workflow states.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { DemoState } from './index';

export interface DemoTemplate {
  files: Record<string, string>;
  state: {
    currentState: string;
  };
}

/**
 * Template processor for generating demo states
 */
export class DemoTemplateProcessor {
  private readonly resourcesDir = path.join(__dirname, '..', 'resources', 'demo-states');

  /**
   * Generate a complete demo state in the .ai directory
   */
  async generateDemoState(demoState: DemoState): Promise<void> {
    const template = this.getTemplate(demoState.name);

    // Create .ai directory structure
    await fs.mkdir('.ai', { recursive: true });
    await fs.mkdir('.ai/task', { recursive: true });

    // Generate state.json
    const stateContent = JSON.stringify(
      {
        currentState: demoState.state,
      },
      null,
      2
    );
    await fs.writeFile('.ai/task/state.json', stateContent);

    // Generate files from template
    for (const [filePath, content] of Object.entries(template.files)) {
      const fullPath = path.join('.ai', filePath);
      const dir = path.dirname(fullPath);

      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });

      // Write file content
      await fs.writeFile(fullPath, content);
    }
  }

  /**
   * Get template for a specific demo state
   */
  private getTemplate(stateName: string): DemoTemplate {
    switch (stateName) {
      case 'gather-needs-context':
        return this.getGatherNeedsContextTemplate();

      case 'gather-editing-context':
        return this.getGatherEditingContextTemplate();

      case 'gather-editing':
        return this.getGatherEditingTemplate();

      case 'achieve-task-drafting':
        return this.getAchieveTaskDraftingTemplate();

      case 'achieve-task-executed':
        return this.getAchieveTaskExecutedTemplate();

      case 'achieve-complete':
        return this.getAchieveCompleteTemplate();

      case 'pr-gathering-comments':
        return this.getPrGatheringCommentsTemplate();

      case 'pr-review-task-draft':
        return this.getPrReviewTaskDraftTemplate();

      case 'error-plan-missing':
        return this.getErrorPlanMissingTemplate();

      default:
        throw new Error(`No template found for state: ${stateName}`);
    }
  }

  private getGatherNeedsContextTemplate(): DemoTemplate {
    return {
      files: {},
      state: { currentState: 'GATHER_NEEDS_CONTEXT' },
    };
  }

  private getGatherEditingContextTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
      },
      state: { currentState: 'GATHER_EDITING_CONTEXT' },
    };
  }

  private getGatherEditingTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
        'task/plan.md': `# Project Plan

## Summary

Modernize the user authentication system by implementing secure JWT-based authentication with email verification, password reset, and GDPR compliance features.

## Acceptance Criteria

- [ ] User registration endpoint with email verification
- [ ] Login endpoint with JWT token generation
- [ ] Password reset functionality via email
- [ ] Rate limiting on authentication endpoints
- [ ] GDPR-compliant user data handling
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation updated

## Technical Approach

### Phase 1: Core Authentication
- Replace existing session-based auth with JWT
- Implement secure password hashing with bcrypt
- Create registration and login endpoints

### Phase 2: Email Features
- Set up email service integration
- Build email verification workflow
- Implement password reset functionality

### Phase 3: Security & Compliance
- Add rate limiting middleware
- Implement GDPR data handling
- Security audit and testing

### Phase 4: Testing & Documentation
- Write comprehensive test suite
- Update API documentation
- Performance testing
`,
      },
      state: { currentState: 'GATHER_EDITING' },
    };
  }

  private getAchieveTaskDraftingTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
        'task/plan.md': `# Project Plan

## Summary

Modernize the user authentication system by implementing secure JWT-based authentication with email verification, password reset, and GDPR compliance features.

## Acceptance Criteria

- [ ] User registration endpoint with email verification
- [ ] Login endpoint with JWT token generation
- [ ] Password reset functionality via email
- [ ] Rate limiting on authentication endpoints
- [ ] GDPR-compliant user data handling
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation updated

## Technical Approach

### Phase 1: Core Authentication
- Replace existing session-based auth with JWT
- Implement secure password hashing with bcrypt
- Create registration and login endpoints

### Phase 2: Email Features
- Set up email service integration
- Build email verification workflow
- Implement password reset functionality

### Phase 3: Security & Compliance
- Add rate limiting middleware
- Implement GDPR data handling
- Security audit and testing

### Phase 4: Testing & Documentation
- Write comprehensive test suite
- Update API documentation
- Performance testing
`,
        'task/task.md': `---
task_name: 'implement-jwt-authentication'
---

# Task: Implement JWT Authentication Core

## Objective

Replace the existing session-based authentication with a secure JWT-based system. This includes user registration, login, and token validation middleware.

## Acceptance Criteria

This task works toward the following acceptance criteria from the plan:

- [ ] **AC**: User registration endpoint with email verification
- [ ] **AC**: Login endpoint with JWT token generation

## Steps

1. [ ] Install and configure JWT library (jsonwebtoken)
2. [ ] Create JWT utility functions (sign, verify, decode)
3. [ ] Implement user registration endpoint
4. [ ] Implement login endpoint with JWT generation
5. [ ] Create JWT validation middleware
6. [ ] Update existing protected routes to use JWT middleware
7. [ ] Remove old session-based authentication code

## Verification

This section is mandatory and must be run after all steps are completed:

- [ ] Registration endpoint returns 201 on success
- [ ] Login endpoint returns JWT token on valid credentials
- [ ] JWT middleware correctly validates tokens
- [ ] Protected routes reject invalid/missing tokens
- [ ] All existing authentication tests pass
- [ ] New JWT tests achieve >90% coverage
`,
      },
      state: { currentState: 'ACHIEVE_TASK_DRAFTING' },
    };
  }

  private getAchieveTaskExecutedTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
        'task/plan.md': `# Project Plan

## Summary

Modernize the user authentication system by implementing secure JWT-based authentication with email verification, password reset, and GDPR compliance features.

## Acceptance Criteria

- [ ] User registration endpoint with email verification
- [ ] Login endpoint with JWT token generation
- [ ] Password reset functionality via email
- [ ] Rate limiting on authentication endpoints
- [ ] GDPR-compliant user data handling
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation updated

## Technical Approach

### Phase 1: Core Authentication
- Replace existing session-based auth with JWT
- Implement secure password hashing with bcrypt
- Create registration and login endpoints

### Phase 2: Email Features
- Set up email service integration
- Build email verification workflow
- Implement password reset functionality

### Phase 3: Security & Compliance
- Add rate limiting middleware
- Implement GDPR data handling
- Security audit and testing

### Phase 4: Testing & Documentation
- Write comprehensive test suite
- Update API documentation
- Performance testing
`,
        'task/task.md': `---
task_name: 'implement-jwt-authentication'
---

# Task: Implement JWT Authentication Core

## Objective

Replace the existing session-based authentication with a secure JWT-based system. This includes user registration, login, and token validation middleware.

## Acceptance Criteria

This task works toward the following acceptance criteria from the plan:

- [ ] **AC**: User registration endpoint with email verification
- [ ] **AC**: Login endpoint with JWT token generation

## Steps

1. [x] Install and configure JWT library (jsonwebtoken)
2. [x] Create JWT utility functions (sign, verify, decode)
3. [x] Implement user registration endpoint
4. [x] Implement login endpoint with JWT generation
5. [x] Create JWT validation middleware
6. [x] Update existing protected routes to use JWT middleware
7. [x] Remove old session-based authentication code

## Verification

This section is mandatory and must be run after all steps are completed:

- [x] Registration endpoint returns 201 on success
- [x] Login endpoint returns JWT token on valid credentials
- [x] JWT middleware correctly validates tokens
- [x] Protected routes reject invalid/missing tokens
- [x] All existing authentication tests pass
- [x] New JWT tests achieve >90% coverage
`,
        'task/task-results.md': `# Task Results: Implement JWT Authentication Core

## Summary

Successfully implemented JWT-based authentication system to replace the existing session-based approach. All core functionality is working and tested.

## Changes Made

### New Files Created
- \`src/auth/jwt.js\` - JWT utility functions (sign, verify, decode)
- \`src/middleware/auth.js\` - JWT validation middleware
- \`src/routes/auth.js\` - Registration and login endpoints
- \`tests/auth/jwt.test.js\` - JWT utilities test suite
- \`tests/routes/auth.test.js\` - Authentication endpoints test suite

### Files Modified
- \`src/app.js\` - Updated to use new auth middleware
- \`src/routes/users.js\` - Updated protected routes
- \`src/routes/admin.js\` - Updated protected routes
- \`package.json\` - Added jsonwebtoken dependency

### Files Removed
- \`src/auth/session.js\` - Old session-based authentication
- \`src/middleware/session.js\` - Old session middleware

## Test Results

\`\`\`
Test Coverage Report:
- Statements: 94.2% (142/150)
- Branches: 91.7% (33/36)
- Functions: 96.8% (30/31)
- Lines: 94.2% (142/150)
\`\`\`

## Verification Status

- ✅ Registration endpoint returns 201 on success
- ✅ Login endpoint returns JWT token on valid credentials  
- ✅ JWT middleware correctly validates tokens
- ✅ Protected routes reject invalid/missing tokens
- ✅ All existing authentication tests pass
- ✅ New JWT tests achieve >90% coverage

## Performance Impact

- Average response time: 145ms (within 200ms requirement)
- Memory usage reduced by 15% (no server-side session storage)
- Supports horizontal scaling (stateless authentication)

## Next Steps

Ready to proceed with email verification functionality in next task.
`,
      },
      state: { currentState: 'ACHIEVE_TASK_EXECUTED' },
    };
  }

  private getAchieveCompleteTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
        'task/plan.md': `# Project Plan

## Summary

Modernize the user authentication system by implementing secure JWT-based authentication with email verification, password reset, and GDPR compliance features.

## Acceptance Criteria

- [x] User registration endpoint with email verification
- [x] Login endpoint with JWT token generation
- [x] Password reset functionality via email
- [x] Rate limiting on authentication endpoints
- [x] GDPR-compliant user data handling
- [x] Comprehensive test coverage (>90%)
- [x] Documentation updated

## Technical Approach

### Phase 1: Core Authentication ✅
- Replace existing session-based auth with JWT
- Implement secure password hashing with bcrypt
- Create registration and login endpoints

### Phase 2: Email Features ✅
- Set up email service integration
- Build email verification workflow
- Implement password reset functionality

### Phase 3: Security & Compliance ✅
- Add rate limiting middleware
- Implement GDPR data handling
- Security audit and testing

### Phase 4: Testing & Documentation ✅
- Write comprehensive test suite
- Update API documentation
- Performance testing
`,
      },
      state: { currentState: 'ACHIEVE_COMPLETE' },
    };
  }

  private getPrGatheringCommentsTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
        'task/plan.md': `# Project Plan

## Summary

Modernize the user authentication system by implementing secure JWT-based authentication with email verification, password reset, and GDPR compliance features.

## Acceptance Criteria

- [ ] User registration endpoint with email verification
- [ ] Login endpoint with JWT token generation
- [ ] Password reset functionality via email
- [ ] Rate limiting on authentication endpoints
- [ ] GDPR-compliant user data handling
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation updated

## Technical Approach

### Phase 1: Core Authentication
- Replace existing session-based auth with JWT
- Implement secure password hashing with bcrypt
- Create registration and login endpoints

### Phase 2: Email Features
- Set up email service integration
- Build email verification workflow
- Implement password reset functionality

### Phase 3: Security & Compliance
- Add rate limiting middleware
- Implement GDPR data handling
- Security audit and testing

### Phase 4: Testing & Documentation
- Write comprehensive test suite
- Update API documentation
- Performance testing
`,
        'task/comments.md': `# PR Review Comments

## Pull Request: Implement JWT Authentication System

**PR URL**: https://github.com/company/web-app/pull/245

### Comments Collected

#### @senior-dev (Review 1)
**File**: \`src/auth/jwt.js\`
**Line**: 15
**Comment**: Consider adding expiration time validation in the verify function. Current implementation doesn't check if the token is expired before the JWT library validation.

**File**: \`src/routes/auth.js\`  
**Line**: 32
**Comment**: The password validation should be more robust. Consider adding minimum length, special characters requirement.

#### @security-team (Review 2)
**File**: \`src/middleware/auth.js\`
**Line**: 8
**Comment**: ⚠️ SECURITY: The error messages are too verbose and could leak information. Generic "Authentication failed" is better than "Invalid token format".

**File**: \`src/auth/jwt.js\`
**Line**: 5
**Comment**: ⚠️ SECURITY: JWT secret should be loaded from environment variables, not hardcoded. This is a critical security issue.

#### @qa-lead (Review 3)
**General Comment**: Great work on the test coverage! A few suggestions:
- Add integration tests for the full auth flow
- Test edge cases like malformed requests
- Consider load testing for the rate limiting

**File**: \`tests/auth/jwt.test.js\`
**Line**: 45
**Comment**: Add test case for expired tokens to ensure proper error handling.

### Summary
- 🔴 **Critical**: JWT secret hardcoded (security risk)
- 🟡 **Important**: Error messages need to be less verbose
- 🟡 **Important**: Password validation improvements needed
- 🟢 **Minor**: Add expiration validation
- 🟢 **Minor**: Additional test cases needed

**Estimated effort**: 2-3 hours to address all comments
`,
      },
      state: { currentState: 'PR_GATHERING_COMMENTS_G' },
    };
  }

  private getPrReviewTaskDraftTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
        'task/plan.md': `# Project Plan

## Summary

Modernize the user authentication system by implementing secure JWT-based authentication with email verification, password reset, and GDPR compliance features.

## Acceptance Criteria

- [ ] User registration endpoint with email verification
- [ ] Login endpoint with JWT token generation
- [ ] Password reset functionality via email
- [ ] Rate limiting on authentication endpoints
- [ ] GDPR-compliant user data handling
- [ ] Comprehensive test coverage (>90%)
- [ ] Documentation updated

## Technical Approach

### Phase 1: Core Authentication
- Replace existing session-based auth with JWT
- Implement secure password hashing with bcrypt
- Create registration and login endpoints

### Phase 2: Email Features
- Set up email service integration
- Build email verification workflow
- Implement password reset functionality

### Phase 3: Security & Compliance
- Add rate limiting middleware
- Implement GDPR data handling
- Security audit and testing

### Phase 4: Testing & Documentation
- Write comprehensive test suite
- Update API documentation
- Performance testing
`,
        'task/comments.md': `# PR Review Comments

## Pull Request: Implement JWT Authentication System

**PR URL**: https://github.com/company/web-app/pull/245

### Comments Collected

#### @senior-dev (Review 1)
**File**: \`src/auth/jwt.js\`
**Line**: 15
**Comment**: Consider adding expiration time validation in the verify function. Current implementation doesn't check if the token is expired before the JWT library validation.

**File**: \`src/routes/auth.js\`  
**Line**: 32
**Comment**: The password validation should be more robust. Consider adding minimum length, special characters requirement.

#### @security-team (Review 2)
**File**: \`src/middleware/auth.js\`
**Line**: 8
**Comment**: ⚠️ SECURITY: The error messages are too verbose and could leak information. Generic "Authentication failed" is better than "Invalid token format".

**File**: \`src/auth/jwt.js\`
**Line**: 5
**Comment**: ⚠️ SECURITY: JWT secret should be loaded from environment variables, not hardcoded. This is a critical security issue.

#### @qa-lead (Review 3)
**General Comment**: Great work on the test coverage! A few suggestions:
- Add integration tests for the full auth flow
- Test edge cases like malformed requests
- Consider load testing for the rate limiting

**File**: \`tests/auth/jwt.test.js\`
**Line**: 45
**Comment**: Add test case for expired tokens to ensure proper error handling.

### Summary
- 🔴 **Critical**: JWT secret hardcoded (security risk)
- 🟡 **Important**: Error messages need to be less verbose
- 🟡 **Important**: Password validation improvements needed
- 🟢 **Minor**: Add expiration validation
- 🟢 **Minor**: Additional test cases needed

**Estimated effort**: 2-3 hours to address all comments
`,
        'task/review-task.md': `---
task_name: 'address-pr-security-feedback'
---

# Review Task: Address Security and Quality Feedback

## Objective

Address the critical security issues and quality improvements identified in the PR review for the JWT authentication system.

## Priority Issues to Address

### 🔴 Critical Security Issues
1. **JWT Secret Hardcoded** (src/auth/jwt.js:5)
   - Move JWT secret to environment variable
   - Update configuration loading
   - Document environment setup

2. **Verbose Error Messages** (src/middleware/auth.js:8)
   - Replace specific error messages with generic ones
   - Prevent information leakage
   - Log detailed errors server-side only

### 🟡 Important Improvements
3. **Password Validation** (src/routes/auth.js:32)
   - Add minimum length requirement (8+ characters)
   - Require special characters and numbers
   - Add password strength validation

4. **Expiration Validation** (src/auth/jwt.js:15)
   - Add explicit token expiration checks
   - Improve error handling for expired tokens

### 🟢 Quality Improvements
5. **Test Coverage Gaps** (tests/auth/jwt.test.js:45)
   - Add expired token test cases
   - Add integration tests for auth flow
   - Add edge case testing

## Implementation Steps

1. [ ] **Environment Configuration**
   - Add \`JWT_SECRET\` to .env template
   - Update jwt.js to read from process.env
   - Add validation for missing environment variables

2. [ ] **Security Hardening**
   - Implement generic error messages in middleware
   - Add server-side logging for detailed errors
   - Review all auth-related error responses

3. [ ] **Password Requirements**
   - Create password validation utility
   - Add validation to registration endpoint
   - Return helpful password requirements to client

4. [ ] **Enhanced Token Handling**
   - Add explicit expiration checks
   - Improve token validation error messages
   - Add token refresh logic (future consideration)

5. [ ] **Test Suite Expansion**
   - Add expired token test scenarios
   - Create integration test for full auth flow
   - Add malformed request edge cases
   - Test password validation scenarios

## Verification Checklist

- [ ] JWT secret loaded from environment variable
- [ ] No sensitive information in error messages
- [ ] Password validation enforces security requirements
- [ ] All token expiration scenarios handled correctly
- [ ] Test coverage maintains >90%
- [ ] Security team approval on changes
- [ ] All PR comments addressed and resolved

## Estimated Effort
**2-3 hours** total implementation time
`,
      },
      state: { currentState: 'PR_REVIEW_TASK_DRAFT_G' },
    };
  }

  private getErrorPlanMissingTemplate(): DemoTemplate {
    return {
      files: {
        'task/context.md': `# Task Context

## Overview

Building a new user authentication system for our web application. The current system is outdated and needs to be replaced with a modern, secure solution.

## Goals

- Implement secure user registration and login
- Add support for email verification
- Include password reset functionality
- Ensure GDPR compliance for user data

## Technical Requirements

- Use JWT tokens for authentication
- Implement rate limiting for security
- Support both email and username login
- Must work with existing user database schema
- Performance requirement: <200ms response time

## Resources

### Relevant Files/Documentation

- \`src/auth/\` - Existing authentication code
- \`src/models/User.js\` - User model
- \`config/database.js\` - Database configuration
`,
      },
      state: { currentState: 'ERROR_PLAN_MISSING' },
    };
  }
}
