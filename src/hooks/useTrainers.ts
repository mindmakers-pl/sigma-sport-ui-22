import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Trainer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'trainer' | 'coach';
  created_at?: string;
}

export const useTrainers = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrainers((data || []) as Trainer[]);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const addTrainer = async (trainerData: Omit<Trainer, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .insert([trainerData])
        .select()
        .single();

      if (error) throw error;
      await fetchTrainers();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding trainer:', err);
      return { data: null, error: err.message };
    }
  };

  const updateTrainer = async (id: string, updates: Partial<Trainer>) => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTrainers();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating trainer:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteTrainer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trainers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTrainers();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting trainer:', err);
      return { error: err.message };
    }
  };

  return {
    trainers,
    loading,
    error,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    refetch: fetchTrainers
  };
};
