import { useState, useEffect } from 'react';
import { supabase, type User } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useAdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    if (!user || user.role !== 'admin') return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const activatePackage = async (
    userId: string, 
    packageType: 'starter' | 'creator' | 'pro', 
    duration: number
  ) => {
    if (!user || user.role !== 'admin') return { error: 'Unauthorized' };

    const streamsMap = {
      starter: 1,
      creator: 3,
      pro: 10,
    };

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          package_type: packageType,
          package_expires_at: expiresAt.toISOString(),
          streams_allowed: streamsMap[packageType],
        })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === userId
            ? {
                ...u,
                package_type: packageType,
                package_expires_at: expiresAt.toISOString(),
                streams_allowed: streamsMap[packageType],
              }
            : u
        )
      );

      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const stopUserStreams = async (userId: string) => {
    if (!user || user.role !== 'admin') return { error: 'Unauthorized' };

    try {
      // Stop all active streams for the user
      const { error: sessionsError } = await supabase
        .from('stream_sessions')
        .update({ status: 'stopped', stopped_at: new Date().toISOString() })
        .eq('user_id', userId)
        .in('status', ['running', 'starting']);

      if (sessionsError) throw sessionsError;

      // Update user's active streams count
      const { error: userError } = await supabase
        .from('users')
        .update({ streams_active: 0 })
        .eq('id', userId);

      if (userError) throw userError;

      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === userId ? { ...u, streams_active: 0 } : u
        )
      );

      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    users,
    loading,
    activatePackage,
    stopUserStreams,
    refreshUsers: fetchUsers,
  };
}