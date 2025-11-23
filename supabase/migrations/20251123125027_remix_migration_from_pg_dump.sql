CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'coach',
    'viewer'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;


SET default_table_access_method = heap;

--
-- Name: athletes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.athletes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    club_id uuid,
    first_name text NOT NULL,
    last_name text NOT NULL,
    gender text,
    email text,
    phone text,
    coach text,
    discipline text,
    birth_date date,
    birth_year integer,
    notes text,
    parent_first_name text,
    parent_last_name text,
    parent_phone text,
    parent_email text,
    archived boolean DEFAULT false,
    archived_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clubs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    city text,
    disciplines text[],
    coaches jsonb DEFAULT '[]'::jsonb,
    members_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: session_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    task_type text NOT NULL,
    task_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    athlete_id uuid NOT NULL,
    date timestamp with time zone NOT NULL,
    conditions text,
    in_progress boolean DEFAULT true,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: trainings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trainings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    athlete_id uuid NOT NULL,
    date timestamp with time zone NOT NULL,
    task_type text NOT NULL,
    results jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: athletes athletes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.athletes
    ADD CONSTRAINT athletes_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_name_key UNIQUE (name);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: session_tasks session_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tasks
    ADD CONSTRAINT session_tasks_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: trainings trainings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: athletes athletes_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.athletes
    ADD CONSTRAINT athletes_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id) ON DELETE SET NULL;


--
-- Name: session_tasks session_tasks_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_tasks
    ADD CONSTRAINT session_tasks_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_athlete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.athletes(id) ON DELETE CASCADE;


--
-- Name: trainings trainings_athlete_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trainings
    ADD CONSTRAINT trainings_athlete_id_fkey FOREIGN KEY (athlete_id) REFERENCES public.athletes(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: athletes Authenticated users can delete athletes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete athletes" ON public.athletes FOR DELETE TO authenticated USING (true);


--
-- Name: clubs Authenticated users can delete clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete clubs" ON public.clubs FOR DELETE TO authenticated USING (true);


--
-- Name: session_tasks Authenticated users can delete session_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete session_tasks" ON public.session_tasks FOR DELETE TO authenticated USING (true);


--
-- Name: sessions Authenticated users can delete sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete sessions" ON public.sessions FOR DELETE TO authenticated USING (true);


--
-- Name: trainings Authenticated users can delete trainings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can delete trainings" ON public.trainings FOR DELETE TO authenticated USING (true);


--
-- Name: athletes Authenticated users can insert athletes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert athletes" ON public.athletes FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: clubs Authenticated users can insert clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert clubs" ON public.clubs FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: session_tasks Authenticated users can insert session_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert session_tasks" ON public.session_tasks FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: sessions Authenticated users can insert sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: trainings Authenticated users can insert trainings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert trainings" ON public.trainings FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: athletes Authenticated users can update athletes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update athletes" ON public.athletes FOR UPDATE TO authenticated USING (true);


--
-- Name: clubs Authenticated users can update clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update clubs" ON public.clubs FOR UPDATE TO authenticated USING (true);


--
-- Name: session_tasks Authenticated users can update session_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update session_tasks" ON public.session_tasks FOR UPDATE TO authenticated USING (true);


--
-- Name: sessions Authenticated users can update sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update sessions" ON public.sessions FOR UPDATE TO authenticated USING (true);


--
-- Name: trainings Authenticated users can update trainings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update trainings" ON public.trainings FOR UPDATE TO authenticated USING (true);


--
-- Name: athletes Authenticated users can view athletes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view athletes" ON public.athletes FOR SELECT TO authenticated USING (true);


--
-- Name: clubs Authenticated users can view clubs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view clubs" ON public.clubs FOR SELECT TO authenticated USING (true);


--
-- Name: session_tasks Authenticated users can view session_tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view session_tasks" ON public.session_tasks FOR SELECT TO authenticated USING (true);


--
-- Name: sessions Authenticated users can view sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view sessions" ON public.sessions FOR SELECT TO authenticated USING (true);


--
-- Name: user_roles Authenticated users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: trainings Authenticated users can view trainings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view trainings" ON public.trainings FOR SELECT TO authenticated USING (true);


--
-- Name: athletes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

--
-- Name: clubs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

--
-- Name: session_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: trainings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.trainings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


