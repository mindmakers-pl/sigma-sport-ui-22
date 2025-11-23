import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Athlete {
  id: string;
  first_name: string;
  last_name: string;
  gender?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  birth_year?: number;
  club_id?: string;
  coach?: string;
  discipline?: string;
  notes?: string;
  parent_first_name?: string;
  parent_last_name?: string;
  parent_phone?: string;
  parent_email?: string;
  archived?: boolean;
  archived_at?: string;
  created_at?: string;
}

export const useAthletes = () => {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAthletes(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching athletes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const addAthlete = async (athleteData: Omit<Athlete, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .insert([athleteData])
        .select()
        .single();

      if (error) throw error;
      await fetchAthletes();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding athlete:', err);
      return { data: null, error: err.message };
    }
  };

  const updateAthlete = async (id: string, updates: Partial<Athlete>) => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAthletes();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating athlete:', err);
      return { data: null, error: err.message };
    }
  };

  const archiveAthletes = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('athletes')
        .update({ archived: true, archived_at: new Date().toISOString() })
        .in('id', ids);

      if (error) throw error;
      await fetchAthletes();
      return { error: null };
    } catch (err: any) {
      console.error('Error archiving athletes:', err);
      return { error: err.message };
    }
  };

  const restoreAthletes = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('athletes')
        .update({ archived: false, archived_at: null })
        .in('id', ids);

      if (error) throw error;
      await fetchAthletes();
      return { error: null };
    } catch (err: any) {
      console.error('Error restoring athletes:', err);
      return { error: err.message };
    }
  };

  const deleteAthlete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAthletes();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting athlete:', err);
      return { error: err.message };
    }
  };

  return {
    athletes,
    loading,
    error,
    addAthlete,
    updateAthlete,
    archiveAthletes,
    restoreAthletes,
    deleteAthlete,
    refetch: fetchAthletes
  };
};
