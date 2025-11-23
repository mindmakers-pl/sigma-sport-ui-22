import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SessionTask {
  id: string;
  session_id: string;
  task_type: string;
  task_data: any;
  created_at?: string;
}

export const useSessionTasks = (sessionId?: string) => {
  const [tasks, setTasks] = useState<SessionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('session_tasks')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching session tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [sessionId]);

  const addTask = async (taskData: Omit<SessionTask, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('session_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) throw error;
      await fetchTasks();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding task:', err);
      return { data: null, error: err.message };
    }
  };

  const updateTask = async (id: string, updates: Partial<SessionTask>) => {
    try {
      const { data, error } = await supabase
        .from('session_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTasks();
      return { data, error: null };
    } catch (err: any) {
      console.error('Error updating task:', err);
      return { data: null, error: err.message };
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('session_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTasks();
      return { error: null };
    } catch (err: any) {
      console.error('Error deleting task:', err);
      return { error: err.message };
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};
