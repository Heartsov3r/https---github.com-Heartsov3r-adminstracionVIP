'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function fetchAccounts() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('accounts')
    .select('*, registered_by_profile:profiles!registered_by(full_name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching accounts:', error.message)
    return { data: null, error: error.message }
  }

  // Flatten the profile name
  const formattedData = data.map((account: any) => ({
    ...account,
    registered_by_name: account.registered_by_profile?.full_name || 'Admin Desconocido'
  }))

  return { data: formattedData, error: null }
}

export async function createAccount(formData: FormData) {
  const supabase = await createClient()
  
  // Get current admin user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado' }

  const service_name = formData.get('service_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const notes = formData.get('notes') as string
  const tv_activation_link = formData.get('tv_activation_link') as string

  if (!service_name || !email || !password) {
    return { error: 'Faltan campos obligatorios' }
  }

  const { data, error } = await supabase.from('accounts').insert({
    service_name,
    account_label: service_name,
    email,
    password,
    notes,
    tv_activation_link,
    registered_by: user.id
  }).select().single()

  if (error) return { error: error.message }

  await logAdminAction('CREATE_ACCOUNT', `Se agregó la cuenta: ${service_name}`, data?.id)

  revalidatePath('/admin/accounts')
  return { success: true }
}

export async function updateAccount(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const service_name = formData.get('service_name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const notes = formData.get('notes') as string
  const tv_activation_link = formData.get('tv_activation_link') as string

  const { error } = await supabase.from('accounts').update({
    service_name,
    account_label: service_name,
    email,
    password,
    notes,
    tv_activation_link
  }).eq('id', id)

  if (error) return { error: error.message }

  await logAdminAction('UPDATE_ACCOUNT', `Se actualizó la cuenta: ${service_name}`, id)

  revalidatePath('/admin/accounts')
  return { success: true }
}

export async function toggleAccountStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('accounts')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) return { error: error.message }
  
  const statusStr = !currentStatus ? 'Activada' : 'Desactivada'
  await logAdminAction('TOGGLE_ACCOUNT_STATUS', `Se cambió el estado a ${statusStr}`, id)
  
  revalidatePath('/admin/accounts')
  return { success: true }
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('accounts').delete().eq('id', id)

  if (error) return { error: error.message }

  await logAdminAction('DELETE_ACCOUNT', `Se eliminó permanentemente una cuenta.`, id)

  revalidatePath('/admin/accounts')
  return { success: true }
}
