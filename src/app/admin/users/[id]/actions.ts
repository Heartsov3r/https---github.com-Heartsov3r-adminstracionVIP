'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAdminAction } from '@/app/admin/logs/actions'

export async function getUserDetails(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      memberships (
        *,
        plan:plans (
          *
        ),
        payments:manual_payments (
          *,
          payment_receipts (
            *
          )
        )
      )
    `)
    .eq('id', userId)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  // Encontrar membresía activa/más reciente
  let latestMembership = null
  if (data.memberships && data.memberships.length > 0) {
    latestMembership = [...data.memberships].sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
    )[0]
  }

  return { 
    data: { ...data, latestMembership }, 
    error: null 
  }
}

export async function updateUserProfile(userId: string, formData: FormData) {
  const supabase = await createClient()
  
  const fullName = (formData.get('fullName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || ''
  const email = (formData.get('email') as string)?.trim() || ''
  const password = (formData.get('password') as string)?.trim() || ''

  if (!fullName || !email) {
    return { error: 'El nombre y el correo son obligatorios' }
  }

  // Actualizar la tabla pública Profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone: phone })
    .eq('id', userId)

  if (profileError) {
    return { error: profileError.message }
  }

  // Actualizar Credentials en Auth.Users vía admin SDK
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (serviceRoleKey) {
    const adminSupabase = await createAdminClient()

    const updateData: any = {
      email: email,
      user_metadata: { full_name: fullName, phone: phone }
    }
    
    if (password) {
      updateData.password = password
    }

    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      userId,
      updateData
    )

    if (authError) {
       console.error("Error al actualizar auth.users:", authError.message)
       // Si el email falla (Ej. ya existe), retornamos error parcial, pero el profile se actualizó.
       return { error: `Perfil actualizado, pero falló credenciales: ${authError.message}` }
    }
  }

  await logAdminAction('UPDATE_USER', `Actualizó datos personales del cliente: ${fullName}`, userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function addMembershipDays(userId: string, currentMembershipId: string | null, daysToAdd: number, reason: string) {
  const supabase = await createClient()

  if (!reason || reason.trim().length === 0) {
    return { error: 'El motivo es obligatorio.' }
  }

  if (!currentMembershipId) {
    // Si no tiene membresía activa, creamos una desde hoy
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysToAdd)

    const { error } = await supabase.from('memberships').insert({
      user_id: userId,
      plan_id: null, // "Custom" plan
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    })

    if (error) return { error: error.message }

  } else {
    // Si ya existe, le sumamos los días a su fecha de expedición
    const { data: memData } = await supabase.from('memberships').select('end_date').eq('id', currentMembershipId).single()
    if (!memData) return { error: 'Membresía no encontrada' }

    const newEndDate = new Date(memData.end_date)
    newEndDate.setDate(newEndDate.getDate() + daysToAdd)

    const { error } = await supabase.from('memberships')
      .update({ end_date: newEndDate.toISOString() })
      .eq('id', currentMembershipId)

    if (error) return { error: error.message }
  }

  await logAdminAction('ADD_DAYS', `Añadió ${daysToAdd} días extra. Motivo: ${reason.trim()}`, userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function subtractMembershipDays(userId: string, currentMembershipId: string | null, daysToSubtract: number, reason: string) {
  const supabase = await createClient()

  if (!reason || reason.trim().length === 0) {
    return { error: 'El motivo es obligatorio.' }
  }

  if (!currentMembershipId) {
    return { error: 'El cliente no tiene una membresía activa para restar días.' }
  }

  const { data: memData } = await supabase.from('memberships').select('end_date, start_date').eq('id', currentMembershipId).single()
  if (!memData) return { error: 'Membresía no encontrada' }

  const newEndDate = new Date(memData.end_date)
  newEndDate.setDate(newEndDate.getDate() - daysToSubtract)

  // No permitir que end_date sea anterior a start_date
  if (newEndDate <= new Date(memData.start_date)) {
    return { error: 'No se pueden restar tantos días. La fecha final quedaría antes o igual al inicio de la membresía.' }
  }

  const { error } = await supabase.from('memberships')
    .update({ end_date: newEndDate.toISOString() })
    .eq('id', currentMembershipId)

  if (error) return { error: error.message }

  await logAdminAction('SUBTRACT_DAYS', `Restó ${daysToSubtract} días de la suscripción. Motivo: ${reason.trim()}`, userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return { success: true }
}

export async function changeMembershipPlan(userId: string, membershipId: string, newPlanId: string, reason: string) {
  const supabase = await createClient()

  if (!reason || reason.trim().length === 0) {
    return { error: 'El motivo es obligatorio.' }
  }

  // 1. Obtener datos del nuevo plan
  const { data: newPlan } = await supabase.from('plans').select('id, name, duration_days, price').eq('id', newPlanId).single()
  if (!newPlan) return { error: 'Plan no encontrado.' }

  // 2. Obtener membresía actual
  const { data: membership } = await supabase.from('memberships').select('start_date, plan_id, plans(name, price)').eq('id', membershipId).single()
  if (!membership) return { error: 'Membresía no encontrada.' }

  // 3. Recalcular end_date basado en start_date + duración del nuevo plan
  const startDate = new Date(membership.start_date)
  const newEndDate = new Date(startDate)
  newEndDate.setDate(startDate.getDate() + newPlan.duration_days)

  // 4. Actualizar membresía
  const { error } = await supabase.from('memberships')
    .update({ 
      plan_id: newPlanId, 
      end_date: newEndDate.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', membershipId)

  if (error) return { error: error.message }

  const oldPlan: any = membership.plans
  await logAdminAction(
    'CHANGE_PLAN', 
    `Cambió plan de "${oldPlan?.name || 'Sin plan'}" ($${oldPlan?.price || 0}) a "${newPlan.name}" ($${newPlan.price}). Motivo: ${reason.trim()}`, 
    userId
  )

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  revalidatePath('/admin/payments')
  return { success: true }
}

export async function addReferralBonus(userId: string, currentMembershipId: string | null, daysToAdd: number) {
  const supabase = await createClient()

  if (!currentMembershipId) {
    // Si no tiene membresía activa, creamos una desde hoy
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysToAdd)

    const { error } = await supabase.from('memberships').insert({
      user_id: userId,
      plan_id: null,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    })

    if (error) return { error: error.message }

  } else {
    // Si ya existe, le sumamos los días a su fecha de expedición
    const { data: memData } = await supabase.from('memberships').select('end_date').eq('id', currentMembershipId).single()
    if (!memData) return { error: 'Membresía no encontrada' }

    const newEndDate = new Date(memData.end_date)
    newEndDate.setDate(newEndDate.getDate() + daysToAdd)

    const { error } = await supabase.from('memberships')
      .update({ end_date: newEndDate.toISOString() })
      .eq('id', currentMembershipId)

    if (error) return { error: error.message }
  }

  await logAdminAction('REFERRAL_BONUS', `Bonificación manual: Añadió ${daysToAdd} días por referido`, userId)

  revalidatePath(`/admin/users/${userId}`)
  revalidatePath('/admin/users')
  return { success: true }
}
