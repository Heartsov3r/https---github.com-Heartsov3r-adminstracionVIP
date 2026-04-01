'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function fetchMyStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { data: null, error: 'No autenticado' }

  // 1. Perfil
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // 2. Última membresía
  const { data: memberships } = await supabase
    .from('memberships')
    .select('*, plans(*)')
    .eq('user_id', user.id)
    .order('end_date', { ascending: false })
    .limit(1)

  const latestMembership = memberships?.[0] || null

  // 3. Pagos
  const { data: allUserMemberships } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
  
  let userPayments: Record<string, unknown>[] = []
  if (allUserMemberships && allUserMemberships.length > 0) {
      const { data: fetchedPayments } = await supabase
        .from('manual_payments')
        .select(`
          *, 
          payment_receipts(*), 
          memberships(
            id,
            start_date,
            end_date,
            plans(id, name, price, duration_days)
          ),
          payment_methods(*),
          profiles!recording_admin_id(full_name)
        `)
        .in('membership_id', allUserMemberships.map(m => m.id))
        .order('payment_date', { ascending: false })
      
      userPayments = fetchedPayments || []
  }

  // 4. Estado de aceptación de Términos
  const termsAccepted = user.user_metadata?.terms_accepted === true

  return {
    data: {
      profile,
      latestMembership,
      payments: userPayments,
      termsAccepted,
    },
    error: null
  }
}

export async function acceptTerms() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const adminClient = await createAdminClient()
  const { error } = await adminClient.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, terms_accepted: true }
  })

  if (error) return { error: error.message }
  return { error: null }
}

