import type { Database } from '@/src/shared/types/database'
import { createClient } from '@supabase/supabase-js'
import { supabaseAuthStorage } from '@/src/app-config/supabase-auth-storage'

export const supabase: any = createClient<Database>(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_KEY!,
  {
    auth: {
      storage: supabaseAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
)
