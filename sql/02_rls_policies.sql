-- Enable Row Level Security on tables
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guests table
-- Allow authenticated users to view, insert, update, and delete their own guests
CREATE POLICY "Authenticated users can manage guests" ON guests
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for groups table  
-- Allow authenticated users to view, insert, update, and delete their own groups
CREATE POLICY "Authenticated users can manage groups" ON groups
  FOR ALL USING (auth.uid() IS NOT NULL);

-- RLS Policies for addresses table
-- Allow authenticated users to view, insert, update, and delete addresses
CREATE POLICY "Authenticated users can manage addresses" ON addresses
  FOR ALL USING (auth.uid() IS NOT NULL);