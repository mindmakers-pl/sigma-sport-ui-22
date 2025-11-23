-- Drop existing restrictive policies on trainings table
DROP POLICY IF EXISTS "Authenticated users can view trainings" ON public.trainings;
DROP POLICY IF EXISTS "Authenticated users can insert trainings" ON public.trainings;
DROP POLICY IF EXISTS "Authenticated users can update trainings" ON public.trainings;
DROP POLICY IF EXISTS "Authenticated users can delete trainings" ON public.trainings;

-- Create anon-friendly policies matching athletes and sessions tables
CREATE POLICY "Allow anon to view trainings"
ON public.trainings
FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anon to insert trainings"
ON public.trainings
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to update trainings"
ON public.trainings
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon to delete trainings"
ON public.trainings
FOR DELETE
TO anon
USING (true);