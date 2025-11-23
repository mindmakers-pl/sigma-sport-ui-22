-- Fix RLS policies for sessions and session_tasks to allow anonymous access
-- This is a temporary measure until authentication is implemented

-- Drop existing restrictive policies for sessions
DROP POLICY IF EXISTS "Authenticated users can view sessions" ON public.sessions;
DROP POLICY IF EXISTS "Authenticated users can insert sessions" ON public.sessions;
DROP POLICY IF EXISTS "Authenticated users can update sessions" ON public.sessions;
DROP POLICY IF EXISTS "Authenticated users can delete sessions" ON public.sessions;

-- Create permissive policies for sessions (anonymous access)
CREATE POLICY "Allow anon to view sessions" 
ON public.sessions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anon to insert sessions" 
ON public.sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anon to update sessions" 
ON public.sessions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow anon to delete sessions" 
ON public.sessions 
FOR DELETE 
USING (true);

-- Drop existing restrictive policies for session_tasks
DROP POLICY IF EXISTS "Authenticated users can view session_tasks" ON public.session_tasks;
DROP POLICY IF EXISTS "Authenticated users can insert session_tasks" ON public.session_tasks;
DROP POLICY IF EXISTS "Authenticated users can update session_tasks" ON public.session_tasks;
DROP POLICY IF EXISTS "Authenticated users can delete session_tasks" ON public.session_tasks;

-- Create permissive policies for session_tasks (anonymous access)
CREATE POLICY "Allow anon to view session_tasks" 
ON public.session_tasks 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anon to insert session_tasks" 
ON public.session_tasks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow anon to update session_tasks" 
ON public.session_tasks 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow anon to delete session_tasks" 
ON public.session_tasks 
FOR DELETE 
USING (true);