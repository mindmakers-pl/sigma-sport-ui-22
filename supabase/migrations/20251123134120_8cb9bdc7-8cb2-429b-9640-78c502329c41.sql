-- Allow anonymous users full access to athletes table (temporary for co-developer phase)
DROP POLICY IF EXISTS "Authenticated users can view athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can insert athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can update athletes" ON public.athletes;
DROP POLICY IF EXISTS "Authenticated users can delete athletes" ON public.athletes;

CREATE POLICY "Allow anon to view athletes"
ON public.athletes FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anon to insert athletes"
ON public.athletes FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon to update athletes"
ON public.athletes FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow anon to delete athletes"
ON public.athletes FOR DELETE
TO anon
USING (true);