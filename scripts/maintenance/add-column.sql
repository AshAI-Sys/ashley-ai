-- Add missing email_verified column
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN email_verification_token TEXT;
ALTER TABLE users ADD COLUMN email_verification_expires DATETIME;
ALTER TABLE users ADD COLUMN email_verification_sent_at DATETIME;

-- Update existing users
UPDATE users SET email_verified = 1 WHERE email_verified IS NULL OR email_verified = 0;
