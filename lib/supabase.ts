import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
// Vercel injects these variables at build time
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://telkcmerocqbbboxhnbo.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbGtjbWVyb2NxYmJib3hobmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4OTE0MjYsImV4cCI6MjA4MzQ2NzQyNn0.nbs_7rU3x1yK3ijTdzhM5o6V56Vbc8NCgBKVQJjiNGU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);