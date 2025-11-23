import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Session {
  id: string;
  athlete_id: string;
  date: string;
  conditions?: string;
  in_progress?: boolean;
  completed_at?: string;
  created_at?: string;
  results?: any; // JSONB field for session results
}

export const useSessions = (athleteId?: string) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('sessions')
        .select('*')
        .order('date', { ascending: false });

      if (athleteId) {
        query = query.eq('athlete_id', athleteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSessions(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [athleteId]);

  const addSession = async (sessionData: Omit<Session, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;
      await fetchSessions();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding session:', err);
      return { data: null, error: err.message };
    }
  };

  const updateSession = async (id: string, updates: Partial<Session>) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchSessions();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating session:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchSessions();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting session:', err);
      return { error: err.message };
    }
  };

  return {
    sessions,
    loading,
    error,
    addSession,
    updateSession,
    deleteSession,
    refetch: fetchSessions
  };
};
