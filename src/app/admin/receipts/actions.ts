'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchGlobalReceipts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('manual_payments')
    .select(`
      id,
      amount,
      payment_date,
      notes,
      membership:memberships (
        profile:profiles (
          full_name,
          email,
          phone
        ),
        plan:plans (
          name,
          duration_days
        )
      ),
      receipts:payment_receipts (
        file_url,
        storage_path
      ),
      payment_method:payment_methods (
        name,
        details,
        owner_name,
        type
      )
    `)
    .order('payment_date', { ascending: false })

  if (error) {
    console.error('Error fetching global receipts:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
