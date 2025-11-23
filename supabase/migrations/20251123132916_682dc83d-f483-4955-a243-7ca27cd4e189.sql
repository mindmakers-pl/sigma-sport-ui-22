-- Temporarily allow anon users to manage clubs (security postponed until external users)
-- Replace authenticated-only policies with permissive anon policies

DROP POLICY IF EXISTS "Authenticated users can insert clubs" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can update clubs" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can delete clubs" ON clubs;
DROP POLICY IF EXISTS "Authenticated users can view clubs" ON clubs;

CREATE POLICY "Allow anon to view clubs"
  ON clubs FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon to insert clubs"
  ON clubs FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon to update clubs"
  ON clubs FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon to delete clubs"
  ON clubs FOR DELETE
  TO anon
  USING (true);