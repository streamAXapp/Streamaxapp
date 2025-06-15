import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  package_type?: 'starter' | 'creator' | 'pro';
  package_expires_at?: string;
  streams_allowed: number;
  streams_active: number;
}

export interface StreamSession {
  id: string;
  user_id: string;
  container_id?: string;
  rtmp_url: string;
  video_source: string;
  status: 'starting' | 'running' | 'stopping' | 'stopped' | 'error';
  created_at: string;
  started_at?: string;
  stopped_at?: string;
}