import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VaccinationRecord {
  id: string;
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_type: 'pregnant' | 'elderly' | 'infant';
  vaccine_name: string;
  dose_number: number;
  date_given: string;
  next_due_date: string | null;
  administered_by: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVaccinationRecords = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .select('*')
        .order('date_given', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching vaccination records:', error);
      toast.error('Failed to fetch vaccination records');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<VaccinationRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      toast.success('Vaccination record added');
      return data;
    } catch (error: any) {
      console.error('Error adding vaccination record:', error);
      toast.error('Failed to add vaccination record');
      return null;
    }
  };

  const updateRecord = async (id: string, updates: Partial<VaccinationRecord>) => {
    try {
      const { data, error } = await supabase
        .from('vaccination_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Vaccination record updated');
      return data;
    } catch (error: any) {
      console.error('Error updating vaccination record:', error);
      toast.error('Failed to update vaccination record');
      return null;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vaccination_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Vaccination record deleted');
    } catch (error: any) {
      console.error('Error deleting vaccination record:', error);
      toast.error('Failed to delete vaccination record');
    }
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('vaccination-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vaccination_records' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecords(prev => [payload.new as VaccinationRecord, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRecords(prev => prev.map(r => r.id === payload.new.id ? payload.new as VaccinationRecord : r));
          } else if (payload.eventType === 'DELETE') {
            setRecords(prev => prev.filter(r => r.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { records, loading, addRecord, updateRecord, deleteRecord, refetch: fetchRecords };
};
