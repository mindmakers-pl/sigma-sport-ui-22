import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Training {
  id: string;
  athlete_id: string;
  task_type: string;
  date: string;
  results: any;
  created_at?: string;
}

export const useTrainings = (athleteId?: string) => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: false });

      if (athleteId) {
        query = query.eq('athlete_id', athleteId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrainings(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [athleteId]);

  const addTraining = async (trainingData: Omit<Training, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .insert([trainingData])
        .select()
        .single();

      if (error) throw error;
      await fetchTrainings();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding training:', err);
      return { data: null, error: err.message };
    }
  };

  const updateTraining = async (id: string, updates: Partial<Training>) => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTrainings();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating training:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteTraining = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTrainings();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting training:', err);
      return { error: err.message };
    }
  };

  return {
    trainings,
    loading,
    error,
    addTraining,
    updateTraining,
    deleteTraining,
    refetch: fetchTrainings
  };
};
