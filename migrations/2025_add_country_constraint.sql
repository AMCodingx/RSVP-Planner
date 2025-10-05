-- Add constraint to ensure only valid countries are allowed
ALTER TABLE addresses ADD CONSTRAINT check_valid_country 
CHECK (country IN ('NL', 'CW', 'US', 'AW', 'DO', 'OTHER'));