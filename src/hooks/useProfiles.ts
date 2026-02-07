import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  user_id: string | null;
  patient_id: string;
  name: string;
  role: 'asha' | 'pregnant' | 'elderly' | 'infant_family';
  phone: string;
  village: string | null;
  assigned_asha_id: string | null;
  login_time: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to fetch profiles');
    } finally {
      setLoading(false);
    }
  };

  const addProfile = async (profile: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([profile])
        .select()
        .single();

      if (error) throw error;
      setProfiles(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      console.error('Error adding profile:', error);
      toast.error('Failed to add profile');
      return null;
    }
  };

  const updateProfile = async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return null;
    }
  };

  useEffect(() => {
    fetchProfiles();

    const channel = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setProfiles(prev => [payload.new as Profile, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setProfiles(prev => prev.map(p => p.id === payload.new.id ? payload.new as Profile : p));
          } else if (payload.eventType === 'DELETE') {
            setProfiles(prev => prev.filter(p => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { profiles, loading, addProfile, updateProfile, refetch: fetchProfiles };
};
