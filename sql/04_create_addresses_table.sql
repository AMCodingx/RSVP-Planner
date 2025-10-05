-- Create addresses table for managing invitation addresses
CREATE TABLE addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_number TEXT,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state_province TEXT,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'NL',
  delivery_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key to groups table to link groups to addresses
ALTER TABLE groups ADD COLUMN address_id UUID REFERENCES addresses(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_groups_address_id ON groups(address_id);
CREATE INDEX idx_addresses_country ON addresses(country);
CREATE INDEX idx_addresses_created_at ON addresses(created_at);