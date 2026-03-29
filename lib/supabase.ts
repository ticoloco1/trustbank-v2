'use client';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL  || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isConfigured = Boolean(url && key);

// persistSession:true + storageKey garante que a sessão fica no localStorage
// e é compartilhada entre abas — resolve o bug de sair ao abrir preview
export const supabase = isConfigured
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        storageKey: 'tb_auth',
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder');
