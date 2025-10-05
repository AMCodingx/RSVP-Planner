-- Migrate remaining invitation_address data to addresses table and remove the column
-- This migration consolidates all address handling to use the addresses table

-- Step 1: Create addresses for groups that only have invitation_address but no address_id
DO $$
DECLARE
  group_record RECORD;
  new_address_id UUID;
BEGIN
  -- Find groups with invitation_address but no address_id
  FOR group_record IN 
    SELECT id, invitation_address 
    FROM groups 
    WHERE invitation_address IS NOT NULL 
    AND address_id IS NULL
  LOOP
    -- Create a new address entry (treating invitation_address as delivery instructions)
    INSERT INTO addresses (
      street_address,
      city,
      state_province,
      postal_code,
      country,
      delivery_instructions
    ) VALUES (
      'Address details in delivery instructions',
      'Unknown',
      '',
      '00000',
      'USA',
      group_record.invitation_address
    ) RETURNING id INTO new_address_id;
    
    -- Update the group to reference the new address
    UPDATE groups 
    SET address_id = new_address_id 
    WHERE id = group_record.id;
  END LOOP;
END $$;

-- Step 2: Remove the invitation_address column since all data is now in addresses table
ALTER TABLE groups DROP COLUMN IF EXISTS invitation_address;

-- Step 3: Create index for better performance on address lookups
CREATE INDEX IF NOT EXISTS idx_groups_address_id ON groups(address_id);

-- The groups table now exclusively uses address_id -> addresses table for all address information