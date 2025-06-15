import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Play, LogOut, Settings, Home, Package, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                StreamAX
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/packages"
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive('/packages')
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Packages</span>
              </Link>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-slate-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                {user.email}
                {user.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    Admin
                  </span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200">
        <div className="flex items-center justify-around h-16">
          <Link
            to="/dashboard"
            className={`flex flex-col items-center space-y-1 p-2 ${
              isActive('/dashboard') ? 'text-purple-600' : 'text-slate-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Dashboard</span>
          </Link>
          <Link
            to="/packages"
            className={`flex flex-col items-center space-y-1 p-2 ${
              isActive('/packages') ? 'text-purple-600' : 'text-slate-400'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Packages</span>
          </Link>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className={`flex flex-col items-center space-y-1 p-2 ${
                isActive('/admin') ? 'text-purple-600' : 'text-slate-400'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Admin</span>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center space-y-1 p-2 text-slate-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}