-- Remove country column from guests table since addresses are now handled through groups
-- This migration should be run after all applications are updated to use the new address approach

-- Drop the country column from guests table
ALTER TABLE guests DROP COLUMN IF EXISTS country;

-- The guests table now relies on group.address_id -> addresses table for location information
-- This ensures consistent address handling across the application