'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function fetchPaymentMethods() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching payment methods:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createPaymentMethod(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as any
  const details = formData.get('details') as string
  const owner_name = formData.get('owner_name') as string
  const country = formData.get('country') as string

  if (!name || !details || !owner_name) {
    return { error: 'Todos los campos son obligatorios' }
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      name,
      type,
      details,
      owner_name,
      country,
      is_active: true
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('CREATE_PAYMENT_METHOD', `Creó método de pago: ${name}`, data[0].id)

  revalidatePath('/admin/payment-methods')
  return { success: true }
}

export async function updatePaymentMethod(id: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const type = formData.get('type') as any
  const details = formData.get('details') as string
  const owner_name = formData.get('owner_name') as string
  const country = formData.get('country') as string

  if (!name || !details || !owner_name) {
    return { error: 'Todos los campos son obligatorios' }
  }

  const { error } = await supabase
    .from('payment_methods')
    .update({
      name,
      type,
      details,
      owner_name,
      country
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('UPDATE_PAYMENT_METHOD', `Actualizó método de pago: ${name}`, id)

  revalidatePath('/admin/payment-methods')
  return { success: true }
}

export async function deletePaymentMethod(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('DELETE_PAYMENT_METHOD', `Eliminó método de pago permanentemente`, id)

  revalidatePath('/admin/payment-methods')
  return { success: true }
}

export async function togglePaymentMethodStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('payment_methods')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('TOGGLE_PAYMENT_METHOD', `Cambió estado de método de pago a ${!currentStatus ? 'Activo' : 'Inactivo'}`, id)

  revalidatePath('/admin/payment-methods')
  return { success: true }
}
