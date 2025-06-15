import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { useStreamSessions } from '../hooks/useStreamSessions';
import { 
  Play, 
  Square, 
  Upload, 
  Link as LinkIcon, 
  Activity, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Zap,
  Loader,
  FileVideo,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const { sessions, loading: sessionsLoading, createSession, stopSession } = useStreamSessions();
  const [newStream, setNewStream] = useState({
    rtmpUrl: '',
    videoSource: '',
    videoFile: null as File | null,
    sourceType: 'upload' as 'upload' | 'link',
  });
  const [isStarting, setIsStarting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleStartStream = async () => {
    if (!newStream.rtmpUrl) {
      toast.error('Please enter your RTMP URL');
      return;
    }

    if (newStream.sourceType === 'upload' && !newStream.videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (newStream.sourceType === 'link' && !newStream.videoSource) {
      toast.error('Please enter a video URL');
      return;
    }

    setIsStarting(true);
    setUploadProgress(0);

    try {
      const videoSource = newStream.sourceType === 'upload' ? newStream.videoFile! : newStream.videoSource;
      
      // Show upload progress for file uploads
      if (newStream.sourceType === 'upload') {
        toast.loading('Uploading video file...', { id: 'upload' });
        setUploadProgress(25);
      }

      const { data, error } = await createSession(
        newStream.rtmpUrl, 
        videoSource as any, 
        newStream.sourceType
      );
      
      if (error) {
        toast.error(error);
        return;
      }

      toast.dismiss('upload');
      toast.success('Stream is starting...', { duration: 3000 });
      
      // Reset form
      setNewStream({ 
        rtmpUrl: '', 
        videoSource: '', 
        videoFile: null, 
        sourceType: 'upload' 
      });
      
      // Show success message after stream starts
      setTimeout(() => {
        toast.success('🎉 Stream is now live!', { duration: 5000 });
      }, 5000);

    } catch (error: any) {
      toast.error(error.message || 'Failed to start stream');
    } finally {
      setIsStarting(false);
      setUploadProgress(0);
    }
  };

  const handleStopStream = async (sessionId: string) => {
    const { error } = await stopSession(sessionId);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Stream is stopping...', { duration: 3000 });
      setTimeout(() => {
        toast.success('Stream stopped successfully');
      }, 3000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Unsupported file type. Please use MP4, AVI, MOV, MKV, or WebM');
        return;
      }

      // Validate file size (2GB limit)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        toast.error('File too large. Maximum size is 2GB');
        return;
      }

      setNewStream({
        ...newStream,
        videoFile: file,
        videoSource: file.name,
      });
      toast.success(`Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-green-600 bg-green-100';
      case 'starting':
        return 'text-yellow-600 bg-yellow-100';
      case 'stopping':
        return 'text-orange-600 bg-orange-100';
      case 'stopped':
        return 'text-gray-600 bg-gray-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'starting':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'stopping':
        return <AlertCircle className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getVideoSourceDisplay = (source: string) => {
    if (source.startsWith('/tmp/')) {
      return `📁 ${source.split('/').pop()}`;
    } else if (source.includes('youtube.com') || source.includes('youtu.be')) {
      return `📺 YouTube Video`;
    } else if (source.startsWith('http')) {
      return `🔗 ${new URL(source).hostname}`;
    }
    return source;
  };

  if (!user) return null;

  const isPackageActive = user.package_expires_at && new Date(user.package_expires_at) > new Date();
  const activeStreams = sessions.filter(s => s.status === 'running' || s.status === 'starting');

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Stream Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage your 24/7 YouTube streams with real Docker containers</p>
        </div>

        {/* Package Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Package Status</h3>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-slate-600">
                    {user.package_type ? (
                      <span className="capitalize font-medium">{user.package_type} Plan</span>
                    ) : (
                      <span>No active package</span>
                    )}
                  </span>
                </div>
                {isPackageActive && (
                  <div className="text-sm text-slate-600">
                    Expires: {new Date(user.package_expires_at!).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-800">
                {activeStreams.length}/{user.streams_allowed}
              </div>
              <div className="text-sm text-slate-600">Active Streams</div>
            </div>
          </div>

          {!isPackageActive && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">No Active Package</p>
                  <p className="text-sm text-yellow-700">
                    You need an active package to start streaming.{' '}
                    <a href="/packages" className="underline hover:no-underline">
                      View packages
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Streams */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">Active Streams</h3>
          </div>
          <div className="p-6">
            {sessionsLoading ? (
              <div className="text-center py-8">
                <Loader className="w-8 h-8 text-purple-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600">Loading streams...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No streams yet</p>
                <p className="text-sm text-slate-500">Start your first stream below</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map(session => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="capitalize">{session.status}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {getVideoSourceDisplay(session.video_source)}
                        </p>
                        <p className="text-sm text-slate-600">
                          Started: {new Date(session.created_at).toLocaleString()}
                        </p>
                        {session.container_id && (
                          <p className="text-xs text-slate-500">
                            Container: {session.container_id.substring(0, 12)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {session.status === 'running' && (
                        <div className="flex items-center space-x-1 text-green-600 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Live</span>
                        </div>
                      )}
                      {(session.status === 'running' || session.status === 'starting') && (
                        <button
                          onClick={() => handleStopStream(session.id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Square className="w-4 h-4" />
                          <span>Stop</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start New Stream */}
        {isPackageActive && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Start New Stream</h3>
              <p className="text-sm text-slate-600 mt-1">
                Create a new 24/7 stream using Docker containers and FFmpeg
              </p>
            </div>
            <div className="p-6 space-y-6">
              {/* RTMP URL */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  RTMP URL *
                </label>
                <input
                  type="text"
                  value={newStream.rtmpUrl}
                  onChange={(e) => setNewStream({...newStream, rtmpUrl: e.target.value})}
                  placeholder="rtmp://a.rtmp.youtube.com/live2/your-stream-key"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="mt-1 text-sm text-slate-500">
                  Get your RTMP URL from YouTube Studio → Go Live → Stream
                </p>
              </div>

              {/* Video Source Type */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Source *
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setNewStream({...newStream, sourceType: 'upload', videoSource: '', videoFile: null})}
                      className={`flex-1 flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                        newStream.sourceType === 'upload'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                    <button
                      onClick={() => setNewStream({...newStream, sourceType: 'link', videoSource: '', videoFile: null})}
                      className={`flex-1 flex items-center justify-center space-x-2 p-3 border rounded-lg transition-colors ${
                        newStream.sourceType === 'link'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span>Video Link</span>
                    </button>
                  </div>

                  {newStream.sourceType === 'upload' ? (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                      {newStream.videoFile ? (
                        <div className="space-y-4">
                          <FileVideo className="w-12 h-12 text-green-500 mx-auto" />
                          <div>
                            <p className="font-medium text-slate-800">{newStream.videoFile.name}</p>
                            <p className="text-sm text-slate-600">
                              {(newStream.videoFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                          <button
                            onClick={() => setNewStream({...newStream, videoFile: null, videoSource: ''})}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                          <p className="text-slate-600">Click to upload or drag and drop</p>
                          <p className="text-sm text-slate-500">MP4, AVI, MOV, MKV, WebM (max 2GB)</p>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="video-upload"
                          />
                          <label
                            htmlFor="video-upload"
                            className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                          >
                            Choose File
                          </label>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={newStream.videoSource}
                        onChange={(e) => setNewStream({...newStream, videoSource: e.target.value})}
                        placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <div className="text-sm text-slate-600 space-y-1">
                        <p className="flex items-center space-x-2">
                          <ExternalLink className="w-4 h-4" />
                          <span>Supported: YouTube videos, direct video links</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleStartStream}
                disabled={
                  !newStream.rtmpUrl || 
                  (newStream.sourceType === 'upload' && !newStream.videoFile) ||
                  (newStream.sourceType === 'link' && !newStream.videoSource) ||
                  activeStreams.length >= user.streams_allowed || 
                  isStarting
                }
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isStarting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Starting Stream...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Stream</span>
                  </>
                )}
              </button>

              {activeStreams.length >= user.streams_allowed && (
                <p className="text-sm text-red-600 text-center">
                  You've reached your stream limit ({user.streams_allowed}). Stop a stream to start a new one.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}