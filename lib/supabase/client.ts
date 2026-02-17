import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// This version uses cookies to "remember" the user so you don't have to log in every time
export const supabase = createClientComponentClient()

// This allows other files to create their own connection if needed
export const createClient = () => createClientComponentClient()
