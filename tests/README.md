# Test Suite

This directory contains comprehensive integration tests for the Modelia AI Studio Backend API.

## Test Coverage

### Auth Tests (`auth.test.ts`)
- **Registration (POST /v1/auth/register)**
  - ✅ Successful user registration
  - ✅ Duplicate email rejection
  - ✅ Invalid email format validation
  - ✅ Weak password rejection
  - ✅ Missing required fields validation

- **Login (POST /v1/auth/login)**
  - ✅ Successful login with valid credentials
  - ✅ Incorrect password handling
  - ✅ Non-existent user handling
  - ✅ Invalid email format validation
  - ✅ Missing password validation

### Generation Tests (`generate.test.ts`)
- **Create Generation (POST /v1/generate)**
  - ✅ Successful generation creation
  - ✅ Model overload simulation (20% chance)
  - ✅ Unauthorized access prevention
  - ✅ Invalid token rejection
  - ✅ Missing prompt validation
  - ✅ Prompt length validation (min 10 chars)
  - ✅ Invalid image format rejection
  - ✅ Optional fields handling

- **Get Generations (GET /v1/generate)**
  - ✅ Retrieve user's generations
  - ✅ Limit query parameter
  - ✅ Unauthorized access prevention
  - ✅ Empty results for new users
  - ✅ Descending order by creation date

### Validation Tests (`validation.test.ts`)
- **Error Response Structure**
  - ✅ Consistent error format for validation errors
  - ✅ Consistent error format for authentication errors
  - ✅ Consistent error format for not found errors
  - ✅ Consistent error format for business logic errors

- **HTTP Status Codes**
  - ✅ 400 for invalid input
  - ✅ 401 for missing/invalid authentication
  - ✅ 404 for non-existent routes
  - ✅ 201 for successful creation
  - ✅ 200 for successful GET requests

- **Input Validation**
  - ✅ Email format validation
  - ✅ Password strength validation
  - ✅ Prompt length validation (10-1000 chars)
  - ✅ Base64 image format validation
  - ✅ Required fields validation

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Configuration

- **Framework**: Jest with ts-jest
- **HTTP Testing**: Supertest
- **Test Environment**: Node.js
- **Database**: PostgreSQL (uses same DB as development, cleans up after tests)

## Notes

- Tests run sequentially (`--runInBand`) to avoid database conflicts
- Each test suite cleans up its data before and after execution
- The model overload test has a probabilistic nature (20% chance) and may occasionally not trigger
- All tests verify both success cases and error handling
- Error responses follow a consistent structure with `code` and `message` fields
