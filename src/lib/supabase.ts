
import { createClient } from '@supabase/supabase-js';

// Provide fallback values for development if environment variables aren't set
// These should be replaced with actual values in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

// Log a warning if using placeholder values
if (supabaseUrl === 'https://your-supabase-url.supabase.co' || supabaseAnonKey === 'your-anon-key') {
  console.warn('Using placeholder Supabase credentials. Replace with actual values in .env file.');
}

// Initialize the Supabase client with options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export a helper function to check if we're using real credentials
export const hasValidCredentials = () => {
  return supabaseUrl !== 'https://your-supabase-url.supabase.co' && 
         supabaseAnonKey !== 'your-anon-key';
};
