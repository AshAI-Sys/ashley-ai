-- Add missing email verification columns to User table
-- This will fix the "email_verified column does not exist" error

-- Check if columns exist first and add them if missing
ALTER TABLE User ADD COLUMN email_verified BOOLEAN DEFAULT 0;
ALTER TABLE User ADD COLUMN email_verification_token TEXT;
ALTER TABLE User ADD COLUMN email_verification_expires DATETIME;
ALTER TABLE User ADD COLUMN email_verification_sent_at DATETIME;
