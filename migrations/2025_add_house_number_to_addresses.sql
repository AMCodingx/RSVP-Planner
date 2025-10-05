-- Add house_number column to addresses table
ALTER TABLE addresses ADD COLUMN house_number TEXT;

-- Update default country from USA to NL (Netherlands)
ALTER TABLE addresses ALTER COLUMN country SET DEFAULT 'NL';

-- Create index for house_number if needed for searching
CREATE INDEX idx_addresses_house_number ON addresses(house_number);