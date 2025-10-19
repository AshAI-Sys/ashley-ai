-- Test Database Initialization Script
-- This script is automatically run when the test database container starts

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE ashley_ai_test TO test_user;

-- Create test schemas (if needed)
-- CREATE SCHEMA IF NOT EXISTS test_schema;

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'Test database initialized successfully';
END $$;
