# Database Schema for RSVP Planner

This document outlines the database tables required for the RSVP Planner application using Supabase.

## Tables

### `guests` table

```sql
CREATE TABLE guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  age_category TEXT NOT NULL CHECK (age_category IN ('adult', 'child')),
  country TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  rsvp_status TEXT NOT NULL DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  invited_by TEXT NOT NULL CHECK (invited_by IN ('partner1', 'partner2')),
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### `groups` table

```sql
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invitation_address TEXT,
  qr_code_generated BOOLEAN DEFAULT FALSE,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Indexes

```sql
-- Improve query performance for common filters
CREATE INDEX idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX idx_guests_age_category ON guests(age_category);
CREATE INDEX idx_guests_invited_by ON guests(invited_by);
CREATE INDEX idx_guests_group_id ON guests(group_id);
CREATE INDEX idx_guests_created_at ON guests(created_at);
```

## Row Level Security (RLS)

Enable RLS on both tables and create policies to ensure users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Create policies (assuming auth.uid() returns the authenticated user's ID)
CREATE POLICY "Users can view their own guests" ON guests
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own guests" ON guests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own guests" ON guests
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own guests" ON guests
  FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own groups" ON groups
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own groups" ON groups
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own groups" ON groups
  FOR DELETE USING (auth.uid() IS NOT NULL);
```

## Triggers

Create updated_at triggers to automatically update timestamps:

```sql
-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for guests table
CREATE TRIGGER update_guests_updated_at 
  BEFORE UPDATE ON guests 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers for groups table
CREATE TRIGGER update_groups_updated_at 
  BEFORE UPDATE ON groups 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## Sample Data

```sql
-- Sample groups
INSERT INTO groups (id, name, invitation_address, qr_code_generated) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Smith Family', '123 Main St, Anytown, ST 12345', false),
  ('22222222-2222-2222-2222-222222222222', 'The Johnsons', '456 Oak Ave, Somewhere, ST 67890', false);

-- Sample guests
INSERT INTO guests (first_name, last_name, email, phone, age_category, country, group_id, rsvp_status, invited_by) VALUES
  ('John', 'Smith', 'john.smith@email.com', '+1-555-0123', 'adult', 'USA', '11111111-1111-1111-1111-111111111111', 'pending', 'partner1'),
  ('Jane', 'Smith', 'jane.smith@email.com', '+1-555-0124', 'adult', 'USA', '11111111-1111-1111-1111-111111111111', 'pending', 'partner1'),
  ('Little', 'Smith', null, null, 'child', 'USA', '11111111-1111-1111-1111-111111111111', 'pending', 'partner1'),
  ('Bob', 'Johnson', 'bob.johnson@email.com', '+1-555-0125', 'adult', 'Canada', '22222222-2222-2222-2222-222222222222', 'confirmed', 'partner2'),
  ('Alice', 'Johnson', 'alice.johnson@email.com', '+1-555-0126', 'adult', 'Canada', '22222222-2222-2222-2222-222222222222', 'confirmed', 'partner2');
```

## Notes

1. The `group_id` in the guests table is optional (can be NULL) to support individual guests who are not part of a group.
2. The `age_category` field distinguishes between adults and children for catering and seating purposes.
3. The `invited_by` field tracks which partner invited each guest.
4. The `qr_code_generated` and `qr_code_url` fields in the groups table will be used for QR code generation functionality.
5. All timestamps are stored with timezone information for accuracy across different time zones.