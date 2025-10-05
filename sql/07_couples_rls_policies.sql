-- RLS policies for couples table
ALTER TABLE couples ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own couple record
CREATE POLICY "Users can view their own couple" ON couples
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own couple" ON couples
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own couple" ON couples
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete their own couple" ON couples
  FOR DELETE USING (auth.uid() = auth_user_id);

-- Allow authenticated users to view all couples (for wedding planning collaboration)
-- This enables both partners to see each other's information
CREATE POLICY "Authenticated users can view all couples" ON couples
  FOR SELECT USING (auth.role() = 'authenticated');