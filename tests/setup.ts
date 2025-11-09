// Test setup file
// Set test timeout
jest.setTimeout(10000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
process.env.JWT_ACCESS_EXPIRATION_MINUTES = '30';
process.env.JWT_REFRESH_EXPIRATION_DAYS = '30';
