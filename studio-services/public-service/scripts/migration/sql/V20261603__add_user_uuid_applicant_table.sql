-- Add user_uuid column to applicant table to store the user UUID of the applicant
ALTER TABLE applicant
    ADD COLUMN IF NOT EXISTS user_uuid VARCHAR(255);