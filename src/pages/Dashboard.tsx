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
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Dashboard() {
  const { user } = useAuth();
  const { sessions, loading: sessionsLoading, createSession, stopSession } = useStreamSessions();
  const [newStream, setNewStream] = useState({
    rtmpUrl: '',
    videoSource: '',
    sourceType: 'upload' as 'upload' | 'link',
  });
  const [isStarting, setIsStarting] = useState(false);

  const handleStartStream = async () => {
    if (!newStream.rtmpUrl || !newStream.videoSource) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsStarting(true);
    const { data, error } = await createSession(newStream.rtmpUrl, newStream.videoSource);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Stream starting...');
      setNewStream({ rtmpUrl: '', videoSource: '', sourceType: 'upload' });
      
      // Show success message after simulated startup
      setTimeout(() => {
        toast.success('Stream is now live!');
      }, 3000);
    }
    setIsStarting(false);
  };

  const handleStopStream = async (sessionId: string) => {
    const { error } = await stopSession(sessionId);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Stopping stream...');
      setTimeout(() => {
        toast.success('Stream stopped');
      }, 2000);
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

  if (!user) return null;

  const isPackageActive = user.package_expires_at && new Date(user.package_expires_at) > new Date();
  const activeStreams = sessions.filter(s => s.status === 'running' || s.status === 'starting');

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Stream Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage your 24/7 YouTube streams</p>
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
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="capitalize">{session.status}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{session.video_source}</p>
                        <p className="text-sm text-slate-600">
                          Started: {new Date(session.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
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

              {/* Video Source */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Video Source *
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setNewStream({...newStream, sourceType: 'upload'})}
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
                      onClick={() => setNewStream({...newStream, sourceType: 'link'})}
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
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-600">Click to upload or drag and drop</p>
                      <p className="text-sm text-slate-500">MP4, AVI, MOV (max 2GB)</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewStream({...newStream, videoSource: file.name});
                          }
                        }}
                        className="hidden"
                        id="video-upload"
                      />
                      <label
                        htmlFor="video-upload"
                        className="mt-4 inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition-colors"
                      >
                        Choose File
                      </label>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={newStream.videoSource}
                      onChange={(e) => setNewStream({...newStream, videoSource: e.target.value})}
                      placeholder="https://drive.google.com/file/d/... or https://youtube.com/watch?v=..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  )}
                </div>
              </div>

              <button
                onClick={handleStartStream}
                disabled={!newStream.rtmpUrl || !newStream.videoSource || activeStreams.length >= user.streams_allowed || isStarting}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isStarting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Starting...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    <span>Start Stream</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}