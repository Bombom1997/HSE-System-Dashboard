import { createClient } from '@supabase/supabase-js';

// Supabase Configuration from Environment or User Credentials
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 'https://bxohfhunsnbmktyvttuh.supabase.co';

export const SUPABASE_ANON_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2hmaHVuc25ibWt0eXZ0dHVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNzQ3MDksImV4cCI6MjEwNzg1MDcwOX0.32mJCwuHM7cyuQlBWlqNXMW37eoA2JSxLR8nvh4y2-U';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseConnectionStatus {
  connected: boolean;
  message: string;
  projectUrl: string;
  projectId: string;
  tablesStatus?: {
    profiles: boolean;
    documents: boolean;
    audits: boolean;
    findings: boolean;
  };
}

export const checkSupabaseConnection = async (): Promise<SupabaseConnectionStatus> => {
  try {
    // Attempt to query the public endpoint / health check
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    const isHealthy = response.ok || response.status === 200 || response.status === 404;

    // Check if tables exist
    let profilesExist = false;
    let documentsExist = false;
    let auditsExist = false;
    let findingsExist = false;

    try {
      const { error: profErr } = await supabase.from('profiles').select('id').limit(1);
      profilesExist = !profErr || profErr.code !== '42P01'; // 42P01 means table does not exist
    } catch {
      profilesExist = false;
    }

    try {
      const { error: docErr } = await supabase.from('documents').select('id').limit(1);
      documentsExist = !docErr || docErr.code !== '42P01';
    } catch {
      documentsExist = false;
    }

    try {
      const { error: audErr } = await supabase.from('audits').select('id').limit(1);
      auditsExist = !audErr || audErr.code !== '42P01';
    } catch {
      auditsExist = false;
    }

    try {
      const { error: fndErr } = await supabase.from('audit_findings').select('id').limit(1);
      findingsExist = !fndErr || fndErr.code !== '42P01';
    } catch {
      findingsExist = false;
    }

    if (isHealthy) {
      return {
        connected: true,
        message: 'Koneksi ke Supabase Backend (bxohfhunsnbmktyvttuh) Berhasil!',
        projectUrl: SUPABASE_URL,
        projectId: 'bxohfhunsnbmktyvttuh',
        tablesStatus: {
          profiles: profilesExist,
          documents: documentsExist,
          audits: auditsExist,
          findings: findingsExist,
        },
      };
    } else {
      return {
        connected: false,
        message: `Koneksi ditolak oleh endpoint Supabase (${response.status} ${response.statusText})`,
        projectUrl: SUPABASE_URL,
        projectId: 'bxohfhunsnbmktyvttuh',
      };
    }
  } catch (err: any) {
    return {
      connected: false,
      message: err?.message || 'Gagal terhubung ke endpoint Supabase.',
      projectUrl: SUPABASE_URL,
      projectId: 'bxohfhunsnbmktyvttuh',
    };
  }
};
