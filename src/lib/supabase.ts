
import { createClient } from '@supabase/supabase-js';

// Use the actual Supabase URL and key from the connected Supabase project
const supabaseUrl = "https://ncbrcytyuvftzrqonnzh.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jYnJjeXR5dXZmdHpycW9ubnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDkxMjgsImV4cCI6MjA1OTIyNTEyOH0.i87WXXKNPDjQllcjgWxclst1dy9--47WvChGiH-vj9k";

// Initialize the Supabase client with options for better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export a helper function to check if we're using real credentials
export const hasValidCredentials = () => true; // We now have valid credentials
