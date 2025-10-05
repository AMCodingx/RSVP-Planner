-- Migration to convert existing 'partner1/partner2' system to couple-based system
-- This script should be run after couples have been created

-- First, create a couple for any existing guests with invited_by values
-- Note: This should be customized with actual couple information before running

-- Example couples - replace with actual data
-- INSERT INTO couples (auth_user_id, first_name, last_name, email) VALUES 
-- ('user-id-1', 'Partner', 'One', 'partner1@example.com'),
-- ('user-id-2', 'Partner', 'Two', 'partner2@example.com');

-- Update guests to link them to couples based on invited_by field
-- This assumes you have created the couples and know their IDs

-- Example update - replace couple IDs with actual values:
-- UPDATE guests 
-- SET couple_id = 'couple-id-1' 
-- WHERE invited_by = 'partner1' AND couple_id IS NULL;

-- UPDATE guests 
-- SET couple_id = 'couple-id-2' 
-- WHERE invited_by = 'partner2' AND couple_id IS NULL;

-- After confirming all guests have been migrated to couples:
-- ALTER TABLE guests ALTER COLUMN invited_by DROP NOT NULL;

-- Clean up script to verify migration
SELECT 
  invited_by,
  couple_id,
  COUNT(*) as guest_count
FROM guests 
GROUP BY invited_by, couple_id
ORDER BY invited_by, couple_id;

-- Check for any guests without couple assignment
SELECT 
  id, 
  first_name, 
  last_name, 
  invited_by, 
  couple_id
FROM guests 
WHERE couple_id IS NULL
ORDER BY created_at DESC;