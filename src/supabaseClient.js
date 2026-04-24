import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dnfanjgltlqizksnjksw.supabase.co'
const supabaseKey = 'sb_publishable_REmfTKPmicSN1zi-GAjb5w_6RRDhoTU'

export const supabase = createClient(supabaseUrl, supabaseKey)