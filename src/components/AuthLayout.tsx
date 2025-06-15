import React from 'react';
import { Play } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            StreamAX
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-slate-800">{title}</h2>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {children}
        </div>

        <div className="text-center text-sm text-slate-500">
          <p>Professional 24/7 YouTube streaming service</p>
        </div>
      </div>
    </div>
  );
}