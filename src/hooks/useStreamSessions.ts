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
      
      // Set up real-time subscription for session updates
      const subscription = supabase
        .channel('stream_sessions')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stream_sessions',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Stream session update:', payload);
            fetchSessions(); // Refresh sessions on any change
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
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

  const createSession = async (rtmpUrl: string, videoSource: string, sourceType: 'upload' | 'link') => {
    if (!user) return { error: 'User not authenticated' };

    // Check if user has available streams
    const activeStreams = sessions.filter(s => s.status === 'running' || s.status === 'starting').length;
    if (activeStreams >= user.streams_allowed) {
      return { error: `You can only have ${user.streams_allowed} active streams` };
    }

    try {
      let finalVideoSource = videoSource;

      // Handle file upload
      if (sourceType === 'upload' && videoSource instanceof File) {
        const uploadResult = await uploadVideoFile(videoSource, user.id);
        if (uploadResult.error) {
          return { error: uploadResult.error };
        }
        finalVideoSource = uploadResult.filepath!;
      }

      // Create session in database
      const { data, error } = await supabase
        .from('stream_sessions')
        .insert({
          user_id: user.id,
          rtmp_url: rtmpUrl,
          video_source: finalVideoSource,
          status: 'starting',
        })
        .select()
        .single();

      if (error) throw error;

      // Start the actual stream via edge function
      const streamResult = await startRealStream(data.id, rtmpUrl, finalVideoSource, user.id);
      
      if (streamResult.error) {
        // Update session status to error if stream start failed
        await supabase
          .from('stream_sessions')
          .update({ status: 'error' })
          .eq('id', data.id);
        
        return { error: streamResult.error };
      }

      // Update local state
      setSessions(prev => [data, ...prev]);
      
      return { data };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const stopSession = async (sessionId: string) => {
    try {
      // Call edge function to stop the stream
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-manager`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop',
          sessionId,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to stop stream');
      }

      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const getStreamStatus = async (sessionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-manager`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'status',
          sessionId,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to get stream status');
      }

      return result;
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    sessions,
    loading,
    createSession,
    stopSession,
    getStreamStatus,
    refreshSessions: fetchSessions,
  };
}

async function uploadVideoFile(file: File, userId: string) {
  try {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('userId', userId);

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/file-upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { error: result.error || 'Upload failed' };
    }

    return { filepath: result.filepath, filename: result.filename };
  } catch (error: any) {
    return { error: error.message };
  }
}

async function startRealStream(sessionId: string, rtmpUrl: string, videoSource: string, userId: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stream-manager`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'start',
        sessionId,
        rtmpUrl,
        videoSource,
        userId,
      }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { error: result.error || 'Failed to start stream' };
    }

    return { success: true, containerId: result.containerId };
  } catch (error: any) {
    return { error: error.message };
  }
}