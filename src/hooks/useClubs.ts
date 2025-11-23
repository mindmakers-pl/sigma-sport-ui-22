import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type DbClub = Database['public']['Tables']['clubs']['Row'];

export interface Club {
  id: string;
  name: string;
  city?: string | null;
  disciplines?: string[] | null;
  coaches?: any;
  members_count?: number | null;
  created_at?: string;
}

export const useClubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClubs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClubs(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching clubs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const addClub = async (clubData: Omit<Club, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .insert([clubData])
        .select()
        .single();

      if (error) throw error;
      await fetchClubs();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding club:', err);
      return { data: null, error: err.message };
    }
  };

  const updateClub = async (id: string, updates: Partial<Club>) => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchClubs();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating club:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteClub = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchClubs();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting club:', err);
      return { error: err.message };
    }
  };

  const getClubMemberCount = async (clubId: string) => {
    try {
      const { count, error } = await supabase
        .from('athletes')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', clubId);

      if (error) throw error;
      return count || 0;
    } catch (err: any) {
      console.error('Error getting club member count:', err);
      return 0;
    }
  };

  return {
    clubs,
    loading,
    error,
    addClub,
    updateClub,
    deleteClub,
    getClubMemberCount,
    refetch: fetchClubs
  };
};
