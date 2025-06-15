import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { 
  Users, 
  Settings, 
  Activity, 
  CheckCircle, 
  XCircle, 
  Square, 
  RotateCcw,
  Mail,
  Crown,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

export function Admin() {
  const { user } = useAuth();
  const { users, loading, activatePackage, stopUserStreams } = useAdminUsers();
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [activationForm, setActivationForm] = useState({
    packageType: 'starter' as 'starter' | 'creator' | 'pro',
    duration: 30,
  });
  const [isActivating, setIsActivating] = useState(false);

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
          <p className="text-slate-600">You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  const handleActivatePackage = async () => {
    if (!selectedUser) return;

    setIsActivating(true);
    const { error } = await activatePackage(
      selectedUser.id,
      activationForm.packageType,
      activationForm.duration
    );

    if (error) {
      toast.error(error);
    } else {
      toast.success(`Package activated for ${selectedUser.email}`);
      setShowActivateModal(false);
      setSelectedUser(null);
    }
    setIsActivating(false);
  };

  const handleStopUserStreams = async (userId: string, userEmail: string) => {
    const { error } = await stopUserStreams(userId);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success(`All streams stopped for ${userEmail}`);
    }
  };

  const getPackageStreams = (packageType: string) => {
    const streamsMap = { starter: 1, creator: 3, pro: 10 };
    return streamsMap[packageType as keyof typeof streamsMap] || 0;
  };

  const isPackageActive = (user: typeof users[0]) => {
    return user.package_expires_at && new Date(user.package_expires_at) > new Date();
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <Loader className="w-8 h-8 text-purple-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="mt-2 text-slate-600">Manage users and their streaming packages</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Users</p>
                <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Users</p>
                <p className="text-2xl font-bold text-slate-800">
                  {users.filter(u => isPackageActive(u)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Streams</p>
                <p className="text-2xl font-bold text-slate-800">
                  {users.reduce((sum, u) => sum + u.streams_active, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Pro Users</p>
                <p className="text-2xl font-bold text-slate-800">
                  {users.filter(u => u.package_type === 'pro').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">User Management</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-600">User</th>
                  <th className="text-left p-4 font-medium text-slate-600">Package</th>
                  <th className="text-left p-4 font-medium text-slate-600">Streams</th>
                  <th className="text-left p-4 font-medium text-slate-600">Status</th>
                  <th className="text-left p-4 font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((userData) => (
                  <tr key={userData.id} className="hover:bg-slate-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{userData.email}</p>
                          <p className="text-sm text-slate-500">
                            Joined {new Date(userData.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {userData.package_type ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                            {userData.package_type}
                          </span>
                          {userData.package_expires_at && (
                            <p className="text-xs text-slate-500 mt-1">
                              Expires {new Date(userData.package_expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Package
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="font-medium">{userData.streams_active}</span>
                        <span className="text-slate-500">/{userData.streams_allowed}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                          className="bg-purple-600 h-1 rounded-full"
                          style={{
                            width: `${userData.streams_allowed > 0 ? (userData.streams_active / userData.streams_allowed) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        isPackageActive(userData)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isPackageActive(userData) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(userData);
                            setShowActivateModal(true);
                          }}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Activate Package"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStopUserStreams(userData.id, userData.email)}
                          disabled={userData.streams_active === 0}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Stop All Streams"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Activate Package Modal */}
      {showActivateModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Activate Package for {selectedUser.email}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Package Type
                </label>
                <select
                  value={activationForm.packageType}
                  onChange={(e) => setActivationForm({
                    ...activationForm,
                    packageType: e.target.value as any,
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="starter">Starter (1 stream)</option>
                  <option value="creator">Creator (3 streams)</option>
                  <option value="pro">Pro (10 streams)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={activationForm.duration}
                  onChange={(e) => setActivationForm({
                    ...activationForm,
                    duration: parseInt(e.target.value) || 30,
                  })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  max="365"
                />
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 mb-2">Package Details</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• {getPackageStreams(activationForm.packageType)} concurrent streams</li>
                  <li>• Valid for {activationForm.duration} days</li>
                  <li>• Expires on {new Date(Date.now() + activationForm.duration * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
                </ul>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowActivateModal(false)}
                disabled={isActivating}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleActivatePackage}
                disabled={isActivating}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isActivating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Activating...</span>
                  </>
                ) : (
                  <span>Activate Package</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}