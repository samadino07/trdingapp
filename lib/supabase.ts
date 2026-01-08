import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://telkcmerocqbbboxhnbo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbGtjbWVyb2NxYmJib3hobmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTE0MjYsImV4cCI6MjA4MzQ2NzQyNn0.nbs_7rU3x1yK3ijTdzhM5o6V56Vbc8NCgBKVQJjiNGU';

let envUrl, envKey;

try {
  // Safely attempt to access Vite environment variables
  // @ts-ignore
  if (import.meta && import.meta.env) {
    // @ts-ignore
    envUrl = import.meta.env.VITE_SUPABASE_URL;
    // @ts-ignore
    envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  }
} catch (error) {
  console.warn('Environment variables not accessible, using defaults.');
}

export const supabase = createClient(
  envUrl || SUPABASE_URL,
  envKey || SUPABASE_ANON_KEY
);