-- Migration to remove updated_at columns and triggers from existing tables
-- This migration simplifies the schema by keeping only created_at timestamps

-- First, check if updated_at columns exist and remove them
DO $$
BEGIN
    -- Remove updated_at column from guests table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='guests' AND column_name='updated_at') THEN
        ALTER TABLE guests DROP COLUMN updated_at;
        RAISE NOTICE 'Removed updated_at column from guests table';
    END IF;
    
    -- Remove updated_at column from groups table if it exists  
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='groups' AND column_name='updated_at') THEN
        ALTER TABLE groups DROP COLUMN updated_at;
        RAISE NOTICE 'Removed updated_at column from groups table';
    END IF;
END $$;

-- Drop update triggers if they exist
DROP TRIGGER IF EXISTS update_guests_updated_at ON guests;
DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Verify the final schema
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('guests', 'groups')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;