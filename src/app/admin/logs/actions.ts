'use server'

import { createClient } from '@/lib/supabase/server'

export async function logAdminAction(action_type: string, description: string, target_id?: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase.from('admin_logs').insert({
      admin_id: user.id,
      action_type,
      description,
      target_id
    })
  }
}

export async function fetchAdminLogs() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('admin_logs')
    .select(`
      *,
      admin:profiles (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin logs:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
