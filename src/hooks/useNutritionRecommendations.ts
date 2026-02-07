import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NutritionRecommendation {
  id: string;
  category: 'pregnant' | 'elderly' | 'infant';
  nutrient_name: string;
  daily_requirement: string;
  unit: string;
  sources: string[] | null;
  importance: string | null;
  created_at: string;
  updated_at: string;
}

export const useNutritionRecommendations = () => {
  const [recommendations, setRecommendations] = useState<NutritionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_recommendations')
        .select('*')
        .order('nutrient_name', { ascending: true });

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error: any) {
      console.error('Error fetching nutrition recommendations:', error);
      toast.error('Failed to fetch nutrition recommendations');
    } finally {
      setLoading(false);
    }
  };

  const addRecommendation = async (recommendation: Omit<NutritionRecommendation, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_recommendations')
        .insert([recommendation])
        .select()
        .single();

      if (error) throw error;
      toast.success('Nutrition recommendation added');
      return data;
    } catch (error: any) {
      console.error('Error adding nutrition recommendation:', error);
      toast.error('Failed to add nutrition recommendation');
      return null;
    }
  };

  const updateRecommendation = async (id: string, updates: Partial<NutritionRecommendation>) => {
    try {
      const { data, error } = await supabase
        .from('nutrition_recommendations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecommendations(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Nutrition recommendation updated');
      return data;
    } catch (error: any) {
      console.error('Error updating nutrition recommendation:', error);
      toast.error('Failed to update nutrition recommendation');
      return null;
    }
  };

  const deleteRecommendation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('nutrition_recommendations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecommendations(prev => prev.filter(r => r.id !== id));
      toast.success('Recommendation deleted');
    } catch (error: any) {
      console.error('Error deleting nutrition recommendation:', error);
      toast.error('Failed to delete recommendation');
    }
  };

  useEffect(() => {
    fetchRecommendations();

    const channel = supabase
      .channel('nutrition-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nutrition_recommendations' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecommendations(prev => [...prev, payload.new as NutritionRecommendation]);
          } else if (payload.eventType === 'UPDATE') {
            setRecommendations(prev => prev.map(r => r.id === payload.new.id ? payload.new as NutritionRecommendation : r));
          } else if (payload.eventType === 'DELETE') {
            setRecommendations(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { recommendations, loading, addRecommendation, updateRecommendation, deleteRecommendation, refetch: fetchRecommendations };
};
