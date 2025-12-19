import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching our database schema
export type Event = {
  id: string;
  name: string;
  admin_token: string;
  locked: boolean;
  created_at: string;
  updated_at: string;
};

export type Participant = {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
};

export type Assignment = {
  id: string;
  event_id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
};

export type WishlistItem = {
  id: string;
  participant_id: string;
  item: string;
  created_at: string;
};
