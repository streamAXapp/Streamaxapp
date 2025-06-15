import { useState, useEffect } from 'react';
import { supabase, type StreamSession } from '../lib/supabase';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export function useStreamSessions() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StreamSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('stream_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load stream sessions');
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (rtmpUrl: string, videoSource: string) => {
    if (!user) return { error: 'User not authenticated' };

    // Check if user has available streams
    const activeStreams = sessions.filter(s => s.status === 'running' || s.status === 'starting').length;
    if (activeStreams >= user.streams_allowed) {
      return { error: `You can only have ${user.streams_allowed} active streams` };
    }

    try {
      const { data, error } = await supabase
        .from('stream_sessions')
        .insert({
          user_id: user.id,
          rtmp_url: rtmpUrl,
          video_source: videoSource,
          status: 'starting',
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setSessions(prev => [data, ...prev]);
      
      // Simulate starting process
      setTimeout(() => {
        updateSessionStatus(data.id, 'running');
      }, 3000);

      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const updateSessionStatus = async (sessionId: string, status: StreamSession['status']) => {
    try {
      const { error } = await supabase
        .from('stream_sessions')
        .update({ 
          status,
          ...(status === 'stopped' ? { stopped_at: new Date().toISOString() } : {})
        })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, status, ...(status === 'stopped' ? { stopped_at: new Date().toISOString() } : {}) }
            : s
        )
      );
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const stopSession = async (sessionId: string) => {
    try {
      await updateSessionStatus(sessionId, 'stopping');
      
      // Simulate stopping process
      setTimeout(() => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      }, 2000);

      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    sessions,
    loading,
    createSession,
    stopSession,
    refreshSessions: fetchSessions,
  };
}