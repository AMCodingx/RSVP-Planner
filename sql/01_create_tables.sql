-- Create groups table
CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  invitation_address TEXT,
  qr_code_generated BOOLEAN DEFAULT FALSE,
  qr_code_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create guests table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_guests_rsvp_status ON guests(rsvp_status);
CREATE INDEX idx_guests_age_category ON guests(age_category);
CREATE INDEX idx_guests_invited_by ON guests(invited_by);
CREATE INDEX idx_guests_group_id ON guests(group_id);
CREATE INDEX idx_guests_created_at ON guests(created_at);
CREATE INDEX idx_groups_created_at ON groups(created_at);