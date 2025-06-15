/*
  # Stream Manager Edge Function

  1. Purpose
    - Manages Docker containers for streaming
    - Handles FFmpeg streaming operations
    - Processes video uploads and links
    - Monitors stream health

  2. Features
    - Container lifecycle management
    - FFmpeg RTMP streaming
    - File upload processing
    - Stream status monitoring
    - Error handling and recovery
*/

import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface StreamRequest {
  action: 'start' | 'stop' | 'status';
  sessionId: string;
  rtmpUrl?: string;
  videoSource?: string;
  userId?: string;
}

interface ContainerInfo {
  id: string;
  status: string;
  created: string;
  image: string;
  names: string[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, sessionId, rtmpUrl, videoSource, userId }: StreamRequest = await req.json();

    switch (action) {
      case 'start':
        return await startStream(supabase, sessionId, rtmpUrl!, videoSource!, userId!);
      case 'stop':
        return await stopStream(supabase, sessionId);
      case 'status':
        return await getStreamStatus(supabase, sessionId);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Stream manager error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function startStream(
  supabase: any, 
  sessionId: string, 
  rtmpUrl: string, 
  videoSource: string, 
  userId: string
) {
  try {
    // Update session status to starting
    await supabase
      .from('stream_sessions')
      .update({ status: 'starting' })
      .eq('id', sessionId);

    // Determine video source type and prepare container
    const isVideoFile = videoSource.startsWith('/tmp/') || videoSource.includes('.');
    const isYouTubeLink = videoSource.includes('youtube.com') || videoSource.includes('youtu.be');
    const isDirectLink = videoSource.startsWith('http') && !isYouTubeLink;

    let containerCommand: string[];
    const containerName = `stream-${sessionId.substring(0, 8)}`;

    if (isVideoFile) {
      // Stream from uploaded video file
      containerCommand = [
        'ffmpeg',
        '-re',
        '-stream_loop', '-1',
        '-i', `/videos/${videoSource.split('/').pop()}`,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-maxrate', '3000k',
        '-bufsize', '6000k',
        '-pix_fmt', 'yuv420p',
        '-g', '50',
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ac', '2',
        '-ar', '44100',
        '-f', 'flv',
        rtmpUrl
      ];
    } else if (isYouTubeLink) {
      // Stream from YouTube link using yt-dlp
      containerCommand = [
        'sh', '-c',
        `yt-dlp -f "best[height<=720]" -g "${videoSource}" | head -1 | xargs -I {} ffmpeg -re -stream_loop -1 -i {} -c:v libx264 -preset veryfast -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -g 50 -c:a aac -b:a 160k -ac 2 -ar 44100 -f flv "${rtmpUrl}"`
      ];
    } else if (isDirectLink) {
      // Stream from direct video link
      containerCommand = [
        'ffmpeg',
        '-re',
        '-stream_loop', '-1',
        '-i', videoSource,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-maxrate', '3000k',
        '-bufsize', '6000k',
        '-pix_fmt', 'yuv420p',
        '-g', '50',
        '-c:a', 'aac',
        '-b:a', '160k',
        '-ac', '2',
        '-ar', '44100',
        '-f', 'flv',
        rtmpUrl
      ];
    } else {
      throw new Error('Unsupported video source format');
    }

    // Create Docker container
    const containerId = await createStreamContainer(containerName, containerCommand, isVideoFile);

    // Update session with container info
    await supabase
      .from('stream_sessions')
      .update({ 
        container_id: containerId,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Update user's active streams count
    await supabase.rpc('increment_user_streams', { user_id: userId });

    return new Response(
      JSON.stringify({ 
        success: true, 
        containerId,
        message: 'Stream started successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    // Update session status to error
    await supabase
      .from('stream_sessions')
      .update({ status: 'error' })
      .eq('id', sessionId);

    throw error;
  }
}

async function stopStream(supabase: any, sessionId: string) {
  try {
    // Get session info
    const { data: session } = await supabase
      .from('stream_sessions')
      .select('container_id, user_id')
      .eq('id', sessionId)
      .single();

    if (!session?.container_id) {
      throw new Error('Container not found');
    }

    // Update session status to stopping
    await supabase
      .from('stream_sessions')
      .update({ status: 'stopping' })
      .eq('id', sessionId);

    // Stop and remove Docker container
    await stopStreamContainer(session.container_id);

    // Update session status to stopped
    await supabase
      .from('stream_sessions')
      .update({ 
        status: 'stopped',
        stopped_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    // Decrement user's active streams count
    await supabase.rpc('decrement_user_streams', { user_id: session.user_id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Stream stopped successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    throw error;
  }
}

async function getStreamStatus(supabase: any, sessionId: string) {
  try {
    const { data: session } = await supabase
      .from('stream_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    let containerStatus = 'unknown';
    if (session.container_id) {
      containerStatus = await getContainerStatus(session.container_id);
    }

    return new Response(
      JSON.stringify({ 
        session,
        containerStatus,
        isHealthy: containerStatus === 'running'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    throw error;
  }
}

async function createStreamContainer(
  containerName: string, 
  command: string[], 
  needsVolumeMount: boolean
): Promise<string> {
  try {
    // Build docker run command
    const dockerArgs = [
      'run',
      '-d',
      '--name', containerName,
      '--rm',
      '--memory=1g',
      '--cpus=1.0',
    ];

    // Add volume mount for video files if needed
    if (needsVolumeMount) {
      dockerArgs.push('-v', '/tmp/videos:/videos:ro');
    }

    // Add FFmpeg image and command
    dockerArgs.push('jrottenberg/ffmpeg:4.4-alpine');
    dockerArgs.push(...command);

    // Execute docker command
    const process = new Deno.Command('docker', {
      args: dockerArgs,
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await process.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      throw new Error(`Failed to create container: ${errorText}`);
    }

    const containerId = new TextDecoder().decode(stdout).trim();
    console.log(`Created container: ${containerId}`);
    
    return containerId;

  } catch (error) {
    console.error('Error creating container:', error);
    throw error;
  }
}

async function stopStreamContainer(containerId: string): Promise<void> {
  try {
    // Stop container
    const stopProcess = new Deno.Command('docker', {
      args: ['stop', containerId],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code: stopCode, stderr: stopStderr } = await stopProcess.output();

    if (stopCode !== 0) {
      const errorText = new TextDecoder().decode(stopStderr);
      console.warn(`Warning stopping container: ${errorText}`);
    }

    // Remove container (if not using --rm flag)
    const rmProcess = new Deno.Command('docker', {
      args: ['rm', '-f', containerId],
      stdout: 'piped',
      stderr: 'piped',
    });

    await rmProcess.output();
    console.log(`Stopped and removed container: ${containerId}`);

  } catch (error) {
    console.error('Error stopping container:', error);
    throw error;
  }
}

async function getContainerStatus(containerId: string): Promise<string> {
  try {
    const process = new Deno.Command('docker', {
      args: ['inspect', '--format={{.State.Status}}', containerId],
      stdout: 'piped',
      stderr: 'piped',
    });

    const { code, stdout, stderr } = await process.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      console.warn(`Container status check failed: ${errorText}`);
      return 'not_found';
    }

    return new TextDecoder().decode(stdout).trim();

  } catch (error) {
    console.error('Error checking container status:', error);
    return 'error';
  }
}