import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmergencyAlert {
  id: string;
  user_id: string;
  user_name: string;
  user_role: 'asha' | 'pregnant' | 'elderly' | 'infant_family';
  type: 'medical' | 'urgent' | 'general';
  message: string;
  photo_url: string | null;
  location: string | null;
  status: 'active' | 'acknowledged' | 'resolved';
  assigned_asha_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useEmergencyAlerts = () => {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch emergency alerts');
    } finally {
      setLoading(false);
    }
  };

  const addAlert = async (alert: Omit<EmergencyAlert, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert([{ ...alert, status: 'active' }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Emergency alert sent! ASHA worker and hospital notified.');
      return data;
    } catch (error: any) {
      console.error('Error adding alert:', error);
      toast.error('Failed to send emergency alert');
      return null;
    }
  };

  const updateAlert = async (id: string, updates: Partial<EmergencyAlert>) => {
    try {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setAlerts(prev => prev.map(a => a.id === id ? data : a));
      return data;
    } catch (error: any) {
      console.error('Error updating alert:', error);
      toast.error('Failed to update alert');
      return null;
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('emergency_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setAlerts(prev => prev.filter(a => a.id !== id));
      toast.success('Alert deleted');
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emergency_alerts' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts(prev => [payload.new as EmergencyAlert, ...prev]);
            toast.info('🚨 New emergency alert received!');
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev => prev.map(a => a.id === payload.new.id ? payload.new as EmergencyAlert : a));
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(a => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { alerts, loading, addAlert, updateAlert, deleteAlert, refetch: fetchAlerts };
};
