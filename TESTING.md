# Testing Guide

## Overview

Comprehensive test suite covering authentication, generation endpoints, and validation with consistent error handling.

## Test Structure

```
tests/
├── auth.test.ts          # Authentication tests (signup/login)
├── generate.test.ts      # Generation endpoint tests
├── validation.test.ts    # Validation and error handling tests
├── setup.ts             # Test configuration
└── README.md            # Detailed test documentation
```

## Quick Start

```bash
# Install dependencies (if not already done)
pnpm install

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage Summary

### ✅ Auth Tests
- Registration: happy path, duplicate email, invalid inputs
- Login: valid credentials, wrong password, invalid email

### ✅ Generation Tests  
- Create: success, model overload (20%), unauthorized access
- List: pagination, authentication, empty results

### ✅ Validation Tests
- Error structure consistency across all endpoints
- HTTP status codes (400, 401, 404, 200, 201)
- Input validation (email, password, prompt, image)
- Required fields validation

## Key Features

- **Consistent Error Structure**: All errors return `{ code, message }` format
- **Proper HTTP Codes**: 400 (bad request), 401 (unauthorized), 404 (not found), 200/201 (success)
- **Database Cleanup**: Tests clean up after themselves
- **Sequential Execution**: Tests run one at a time to avoid conflicts
- **Real Integration**: Tests use actual database and services

## Example Test Run

```bash
$ npm test

PASS  tests/auth.test.ts
  Auth Routes
    POST /v1/auth/register
      ✓ should register a new user successfully (150ms)
      ✓ should return 400 if email is already taken (45ms)
      ✓ should return 400 if email is invalid (30ms)
    POST /v1/auth/login
      ✓ should login successfully with valid credentials (120ms)
      ✓ should return 401 with incorrect password (80ms)

PASS  tests/generate.test.ts
  Generation Routes
    POST /v1/generate
      ✓ should create a generation successfully (1200ms)
      ✓ should return 401 without authentication (25ms)
    GET /v1/generate
      ✓ should get user generations successfully (60ms)

PASS  tests/validation.test.ts
  Validation and Error Handling
    ✓ should return consistent error structure (40ms)
    ✓ should return correct HTTP status codes (35ms)

Test Suites: 3 passed, 3 total
Tests:       25 passed, 25 total
```

## Notes

- Tests use the same database as development (ensure it's running)
- Model overload test is probabilistic (20% chance)
- All sensitive data is cleaned up after tests
- Tests verify both success and failure scenarios
