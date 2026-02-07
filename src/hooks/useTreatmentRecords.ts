import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TreatmentRecord {
  id: string;
  beneficiary_id: string;
  beneficiary_name: string;
  beneficiary_type: 'pregnant' | 'elderly' | 'infant';
  treatment_type: string;
  diagnosis: string;
  prescription: string;
  date_given: string;
  doctor_name: string;
  notes: string | null;
  photo_url: string | null;
  documents: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useTreatmentRecords = () => {
  const [records, setRecords] = useState<TreatmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('treatment_records')
        .select('*')
        .order('date_given', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error: any) {
      console.error('Error fetching treatment records:', error);
      toast.error('Failed to fetch treatment records');
    } finally {
      setLoading(false);
    }
  };

  const addRecord = async (record: Omit<TreatmentRecord, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('treatment_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      toast.success('Treatment record added');
      return data;
    } catch (error: any) {
      console.error('Error adding treatment record:', error);
      toast.error('Failed to add treatment record');
      return null;
    }
  };

  const updateRecord = async (id: string, updates: Partial<TreatmentRecord>) => {
    try {
      const { data, error } = await supabase
        .from('treatment_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setRecords(prev => prev.map(r => r.id === id ? data : r));
      toast.success('Treatment record updated');
      return data;
    } catch (error: any) {
      console.error('Error updating treatment record:', error);
      toast.error('Failed to update treatment record');
      return null;
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      const { error } = await supabase
        .from('treatment_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success('Treatment record deleted');
    } catch (error: any) {
      console.error('Error deleting treatment record:', error);
      toast.error('Failed to delete treatment record');
    }
  };

  useEffect(() => {
    fetchRecords();

    const channel = supabase
      .channel('treatment-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'treatment_records' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecords(prev => [payload.new as TreatmentRecord, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setRecords(prev => prev.map(r => r.id === payload.new.id ? payload.new as TreatmentRecord : r));
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
