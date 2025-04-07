
import { createClient } from '@supabase/supabase-js';

// Environment variables would typically be used in a production app
// For this demo, we'll use placeholder values
const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseAnonKey = 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
