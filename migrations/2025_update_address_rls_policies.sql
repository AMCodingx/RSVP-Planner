-- Update RLS policies for addresses table to ensure authenticated users have full CRUD access
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON addresses;

-- Create updated RLS policies for authenticated users
CREATE POLICY "Authenticated users can view addresses" ON addresses
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert addresses" ON addresses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update addresses" ON addresses
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete addresses" ON addresses
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Also update groups table RLS to ensure it works with addresses
DROP POLICY IF EXISTS "Users can view their own groups" ON groups;
DROP POLICY IF EXISTS "Users can insert their own groups" ON groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON groups;
DROP POLICY IF EXISTS "Users can delete their own groups" ON groups;

CREATE POLICY "Authenticated users can view groups" ON groups
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert groups" ON groups
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update groups" ON groups
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete groups" ON groups
  FOR DELETE USING (auth.uid() IS NOT NULL);