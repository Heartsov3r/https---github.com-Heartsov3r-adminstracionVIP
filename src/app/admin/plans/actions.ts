'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function fetchPlans() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching plans:', JSON.stringify(error, null, 2))
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const duration_days = parseInt(formData.get('duration_days') as string)

  if (!name || isNaN(price) || isNaN(duration_days)) {
    return { error: 'Faltan campos obligatorios o son inválidos' }
  }

  const { data, error } = await supabase.from('plans').insert({
    name,
    description,
    price,
    duration_days,
  }).select().single()

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('CREATE_PLAN', `Se creó el plan: ${name} (${duration_days} días por $${price})`, data?.id)

  revalidatePath('/admin/plans')
  return { success: true }
}

export async function updatePlan(planId: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const priceStr = formData.get('price') as string
  const durationStr = formData.get('duration_days') as string
  
  const price = priceStr === '' ? 0 : parseFloat(priceStr)
  const duration_days = durationStr === '' ? 0 : parseInt(durationStr)

  if (!name || isNaN(price) || isNaN(duration_days)) {
    return { error: 'Faltan campos obligatorios o son inválidos' }
  }

  const { error } = await supabase.from('plans').update({
    name,
    description,
    price,
    duration_days,
  }).eq('id', planId)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('UPDATE_PLAN', `Se actualizó el plan: ${name} (${duration_days} días por $${price})`, planId)

  revalidatePath('/admin/plans')
  return { success: true }
}

export async function togglePlanStatus(planId: string, currentStatus: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('plans')
    .update({ is_active: !currentStatus })
    .eq('id', planId)

  if (error) return { error: error.message }
  
  const statusStr = !currentStatus ? 'Activado' : 'Desactivado'
  await logAdminAction('TOGGLE_PLAN_STATUS', `Se cambió el estado a ${statusStr}`, planId)
  
  revalidatePath('/admin/plans')
  return { success: true }
}

export async function deletePlan(planId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('plans').delete().eq('id', planId)

  if (error) {
    return { error: error.message }
  }

  await logAdminAction('DELETE_PLAN', `Se eliminó permanentemente un plan.`, planId)

  revalidatePath('/admin/plans')
  return { success: true }
}
