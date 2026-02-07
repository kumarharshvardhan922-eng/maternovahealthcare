import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PrescribedMeal {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_type: 'pregnant' | 'elderly' | 'infant';
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  description: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[] | null;
  prescribed_by: string;
  prescribed_date: string;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export const usePrescribedMeals = () => {
  const [meals, setMeals] = useState<PrescribedMeal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('prescribed_meals')
        .select('*')
        .order('prescribed_date', { ascending: false });

      if (error) throw error;
      setMeals(data || []);
    } catch (error: any) {
      console.error('Error fetching prescribed meals:', error);
      toast.error('Failed to fetch prescribed meals');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (meal: Omit<PrescribedMeal, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('prescribed_meals')
        .insert([meal])
        .select()
        .single();

      if (error) throw error;
      toast.success('Meal prescribed successfully');
      return data;
    } catch (error: any) {
      console.error('Error adding prescribed meal:', error);
      toast.error('Failed to prescribe meal');
      return null;
    }
  };

  const updateMeal = async (id: string, updates: Partial<PrescribedMeal>) => {
    try {
      const { data, error } = await supabase
        .from('prescribed_meals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setMeals(prev => prev.map(m => m.id === id ? data : m));
      toast.success('Prescribed meal updated');
      return data;
    } catch (error: any) {
      console.error('Error updating prescribed meal:', error);
      toast.error('Failed to update prescribed meal');
      return null;
    }
  };

  const deleteMeal = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prescribed_meals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMeals(prev => prev.filter(m => m.id !== id));
      toast.success('Prescribed meal deleted');
    } catch (error: any) {
      console.error('Error deleting prescribed meal:', error);
      toast.error('Failed to delete prescribed meal');
    }
  };

  useEffect(() => {
    fetchMeals();

    const channel = supabase
      .channel('meals-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prescribed_meals' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMeals(prev => [payload.new as PrescribedMeal, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMeals(prev => prev.map(m => m.id === payload.new.id ? payload.new as PrescribedMeal : m));
          } else if (payload.eventType === 'DELETE') {
            setMeals(prev => prev.filter(m => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { meals, loading, addMeal, updateMeal, deleteMeal, refetch: fetchMeals };
};
