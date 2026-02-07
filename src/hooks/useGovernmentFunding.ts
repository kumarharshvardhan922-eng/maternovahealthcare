import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface GovernmentFunding {
  id: string;
  scheme_name: string;
  description: string | null;
  eligibility: 'pregnant' | 'elderly' | 'infant' | 'all';
  amount_inr: number;
  disbursement_date: string | null;
  status: 'pending' | 'approved' | 'disbursed';
  beneficiary_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useGovernmentFunding = () => {
  const [funding, setFunding] = useState<GovernmentFunding[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFunding = async () => {
    try {
      const { data, error } = await supabase
        .from('government_funding')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFunding(data || []);
    } catch (error: any) {
      console.error('Error fetching government funding:', error);
      toast.error('Failed to fetch government funding');
    } finally {
      setLoading(false);
    }
  };

  const addFunding = async (fund: Omit<GovernmentFunding, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('government_funding')
        .insert([fund])
        .select()
        .single();

      if (error) throw error;
      toast.success('Funding scheme added');
      return data;
    } catch (error: any) {
      console.error('Error adding funding:', error);
      toast.error('Failed to add funding scheme');
      return null;
    }
  };

  const updateFunding = async (id: string, updates: Partial<GovernmentFunding>) => {
    try {
      const { data, error } = await supabase
        .from('government_funding')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setFunding(prev => prev.map(f => f.id === id ? data : f));
      toast.success('Funding scheme updated');
      return data;
    } catch (error: any) {
      console.error('Error updating funding:', error);
      toast.error('Failed to update funding scheme');
      return null;
    }
  };

  const deleteFunding = async (id: string) => {
    try {
      const { error } = await supabase
        .from('government_funding')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setFunding(prev => prev.filter(f => f.id !== id));
      toast.success('Funding scheme deleted');
    } catch (error: any) {
      console.error('Error deleting funding:', error);
      toast.error('Failed to delete funding scheme');
    }
  };

  useEffect(() => {
    fetchFunding();

    const channel = supabase
      .channel('funding-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'government_funding' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setFunding(prev => [payload.new as GovernmentFunding, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setFunding(prev => prev.map(f => f.id === payload.new.id ? payload.new as GovernmentFunding : f));
          } else if (payload.eventType === 'DELETE') {
            setFunding(prev => prev.filter(f => f.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { funding, loading, addFunding, updateFunding, deleteFunding, refetch: fetchFunding };
};
